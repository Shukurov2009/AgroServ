import { query } from './db.js'
import { HttpError } from './http.js'

export async function validatePromo(code, scope, amount) {
  const normalized = String(code || '').trim().toUpperCase()
  if (!normalized) return { ok: false, error: 'Promo kodni kiriting' }
  const { rows } = await query('SELECT * FROM promo_codes WHERE code = $1 AND active = true', [normalized])
  const promo = rows[0]
  if (!promo) return { ok: false, error: 'Bunday promo kod topilmadi' }
  if (promo.scope !== scope) return { ok: false, error: "Bu promo kod ushbu to'lov uchun mos emas" }
  if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) {
    return { ok: false, error: 'Promo kod muddati tugagan' }
  }
  if (promo.max_uses != null && promo.uses >= promo.max_uses) {
    return { ok: false, error: 'Promo kod limiti tugagan' }
  }
  if (amount < Number(promo.min_total || 0)) {
    return {
      ok: false,
      error: `Promo kod ${new Intl.NumberFormat('uz-UZ').format(Number(promo.min_total))} so'mdan boshlab ishlaydi`,
    }
  }
  let discount = promo.type === 'percent' ? (amount * Number(promo.value)) / 100 : Number(promo.value)
  if (promo.max_discount) discount = Math.min(discount, Number(promo.max_discount))
  discount = Math.min(Math.round(discount), amount)
  return { ok: true, promo, discount }
}

export async function consumePromo(client, promoCode) {
  if (!promoCode) return
  await client.query('UPDATE promo_codes SET uses = uses + 1 WHERE code = $1', [promoCode])
}

export async function releasePromo(client, promoCode) {
  if (!promoCode) return
  await client.query('UPDATE promo_codes SET uses = GREATEST(0, uses - 1) WHERE code = $1', [promoCode])
}

export function sellerIncome(items) {
  return items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty) - Number(item.fee || 0), 0)
}

export function sellerFee(items) {
  return items.reduce((sum, item) => sum + Number(item.fee || 0), 0)
}

export function groupBySeller(items) {
  const groups = new Map()
  for (const item of items) {
    if (!item.sellerId) continue
    if (!groups.has(item.sellerId)) groups.set(item.sellerId, [])
    groups.get(item.sellerId).push(item)
  }
  return groups
}

export async function creditOrderSellers(client, order) {
  if (order.credited) return
  const items = Array.isArray(order.items) ? order.items : []
  const groups = groupBySeller(items)
  for (const [sellerId, sellerItems] of groups) {
    const income = sellerIncome(sellerItems)
    const updated = await client.query(
      'UPDATE users SET wallet = wallet + $1, updated_at = now() WHERE id = $2 RETURNING wallet',
      [income, sellerId],
    )
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
       VALUES ($1,'earning',$2,$3,$4,$5,$6,'completed')`,
      [
        sellerId,
        income,
        updated.rows[0] ? Number(updated.rows[0].wallet) : null,
        `${order.number} buyurtmasidan tushum`,
        order.id,
        order.payment_method,
      ],
    )
  }
  if (Number(order.commission_amount || 0) > 0) {
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, status)
       VALUES ($1,'commission',$2,NULL,$3,$4,$5,'completed')`,
      [
        order.buyer_id,
        Number(order.commission_amount || 0),
        `${order.number} buyurtmasi bo'yicha komissiya`,
        order.id,
        order.payment_method,
      ],
    )
  }
  await client.query('UPDATE orders SET credited = true, updated_at = now() WHERE id = $1', [order.id])
}

export async function applyPaidPayment(client, paymentId, providerTxId = null) {
  const paymentResult = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [paymentId])
  const payment = paymentResult.rows[0]
  if (!payment) throw new HttpError(404, "To'lov topilmadi", 'PAYMENT_NOT_FOUND')
  if (payment.status === 'paid') return payment
  if (payment.status === 'cancelled') throw new HttpError(400, "To'lov bekor qilingan", 'PAYMENT_CANCELLED')

  const userResult = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [payment.user_id])
  const user = userResult.rows[0]
  if (!user) throw new HttpError(404, 'Foydalanuvchi topilmadi', 'USER_NOT_FOUND')

  const amount = Number(payment.amount)
  let description = ''

  if (payment.purpose === 'wallet_topup') {
    const updated = await client.query(
      'UPDATE users SET wallet = wallet + $1, updated_at = now() WHERE id = $2 RETURNING wallet',
      [amount, user.id],
    )
    description = "Hamyonni to'ldirish"
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, provider_tx_id, status)
       VALUES ($1,'topup',$2,$3,$4,$5,$6,$7,'completed')`,
      [user.id, amount, Number(updated.rows[0].wallet), description, payment.id, payment.provider, providerTxId],
    )
  } else if (payment.purpose === 'plan') {
    throw new HttpError(
      410,
      "Obuna tariflari bekor qilindi. AgroServ endi to'liq bepul.",
      'PLANS_REMOVED',
    )
  } else if (payment.purpose === 'feature') {
    const productResult = await client.query(
      `UPDATE products SET featured = true, featured_until = now() + interval '30 days', updated_at = now()
       WHERE id = $1 RETURNING title`,
      [payment.reference],
    )
    if (!productResult.rows[0]) throw new HttpError(404, 'Mahsulot topilmadi', 'PRODUCT_NOT_FOUND')
    description = `Top mahsulot: ${productResult.rows[0].title}`
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, provider_tx_id, status)
       VALUES ($1,'feature',$2,$3,$4,$5,$6,$7,'completed')`,
      [user.id, -amount, Number(user.wallet), description, payment.id, payment.provider, providerTxId],
    )
  } else if (payment.purpose === 'order') {
    const orderResult = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [payment.reference])
    const order = orderResult.rows[0]
    if (!order) throw new HttpError(404, 'Buyurtma topilmadi', 'ORDER_NOT_FOUND')
    if (Number(order.total) !== amount) {
      throw new HttpError(400, "To'lov summasi buyurtma summasiga mos emas", 'AMOUNT_MISMATCH')
    }
    await client.query(
      `UPDATE orders
       SET payment_status = 'paid',
           status = CASE WHEN status = 'pending' THEN 'processing' ELSE status END,
           updated_at = now()
       WHERE id = $1`,
      [order.id],
    )
    await creditOrderSellers(client, order)
    const buyerResult = await client.query('SELECT wallet FROM users WHERE id = $1', [order.buyer_id])
    await client.query(
      `INSERT INTO transactions (user_id, type, amount, balance_after, description, reference, provider, provider_tx_id, status)
       VALUES ($1,'purchase',$2,$3,$4,$5,$6,$7,'completed')`,
      [
        order.buyer_id,
        -amount,
        Number(buyerResult.rows[0]?.wallet || 0),
        `${order.number} buyurtma to'lovi`,
        order.id,
        payment.provider,
        providerTxId,
      ],
    )
    description = `${order.number} buyurtma to'lovi`
  } else {
    throw new HttpError(400, "To'lov maqsadi noto'g'ri", 'BAD_PURPOSE')
  }

  const updatedPayment = await client.query(
    `UPDATE payments SET status = 'paid', provider_tx_id = COALESCE($1, provider_tx_id), paid_at = now()
     WHERE id = $2 RETURNING *`,
    [providerTxId, payment.id],
  )
  return updatedPayment.rows[0]
}
