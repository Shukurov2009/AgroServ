import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  ShoppingCart,
  Store,
  User,
  Wrench,
  X,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { ROLES, canSellProducts, canOfferServices } from '../lib/constants'
import { formatNumber } from '../lib/format'
import Logo from './Logo'

const NAV_ITEMS = [
  { to: '/', label: 'Bosh sahifa' },
  { to: '/bozor', label: 'Bozor' },
  { to: '/xizmatlar', label: 'Xizmatlar' },
  { to: '/ishlar', label: "Ish o'rinlari" },
  { to: '/videolar', label: 'Videolar' },
  { to: '/ai-maslahatchi', label: 'AI maslahatchi' },
  { to: '/haqida', label: 'Haqida' },
]

export default function Navbar() {
  const { currentUser, cartCount, signOut } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    setMobileOpen(false)
    setUserMenu(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await signOut()
    setUserMenu(false)
    navigate('/')
  }

  const roleInfo = currentUser ? ROLES[currentUser.role] : null

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-emerald-950 text-emerald-100/75 md:block">
        <div className="container-page flex h-9 items-center justify-between text-[11px] font-semibold">
          <div className="flex items-center gap-5">
            <a href="tel:+998712000000" className="flex items-center gap-1.5 transition hover:text-lime-300">
              <Phone size={12} /> +998 71 200 00 00
            </a>
            <a
              href="https://t.me/agroserv_uz"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition hover:text-lime-300"
            >
              <Send size={12} /> @agroserv_uz
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-lime-300">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
              Obuna yo'q — 5% savdo komissiyasi
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-emerald-950/10 bg-cream/80 shadow-[0_18px_40px_-34px_rgba(8,31,19,0.65)] backdrop-blur-2xl">
        <div className="container-page flex h-[74px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 xl:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-[12.5px] font-bold tracking-tight transition ${
                    isActive
                      ? 'bg-emerald-950 text-lime-300 shadow-[0_10px_22px_-14px_rgba(8,31,19,0.9)]'
                      : 'text-emerald-900/70 hover:bg-white/70 hover:text-emerald-950'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/savat"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-950/10 bg-white/70 text-emerald-900 backdrop-blur transition hover:border-lime-500/60 hover:bg-white"
              aria-label="Savat"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-400 px-1 text-[10px] font-black text-emerald-950 shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenu((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white/70 py-1.5 pl-1.5 pr-2.5 text-left backdrop-blur transition hover:border-lime-500/60 hover:bg-white"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-200/70 text-base">
                    {currentUser.avatar || roleInfo?.icon || '🌱'}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block max-w-28 truncate text-xs font-extrabold text-emerald-950">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] font-semibold text-stone-500">
                      {roleInfo?.label}
                    </span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-stone-400 transition ${userMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenu && (
                  <div className="absolute right-0 mt-2 w-72 animate-fade-in overflow-hidden rounded-[1.6rem] border border-white/80 bg-[#fffdf6] shadow-[0_30px_80px_-28px_rgba(8,31,19,0.45)]">
                    <div className="border-b border-emerald-900/5 bg-gradient-to-br from-lime-100/70 to-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                          {currentUser.avatar || '🌱'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-extrabold text-emerald-950">{currentUser.name}</p>
                          <p className="truncate text-xs text-stone-500">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-[11px]">
                        <span className="font-semibold text-stone-500">Hamyon</span>
                        <span className="font-black text-emerald-700">
                          {formatNumber(currentUser.wallet)} so'm
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <MenuLink to="/kabinet" icon={<LayoutDashboard size={16} />} onClick={() => setUserMenu(false)}>
                        Kabinet
                      </MenuLink>
                      <MenuLink to="/buyurtmalar" icon={<ShoppingCart size={16} />} onClick={() => setUserMenu(false)}>
                        {currentUser.role === 'delivery' ? 'Yetkazib berish' : 'Buyurtmalar'}
                      </MenuLink>
                      <MenuLink to="/profil" icon={<User size={16} />} onClick={() => setUserMenu(false)}>
                        Profil va hamyon
                      </MenuLink>
                      {canSellProducts(currentUser.role) && (
                        <MenuLink to="/dokon" icon={<Store size={16} />} onClick={() => setUserMenu(false)}>
                          Mening do'konim
                        </MenuLink>
                      )}
                      {canOfferServices(currentUser.role) && (
                        <MenuLink to="/xizmatlarim" icon={<Wrench size={16} />} onClick={() => setUserMenu(false)}>
                          Mening xizmatlarim
                        </MenuLink>
                      )}
                      {currentUser.role === 'admin' && (
                        <MenuLink to="/admin" icon={<ShieldCheck size={16} />} onClick={() => setUserMenu(false)}>
                          Admin panel
                        </MenuLink>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} /> Chiqish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="hidden sm:block">
                  <Link to="/login" className="btn btn-ghost btn-sm">
                    Kirish
                  </Link>
                </div>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <span className="hidden sm:inline">Ro'yxatdan o'tish</span>
                  <span className="sm:hidden">Ro'yxat</span>
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-950/10 bg-white/70 text-emerald-900 backdrop-blur xl:hidden"
              aria-label="Menyu"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-b border-emerald-950/10 bg-cream/95 shadow-xl backdrop-blur-2xl xl:hidden">
          <div className="container-page py-4">
            <nav className="grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm font-bold ${
                      isActive
                        ? 'bg-emerald-950 text-lime-300'
                        : 'text-emerald-900/70 hover:bg-white/70'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {!currentUser && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link to="/login" className="btn btn-secondary">
                  Kirish
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
            {currentUser && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/70 px-3 py-2.5">
                <span className="text-sm font-bold text-emerald-900">
                  {currentUser.avatar} {currentUser.name}
                </span>
                <Link to="/kabinet" className="text-xs font-bold text-emerald-700">
                  Kabinet →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function MenuLink({ to, icon, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-600 transition hover:bg-lime-100/70 hover:text-emerald-900"
    >
      {icon}
      {children}
    </Link>
  )
}
