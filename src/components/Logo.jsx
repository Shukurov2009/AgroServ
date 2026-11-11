import { Link } from 'react-router-dom'

export default function Logo({ light = false, small = false }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="AgroServ bosh sahifa">
      <img
        src="/logo.svg"
        alt=""
        className={`${small ? 'h-9 w-9' : 'h-11 w-11'} rounded-[14px] shadow-sm transition-transform duration-300 group-hover:scale-105`}
      />
      <span className="leading-none">
        <span
          className={`block ${small ? 'text-lg' : 'text-[21px]'} font-black tracking-tight ${
            light ? 'text-white' : 'text-emerald-950'
          }`}
        >
          Agro<span className="text-lime-500">Serv</span>
        </span>
        {!small && (
          <span
            className={`mt-1 block text-[9px] font-bold uppercase tracking-[0.18em] ${
              light ? 'text-emerald-200/70' : 'text-emerald-700/60'
            }`}
          >
            Agro xizmatlar platformasi
          </span>
        )}
      </span>
    </Link>
  )
}
