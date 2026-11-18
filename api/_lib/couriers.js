import { HttpError } from './http.js'
import { completeOrderPaymentEffects } from './payments.js'

export function orderPayout(settings, distanceKm) {
  const base = Math.max(0, Number(settings.deliveryBasePay) || 0)
  const rate = Math.max(0, Number(settings.deliveryRatePerKm) || 0)
  return Math.round(base + rate * (Number(distanceKm) || 0))
}

async function ensureBatch(client, courier) {
  const existing = await client.query(
    `SELECT * FROM courier_batches
     WHERE courier_id = $1 AND status = 'loading'
     ORDER BY created_at DESC LIMIT 1`,
    [courier.id],
  )
  if (existing.rows[0]) return { courier, batch: existing.rows[0] }
  const created = await client.query(
    'INSERT INTO courier_batches (courier_id) VALUES ($1) RETURNING *',
    [courier.id],
  )
  return { courier, batch: created.rows[0] }
}

// Navbatdagi bo'sh haydovchini "yuk yig'ish" holatiga o'tkazadi.
export async function ensureLoadingCourier(client) {
  const loading = await client.query(
    `SELECT * FROM users
     WHERE role = 'delivery' AND status = 'active' AND delivery_status = 'loading'
     ORDER BY delivery_queue_at ASC NULLS FIRST, created_at ASC
     LIMIT 1 FOR UPDATE`,
  )
  if (loading.rows[0]) return ensureBatch(client, loading.rows[0])

  const next = await client.query(
    `SELECT * FROM users
     WHERE role = 'delivery' AND status = 'active' AND delivery_status = 'idle'
     ORDER BY delivery_queue_at ASC NULLS FIRST, created_at ASC
     LIMIT 1 FOR UPDATE SKIP LOCKED`,
  )
  if (!next.rows[0]) return null

  const updated = await client.query(
    `UPDATE users
     SET delivery_status = 'loading', delivery_queue_at = now(), updated_at = now()
     WHERE id = $1 RETURNING *`,
    [next.rows[0].id],
  )
  return ensureBatch(client, updated.rows[0])
}

export async function recalcBatch(client, batchId) {
  if (!batchId) return
  const aggregate = await client.query(
    `SELECT count(*)::int AS order_count,
            coalesce(sum(total), 0)::bigint AS total_amount,
            coalesce(sum(distance_km), 0)::numeric AS total_distance,
            coalesce(sum(courier_payout), 0)::bigint AS payout
     FROM orders
     WHERE courier_batch_id = $1 AND status <> 'cancelled'`,
    [batchId],
  )
  const row = aggregate.rows[0]
  await client.query(
    `UPDATE courier_batches
     SET order_count = $1, total_amount = $2, total_distance = $3, payout = $4
     WHERE id = $5`,
    [row.order_count, row.total_amount, row.total_distance, row.payout, batchId],
  )
}

export async function assignOrderToCourier(client, orderId, settings) {
  const result = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId])
  const order = result.rows[0]
  if (!order || order.courier_id || order.status === 'cancelled' || order.status === 'completed') return null
  if (order.type !== 'product') return null
  const deliverable = order.payment_status === 'paid' || order.payment_method === 'cash'
  if (!deliverable) return null

  const slot = await ensureLoadingCourier(client)
  if (!slot) return null

  await client.query(
    `UPDATE orders
     SET courier_id = $1, courier_batch_id = $2, courier_payout = $3, updated_at = now()
     WHERE id = $4`,
    [slot.courier.id, slot.batch.id, orderPayout(settings, order.distance_km), orderId],
  )
  await recalcBatch(client, slot.batch.id)
  return slot.courier
}

export async function assignPendingOrders(client, settings) {
  const pending = await client.query(
    `SELECT id FROM orders
     WHERE courier_id IS NULL
       AND type = 'product'
       AND status NOT IN ('cancelled', 'completed')
       AND (payment_status = 'paid' OR payment_method = 'cash')
     ORDER BY created_at ASC`,
  )
  for (const row of pending.rows) {
    const courier = await assignOrderToCourier(client, row.id, settings)
    if (!courier) break
  }
}

export async function markBatchFull(client, courierId, settings) {
  const courierResult = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [courierId])
  const courier = courierResult.rows[0]
  if (!courier || courier.role !== 'delivery') {
    throw new HttpError(403, 'Bu amal faqat yetkazib beruvchi uchun', 'FORBIDDEN')
  }
  if (courier.delivery_status !== 'loading') {
    throw new HttpError(400, "Hozir yuk yig'ilmayapti", 'NOT_LOADING')
  }
  const batchResult = await client.query(
    `SELECT * FROM courier_batches
     WHERE courier_id = $1 AND status = 'loading'
     ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
    [courierId],
  )
  const batch = batchResult.rows[0]
  if (!batch) throw new HttpError(400, "Faol yuklash partiyasi yo'q", 'NO_BATCH')
  if (Number(batch.order_count) < 1) {
    throw new HttpError(400, "Mashina hali bo'sh. Kamida bitta buyurtma biriktirilishini kuting.", 'EMPTY_BATCH')
  }

  const updatedBatch = await client.query(
    `UPDATE courier_batches SET status = 'delivering', full_at = now() WHERE id = $1 RETURNING *`,
    [batch.id],
  )
  await client.query(
    `UPDATE users SET delivery_status = 'delivering', updated_at = now() WHERE id = $1`,
    [courierId],
  )
  const next = await ensureLoadingCourier(client)
  await assignPendingOrders(client, settings)

  return {
    batch: updatedBatch.rows[0],
    nextCourier: next?.courier?.name || '',
  }
}

export async function markBatchDelivered(client, courierId, settings) {
  const courierResult = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [courierId])
  const courier = courierResult.rows[0]
  if (!courier || courier.role !== 'delivery') {
    throw new HttpError(403, 'Bu amal faqat yetkazib beruvchi uchun', 'FORBIDDEN')
  }
  if (courier.delivery_status !== 'delivering') {
    throw new HttpError(400, "Hozir yo'lda emassiz", 'NOT_DELIVERING')
  }
  const batchResult = await client.query(
    `SELECT * FROM courier_batches
     WHERE courier_id = $1 AND status = 'delivering'
     ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
    [courierId],
  )
  const batch = batchResult.rows[0]
  if (!batch) throw new HttpError(400, "Faol yetkazish partiyasi yo'q", 'NO_BATCH')

  const orders = await client.query(
    'SELECT * FROM orders WHERE courier_batch_id = $1 FOR UPDATE',
    [batch.id],
  )
  let deliveredCount = 0
  for (const order of orders.rows) {
    if (order.status === 'cancelled') continue
    if (order.status !== 'completed') {
      await completeOrderPaymentEffects(client, order)
      await client.query(
        `UPDATE orders SET status = 'completed', delivered_at = now(), updated_at = now() WHERE id = $1`,
        [order.id],
      )
      deliveredCount += 1
    } else {
      await client.query('UPDATE orders SET delivered_at = now() WHERE id = $1', [order.id])
    }
  }

  const updatedBatch = await client.query(
    `UPDATE courier_batches SET status = 'delivered', delivered_at = now() WHERE id = $1 RETURNING *`,
    [batch.id],
  )
  await client.query(
    `UPDATE users
     SET delivery_status = 'idle', delivery_queue_at = now(), updated_at = now()
     WHERE id = $1`,
    [courierId],
  )
  await ensureLoadingCourier(client)
  await assignPendingOrders(client, settings)

  return { batch: updatedBatch.rows[0], deliveredCount }
}

export async function payBatch(client, batchId) {
  const result = await client.query('SELECT * FROM courier_batches WHERE id = $1 FOR UPDATE', [batchId])
  const batch = result.rows[0]
  if (!batch) throw new HttpError(404, 'Partiya topilmadi', 'BATCH_NOT_FOUND')
  if (batch.status !== 'delivered') {
    throw new HttpError(400, "Faqat topshirilgan partiyaga haq to'lanadi", 'BAD_BATCH_STATUS')
  }
  if (batch.paid) throw new HttpError(400, "Bu partiya allaqachon to'langan", 'ALREADY_PAID')
  const payout = Number(batch.payout)
  if (payout <= 0) throw new HttpError(400, "To'lanadigan summa yo'q", 'ZERO_PAYOUT')

  const updated = await client.query(
    'UPDATE users SET wallet = wallet + $1, updated_at = now() WHERE id = $2 RETURNING wallet',
    [payout, batch.courier_id],
  )
  await client.query(
    `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
     VALUES ($1, 'delivery_payout', $2, $3, $4, $5, 'wallet', 'completed')`,
    [
      batch.courier_id,
      payout,
      Number(updated.rows[0]?.wallet || 0),
      `Yetkazish partiyasi haqi (${batch.order_count} ta buyurtma, ${Number(batch.total_distance)} km)`,
      batch.id,
    ],
  )
  const paid = await client.query(
    'UPDATE courier_batches SET paid = true WHERE id = $1 RETURNING *',
    [batchId],
  )
  return paid.rows[0]
}
