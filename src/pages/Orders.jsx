import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Receipt,
  ShoppingBag,
  Store,
  Truck,
  XCircle,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { ORDER_STATUS } from '../lib/constants'
import { formatDateTime, formatNumber, formatSom } from '../lib/format'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { StatusBadge } from '../components/Badges'

const FILTERS = [
  { id: 'all', label: 'Barchasi' },
  { id: 'pending', label: "To'lov kutilmoqda" },
  { id: 'paid', label: "To'langan" },
  { id: 'processing', label: 'Jarayonda' },
  { id: 'shipped', label: "Yo'lda" },
  { id: 'completed', label: 'Yakunlangan' },
  { id: 'cancelled', label: 'Bekor qilingan' },
]

export default function Orders() {
  const { orders, currentUser, isAdmin, updateOrderStatus } = useStore()
  const [filter, setFilter] = useState('all')
  const [scope, setScope] = useState('my')
  const [detail, setDetail] = useState(null)

  const isSeller = currentUser?.role === 'seller' || isAdmin

  const myOrders = useMemo(
    () => orders.filter((order) => order.buyerId === currentUser?.id),
    [orders, currentUser],
  )
  const sellerOrders = useMemo(
    () =>
      orders
        .filter((order) => order.items.some((item) => item.sellerId === currentUser?.id))
        .map((order) => ({
          ...order,
          items: order.items.filter((item) => item.sellerId === currentUser?.id),
        })),
    [orders, currentUser],
  )

  const base = scope === 'sales' && isSeller ? sellerOrders : myOrders
  const filtered = filter === 'all' ? base : base.filter((order) => order.status === filter)

  const counts = {
    all: base.length,
    pending: base.filter((order) => order.status === 'pending').length,
    paid: base.filter((order) => order.status === 'paid').length,
    processing: base.filter((order) => order.status === 'processing').length,
    shipped: base.filter((order) => order.status === 'shipped').length,
    completed: base.filter((order) => order.status === 'completed').length,
    cancelled: base.filter((order) => order.status === 'cancelled').length,
  }

  const totalSpent = myOrders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)
  const totalEarned = sellerOrders
    .filter((order) => ['paid', 'processing', 'shipped', 'completed'].includes(order.status))
    .reduce((sum, order) => sum + order.subtotal - order.platformFee, 0)

  async function cancelOrder(order) {
    if (!window.confirm('Buyurtmani bekor qilmoqchimisiz? To\'langan summa hamyoningizga qaytariladi.')) return
    const result = await updateOrderStatus(order.id, 'cancelled')
    if (result.ok) {
      toast.success('Buyurtma bekor qilindi')
      setDetail(null)
    } else {
      toast.error(result.error)
    }
  }

  async function advance(order) {
    const flow = ['pending', 'paid', 'processing', 'shipped', 'completed']
    const index = flow.indexOf(order.status)
    const next = flow[index + 1]
    if (!next) return
    const result = await updateOrderStatus(order.id, next)
    if (result.ok) {
      toast.success(`Holat «${ORDER_STATUS[next].label}» ga o'zgartirildi`)
      setDetail({ ...order, status: next })
    } else {
      toast.error(result.error)
    }
  }

  async function confirmReceipt(order) {
    const result = await updateOrderStatus(order.id, 'completed')
    if (result.ok) {
      toast.success('Buyurtma yakunlandi. Sharh qoldirishingiz mumkin!')
      setDetail(null)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="bg-cream">
      <div className="container-page py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
              <span className="h-px w-6 bg-emerald-500" /> Buyurtmalar
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-emerald-950 sm:text-3xl">
              Buyurtmalar tarixi
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              {scope === 'sales' ? 'Sizning mahsulotlaringiz bo\'yicha savdolar' : 'Sizning xaridlaringiz va holati'}
            </p>
          </div>
          <Link to="/bozor" className="btn btn-secondary btn-sm">
            <ShoppingBag size={14} /> Yangi xarid
          </Link>
        </div>

        {isSeller && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => { setScope('my'); setFilter('all') }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                scope === 'my' ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 hover:bg-emerald-50'
              }`}
            >
              <ShoppingBag size={14} /> Mening xaridlarim ({myOrders.length})
            </button>
            <button
              type="button"
              onClick={() => { setScope('sales'); setFilter('all') }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                scope === 'sales' ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 hover:bg-emerald-50'
              }`}
            >
              <Store size={14} /> Savdolarim ({sellerOrders.length})
            </button>
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="card flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Receipt size={18} />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Jami buyurtma</p>
              <p className="text-lg font-black text-emerald-950">{base.length} ta</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <Clock size={18} />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">Faol</p>
              <p className="text-lg font-black text-emerald-950">
                {base.filter((order) => ['pending', 'paid', 'processing', 'shipped'].includes(order.status)).length} ta
              </p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-stone-400">
                {scope === 'sales' ? 'Tushum' : 'Sarflangan'}
              </p>
              <p className="text-lg font-black text-emerald-950">
                {formatNumber(scope === 'sales' ? totalEarned : totalSpent)}
                <span className="ml-1 text-[10px] font-semibold text-stone-400">so'm</span>
              </p>
            </div>
          </div>
        </div>

        <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                filter === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-600 hover:bg-emerald-50'
              }`}
            >
              {item.label}
              {counts[item.id] > 0 && (
                <span className={`rounded-full px-1.5 text-[9px] ${filter === item.id ? 'bg-white/20' : 'bg-stone-100 text-stone-500'}`}>
                  {counts[item.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2.5">
          {filtered.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Buyurtma topilmadi"
              description={
                filter === 'all'
                  ? scope === 'sales'
                    ? "Hozircha sizning mahsulotlaringiz bo'yicha buyurtma yo'q."
                    : "Hozircha buyurtma yo'q. Bozordan mahsulot tanlab, birinchi xaridni qiling."
                  : "Bu holatda buyurtma mavjud emas. Boshqa filtrni tanlab ko'ring."
              }
              action="Bozorga o'tish"
              actionTo="/bozor"
            />
          ) : (
            filtered.map((order) => {
              const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending
              const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0)
              return (
                <div key={order.id} className="card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 bg-stone-50/60 px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="font-black text-emerald-950">{order.number}</span>
                      <span className="text-stone-300">|</span>
                      <span className="text-stone-500">{formatDateTime(order.createdAt)}</span>
                    </div>
                    <StatusBadge label={status.label} className={status.className} />
                  </div>

                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item) => (
                        <span
                          key={`${item.refId}-${item.type}`}
                          className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white bg-stone-100 text-xl shadow-sm"
                          title={item.title}
                        >
                          {item.emoji}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white bg-emerald-100 text-[10px] font-black text-emerald-700">
                          +{order.items.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-bold text-emerald-950">
                        {order.items.map((item) => item.title).join(', ')}
                      </p>
                      <p className="mt-0.5 text-[10px] text-stone-400">
                        {itemCount} birlik · {order.items.length} xil tur · {order.paymentMethod === 'card' ? 'Karta' : order.paymentMethod === 'wallet' ? 'Hamyon' : 'Naqd'}
                      </p>
                      {order.info?.address && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-stone-400">
                          <Truck size={10} /> {order.info.region}, {order.info.address}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="text-base font-black text-emerald-800">{formatSom(order.total)}</p>
                        {order.discount > 0 && (
                          <p className="text-[9px] font-semibold text-emerald-600">−{formatNumber(order.discount)} chegirma</p>
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setDetail(order)} className="btn btn-secondary btn-sm">
                          Batafsil
                        </button>
                        {scope === 'my' && ['pending', 'paid', 'processing'].includes(order.status) && (
                          <button type="button" onClick={() => cancelOrder(order)} className="btn btn-danger btn-sm">
                            Bekor qilish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `Buyurtma ${detail.number}` : ''}
        subtitle={detail ? formatDateTime(detail.createdAt) : ''}
        size="lg"
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 p-3">
              <StatusBadge
                label={(ORDER_STATUS[detail.status] || ORDER_STATUS.pending).label}
                className={(ORDER_STATUS[detail.status] || ORDER_STATUS.pending).className}
              />
              <div className="flex gap-2">
                {scope === 'sales' && !isAdmin && ['paid', 'processing', 'shipped'].includes(detail.status) && (
                  <button type="button" onClick={() => advance(detail)} className="btn btn-primary btn-sm">
                    Keyingi holat
                  </button>
                )}
                {isAdmin && detail.status !== 'completed' && detail.status !== 'cancelled' && (
                  <button type="button" onClick={() => advance(detail)} className="btn btn-primary btn-sm">
                    Holatni o'zgartirish
                  </button>
                )}
                {scope === 'my' && detail.status === 'shipped' && (
                  <button type="button" onClick={() => confirmReceipt(detail)} className="btn btn-primary btn-sm">
                    <CheckCircle2 size={13} /> Qabul qildim
                  </button>
                )}
                {detail.status === 'pending' && scope === 'my' && (
                  <button type="button" onClick={() => cancelOrder(detail)} className="btn btn-danger btn-sm">
                    <XCircle size={13} /> Bekor qilish
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-stone-400">Mahsulotlar</p>
              <div className="space-y-1.5">
                {detail.items.map((item) => (
                  <div key={`${item.refId}-${item.type}`} className="flex items-center gap-2.5 rounded-xl border border-stone-100 p-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-lg">
                      {item.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      {item.type === 'product' ? (
                        <Link to={`/mahsulot/${item.refId}`} className="line-clamp-1 text-[11px] font-bold text-emerald-950 hover:text-emerald-700">
                          {item.title}
                        </Link>
                      ) : (
                        <Link to={`/xizmatlar/${item.refId}`} className="line-clamp-1 text-[11px] font-bold text-emerald-950 hover:text-emerald-700">
                          {item.title}
                        </Link>
                      )}
                      <p className="text-[9px] text-stone-400">
                        {item.qty} {item.unit} × {formatNumber(item.price)} so'm · {item.sellerName}
                      </p>
                    </div>
                    <span className="text-[11px] font-black text-emerald-800">{formatNumber(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-stone-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-wide text-stone-400">Yetkazib berish</p>
                <p className="mt-1 text-[11px] font-bold text-emerald-950">{detail.info?.name}</p>
                <p className="text-[10px] text-stone-500">{detail.info?.phone}</p>
                <p className="text-[10px] text-stone-500">{detail.info?.region}, {detail.info?.address}</p>
                {detail.info?.note && <p className="mt-1 text-[10px] italic text-stone-400">“{detail.info.note}”</p>}
              </div>
              <div className="rounded-xl bg-stone-50 p-3">
                <p className="text-[9px] font-black uppercase tracking-wide text-stone-400">To'lov</p>
                <div className="mt-1.5 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Mahsulotlar</span>
                    <span className="font-semibold text-emerald-950">{formatSom(detail.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Yetkazish</span>
                    <span className="font-semibold text-emerald-950">{detail.delivery ? formatSom(detail.delivery) : 'Bepul'}</span>
                  </div>
                  {detail.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Chegirma {detail.promoCode && `(${detail.promoCode})`}</span>
                      <span className="font-semibold">−{formatSom(detail.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-stone-200 pt-1 text-xs">
                    <span className="font-black text-emerald-950">Jami</span>
                    <span className="font-black text-emerald-800">{formatSom(detail.total)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Komissiya</span>
                    <span>{formatSom(detail.platformFee)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>To'lov usuli</span>
                    <span>{detail.paymentMethod === 'card' ? 'Karta' : detail.paymentMethod === 'wallet' ? 'Hamyon' : 'Naqd'}</span>
                  </div>
                </div>
              </div>
            </div>

            {detail.status === 'completed' && scope === 'my' && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
                  <MessageSquare size={14} /> Xizmat sifati haqida fikr bildiring
                </p>
                <Link
                  to={`/mahsulot/${detail.items.find((item) => item.type === 'product')?.refId || ''}`}
                  onClick={() => setDetail(null)}
                  className="text-[10px] font-black text-emerald-700 underline"
                >
                  Sharh qoldirish
                </Link>
              </div>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setDetail(null)} className="btn btn-secondary flex-1">
                Yopish
              </button>
              {scope === 'my' && ['paid', 'processing'].includes(detail.status) && (
                <button type="button" onClick={() => cancelOrder(detail)} className="btn btn-danger">
                  <XCircle size={14} /> Bekor qilish
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
