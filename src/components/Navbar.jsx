import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useFinance } from '../context/FinanceContext'
import { LayoutDashboard, Wallet, Receipt, Bot, LogOut, Users } from 'lucide-react'

const links = [
  { to: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { to: '/budget', label: 'Budget', icon: <Wallet size={20} /> },
  { to: '/expenses', label: 'Expenses', icon: <Receipt size={20} /> },
  { to: '/family', label: 'Family', icon: <Users size={20} /> },
  { to: '/chat', label: 'AI Coach', icon: <Bot size={20} /> },
]

export default function Navbar() {
  const location = useLocation()
  const { user, logoutUser } = useFinance()

  // Desktop sidebar + Mobile bottom bar
  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <motion.nav
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="hidden sm:flex flex-col fixed top-0 left-0 h-screen w-20 md:w-64 glass border-r z-50 py-6 px-3"
      >
        <div className="flex items-center gap-3 px-2 mb-10 md:mb-14">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0">
            <span className="text-xl">💰</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block">
            Fin<span className="text-emerald-400">Smart</span>
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {links.map(link => {
            const active = location.pathname === link.to
            return (
              <Link key={link.to} to={link.to} className="outline-none">
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                    active ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className={`${active ? 'text-emerald-400' : ''}`}>{link.icon}</span>
                  <span className="font-medium text-sm hidden md:block">{link.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </div>

        <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-2">
          <div className="px-3 py-2 flex items-center gap-3 text-slate-300 hidden md:flex">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Premium</span>
            </div>
          </div>
          
          <button onClick={logoutUser} className="outline-none w-full">
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(239,68,68,0.1)' }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-rose-400/80 hover:text-rose-400 border border-transparent transition-colors justify-center md:justify-start"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm hidden md:block">Log out</span>
            </motion.div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Bottom Navigation Bar */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="sm:hidden fixed bottom-6 left-4 right-4 glass-card p-2 flex items-center justify-around z-50 bg-black/60 shadow-2xl"
      >
        {links.map(link => {
          const active = location.pathname === link.to
          return (
            <Link key={link.to} to={link.to} className="relative p-3 rounded-xl flex items-center justify-center">
              {active && (
                <motion.div layoutId="mobileNavIndicator" className="absolute inset-0 bg-emerald-500/20 border border-emerald-500/20 rounded-xl" />
              )}
              <span className={`relative z-10 ${active ? 'text-emerald-400' : 'text-slate-400'}`}>
                {link.icon}
              </span>
            </Link>
          )
        })}
        <button onClick={logoutUser} className="p-3 relative z-10 text-rose-400/80 hover:text-rose-400 flex items-center justify-center">
          <LogOut size={20} />
        </button>
      </motion.nav>
    </>
  )
}