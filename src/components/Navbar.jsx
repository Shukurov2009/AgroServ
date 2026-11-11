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
  Sparkles,
  Store,
  User,
  Wrench,
  X,
} from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { ROLES } from '../lib/constants'
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
  { to: '/narxlar', label: 'Narxlar' },
]

export default function Navbar() {
  const { currentUser, plan, cartCount, signOut } = useStore()
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

  function handleSignOut() {
    signOut()
    setUserMenu(false)
    navigate('/')
  }

  const roleInfo = currentUser ? ROLES[currentUser.role] : null

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-emerald-950 text-emerald-100/75 md:block">
        <div className="container-page flex h-9 items-center justify-between text-[11px] font-medium">
          <div className="flex items-center gap-5">
            <a href="tel:+998712000000" className="flex items-center gap-1.5 transition hover:text-white">
              <Phone size={12} /> +998 71 200 00 00
            </a>
            <a
              href="https://t.me/agroserv_uz"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition hover:text-white"
            >
              <Send size={12} /> @agroserv_uz
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-lime-300">
              <Sparkles size={12} /> Yangi: Plus tarifida komissiya 3%
            </span>
            <Link to="/narxlar" className="font-semibold text-white/90 underline-offset-4 hover:underline">
              Tariflar
            </Link>
          </div>
        </div>
      </div>

      <div className="glass border-b border-emerald-950/[0.06] shadow-[0_8px_30px_-24px_rgba(6,78,59,0.5)]">
        <div className="container-page flex h-[68px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-0.5 xl:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-2.5 py-2 text-[12.5px] font-semibold transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-stone-600 hover:bg-emerald-50/70 hover:text-emerald-800'
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
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-900/10 bg-white text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-50"
              aria-label="Savat"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-400 px-1 text-[10px] font-black text-emerald-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenu((value) => !value)}
                  className="flex items-center gap-2 rounded-xl border border-emerald-900/10 bg-white py-1.5 pl-1.5 pr-2 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-base">
                    {currentUser.avatar || roleInfo?.icon || '🌱'}
                  </span>
                  <span className="hidden sm:block">
                    <span className="block max-w-28 truncate text-xs font-bold text-emerald-950">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] font-medium text-stone-500">
                      {roleInfo?.label} · {plan.name}
                    </span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-stone-400 transition ${userMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenu && (
                  <div className="absolute right-0 mt-2 w-72 animate-fade-in overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-[0_24px_70px_-20px_rgba(6,78,59,0.35)]">
                    <div className="border-b border-emerald-900/5 bg-gradient-to-br from-emerald-50 to-lime-50 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                          {currentUser.avatar || '🌱'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-emerald-950">{currentUser.name}</p>
                          <p className="truncate text-xs text-stone-500">{currentUser.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-[11px]">
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
                        Buyurtmalar
                      </MenuLink>
                      <MenuLink to="/profil" icon={<User size={16} />} onClick={() => setUserMenu(false)}>
                        Profil va hamyon
                      </MenuLink>
                      {['seller', 'admin'].includes(currentUser.role) && (
                        <MenuLink to="/dokon" icon={<Store size={16} />} onClick={() => setUserMenu(false)}>
                          Mening do'konim
                        </MenuLink>
                      )}
                      {['worker', 'agronomist', 'admin'].includes(currentUser.role) && (
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
                        className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} /> Chiqish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                  Kirish
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-900/10 bg-white text-emerald-900 xl:hidden"
              aria-label="Menyu"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-b border-emerald-900/10 bg-white shadow-xl xl:hidden">
          <div className="container-page py-4">
            <nav className="grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      isActive ? 'bg-emerald-50 text-emerald-800' : 'text-stone-600 hover:bg-stone-50'
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
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
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
      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-stone-600 transition hover:bg-emerald-50 hover:text-emerald-800"
    >
      {icon}
      {children}
    </Link>
  )
}
