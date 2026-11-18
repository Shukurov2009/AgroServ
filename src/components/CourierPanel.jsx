import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  Clock,
  MapPin,
  PackageCheck,
  Route,
  Truck,
  Wallet,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { BATCH_STATUS, COURIER_STATUS } from '../lib/constants'
import { formatDateTime, formatNumber, formatSom } from '../lib/format'

export default function CourierPanel() {
  const {
    currentUser,
    orders,
    courierBatches,
    courierMarkFull,
    courierMarkDelivered,
  } = useStore()
  const [busy, setBusy] = useState(false)

  const status = currentUser?.deliveryStatus || 'idle'
  const statusInfo = COURIER_STATUS[status] || COURIER_STATUS.idle

  const activeBatch = useMemo(
    () => courierBatches.find((batch) => ['loading', 'delivering'].includes(batch.status)),
    [courierBatches],
  )
  const batchOrders = useMemo(
    () =>
      activeBatch
        ? orders.filter(
            (order) => order.courierBatchId === activeBatch.id && order.status !== 'cancelled',
          )
        : [],
    [orders, activeBatch],
  )
  const deliveredBatches = useMemo(
    () => courierBatches.filter((batch) => batch.status === 'delivered'),
    [courierBatches],
  )
  const unpaidBatches = deliveredBatches.filter((batch) => !batch.paid)
  const unpaidTotal = unpaidBatches.reduce((sum, batch) => sum + batch.payout, 0)
  const lastPaid = deliveredBatches.find((batch) => batch.paid)

  const totalDistance = batchOrders.reduce((sum, order) => sum + (order.distanceKm || 0), 0)
  const payout = batchOrders.reduce((sum, order) => sum + (order.courierPayout || 0), 0)

  async function handleMarkFull() {
    if (!activeBatch || activeBatch.orderCount < 1) {
      toast.error("Mashina hali bo'sh. Kamida bitta buyurtma biriktirilishini kuting.")
      return
    }
    if (
      !window.confirm(
        `Mashina to'ldi deb belgilaysizmi? ${activeBatch.orderCount} ta buyurtma yo'lga chiqadi va keyingi haydovchi navbatga tushadi.`,
      )
    ) {
      return
    }
    setBusy(true)
    const result = await courierMarkFull()
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(
      result.nextCourier
        ? `Mashina to'ldi. Keyingi navbat: ${result.nextCourier}`
        : "Mashina to'ldi. Boshqa bo'sh haydovchi yo'q — keyingi buyurtma sizga biriktiriladi.",
    )
  }

  async function handleMarkDelivered() {
    if (
      !window.confirm(
        `Buyurtmalar topshirildi deb belgilaysizmi? ${activeBatch?.orderCount || 0} ta buyurtma yakunlanadi va siz navbatning oxiriga o'tasiz.`,
      )
    ) {
      return
    }
    setBusy(true)
    const result = await courierMarkDelivered()
    setBusy(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(
      `Buyurtmalar topshirildi. ${result.deliveredCount || 0} ta buyurtma yakunlandi.`,
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative overflow-hidden bg-emerald-950 px-4 py-4 text-white">
        <div className="pattern-grid absolute inset-0 opacity-25" />
        <div className="relative flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lime-300">
              <Truck size={18} />
            </span>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-lime-300">
                Kuryer paneli
              </p>
              <p className="text-sm font-black">Navbat holati</p>
            </div>
          </div>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {status === 'idle' && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-[11px] leading-relaxed text-stone-600">
            <p className="flex items-center gap-1.5 font-black text-emerald-950">
              <Clock size={13} /> Siz navbatdasiz
            </p>
            <p className="mt-1">
              Navbatingiz kelganda yuk avtomatik biriktiriladi. Yangi buyurtmalar kelishi bilan
              «Yuk yig‘ilmoqda» holatiga o‘tasiz. Ilovani yopib qo‘ymang — sahifa yangilanganda
              holat ko‘rinadi.
            </p>
          </div>
        )}

        {activeBatch && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                  Faol partiya
                </p>
                <p className="text-[11px] font-black text-emerald-950">
                  {BATCH_STATUS[activeBatch.status]?.label || activeBatch.status} ·{' '}
                  {activeBatch.orderCount} ta buyurtma
                </p>
              </div>
              <p className="text-[10px] font-semibold text-stone-500">
                {activeBatch.startedAt ? formatDateTime(activeBatch.startedAt) : ''}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-stone-100 bg-white p-2.5">
                <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-stone-400">
                  <PackageCheck size={10} /> Buyurtma
                </p>
                <p className="mt-0.5 text-sm font-black text-emerald-950">
                  {activeBatch.orderCount} ta
                </p>
              </div>
              <div className="rounded-xl border border-stone-100 bg-white p-2.5">
                <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-stone-400">
                  <Route size={10} /> Masofa
                </p>
                <p className="mt-0.5 text-sm font-black text-emerald-950">
                  {formatNumber(Math.round(activeBatch.totalDistance || totalDistance))}
                  <span className="ml-0.5 text-[9px] font-semibold text-stone-400">km</span>
                </p>
              </div>
              <div className="rounded-xl border border-stone-100 bg-white p-2.5">
                <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-stone-400">
                  <Wallet size={10} /> Haq
                </p>
                <p className="mt-0.5 text-sm font-black text-emerald-700">
                  {formatNumber(activeBatch.payout || payout)}
                  <span className="ml-0.5 text-[9px] font-semibold text-stone-400">so'm</span>
                </p>
              </div>
            </div>

            {batchOrders.length > 0 && (
              <div className="max-h-44 space-y-1 overflow-y-auto">
                {batchOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start gap-2 rounded-lg border border-stone-100 px-2.5 py-2"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-sm">
                      {order.items?.[0]?.emoji || '📦'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-bold text-emerald-950">
                        {order.number} · {order.info?.name}
                      </p>
                      <p className="flex items-center gap-1 truncate text-[9px] text-stone-500">
                        <MapPin size={9} /> {order.info?.region}, {order.info?.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-800">
                        {formatSom(order.total)}
                      </p>
                      {order.distanceKm != null && (
                        <p className="text-[8px] text-stone-400">
                          {formatNumber(Math.round(order.distanceKm))} km
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {status === 'loading' && (
              <button
                type="button"
                onClick={handleMarkFull}
                disabled={busy || activeBatch.orderCount < 1}
                className="btn btn-primary w-full"
              >
                <PackageCheck size={15} />
                {busy ? 'Belgilanmoqda...' : "Mashina to'ldi — yo'lga chiqish"}
              </button>
            )}

            {status === 'delivering' && (
              <button
                type="button"
                onClick={handleMarkDelivered}
                disabled={busy}
                className="btn btn-primary w-full"
              >
                <CheckCircle2 size={15} />
                {busy ? 'Belgilanmoqda...' : 'Buyurtmalar topshirildi'}
              </button>
            )}

            {status === 'loading' && activeBatch.orderCount < 1 && (
              <p className="text-center text-[10px] text-amber-700">
                Hozircha buyurtma biriktirilmagan. Buyurtma tushishi bilan shu yerda ko‘rinadi.
              </p>
            )}
          </>
        )}

        {unpaidBatches.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-800">
            <p className="font-black">To‘lanmagan yetkazish haqi: {formatSom(unpaidTotal)}</p>
            <p className="mt-0.5">
              {unpaidBatches.length} ta topshirilgan partiya. Admin tasdiqlagach summa hamyoningizga
              tushadi.
            </p>
          </div>
        )}

        {lastPaid && (
          <p className="text-center text-[9px] text-stone-400">
            Oxirgi to‘langan partiya: {formatSom(lastPaid.payout)} ·{' '}
            {lastPaid.deliveredAt ? formatDateTime(lastPaid.deliveredAt) : ''}
          </p>
        )}
      </div>
    </div>
  )
}
