import { useFinance } from '../context/FinanceContext'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Lightbulb, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] } }
})

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0; const end = value; const duration = 1000; const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step; if (start >= end) { setDisplay(end); clearInterval(timer) } else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  return <span>₹{display.toLocaleString()}</span>
}

function HealthScore({ score }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 70 ? 'Excellent' : score >= 40 ? 'Fair' : 'At Risk'
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <motion.div {...fadeUp(0.4)} className="glass-card p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl transition-all group-hover:opacity-20 group-hover:scale-150" style={{ backgroundColor: color, width: '100%', height: '100%' }} />
      <div className="flex items-center gap-2 mb-2 w-full justify-between z-10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Financial Health</p>
        <Activity size={16} color={color} className="opacity-70" />
      </div>
      
      <div className="relative w-32 h-32 z-10">
        <svg w="128" h="128" viewBox="0 0 100 100" className="-rotate-90 w-full h-full drop-shadow-2xl">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono tracking-tighter" style={{ color }}>{score}</span>
        </div>
      </div>
      <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 z-10">
        <span className="text-sm font-semibold tracking-wide" style={{ color }}>{label} Status</span>
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) return (
    <div className="glass-panel p-3 !border-white/10 !bg-black/60 shadow-2xl backdrop-blur-md">
      <p className="text-white text-sm font-semibold mb-1">{payload[0].name}</p>
      <p className="text-sm font-mono" style={{ color: payload[0].payload.color }}>₹{payload[0].value?.toLocaleString()}</p>
    </div>
  )
  return null
}

export default function Dashboard() {
  const { budgets, totalBudget, totalSpent, totalRemaining, getSpentByCategory, healthScore, expenses, user } = useFinance()

  const pieData = budgets.map(b => ({ name: b.category, value: getSpentByCategory(b.category), color: b.color })).filter(d => d.value > 0)
  const barData = budgets.map(b => ({ name: b.category.split(' ')[0], Budget: b.limit, Spent: getSpentByCategory(b.category), color: b.color }))
  const overBudget = budgets.filter(b => getSpentByCategory(b.category) > b.limit)
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4)
  const CATS = { 'Food & Dining': '🍜', Transport: '🚗', Entertainment: '🎬', Shopping: '🛍️', Health: '💊', Utilities: '💡' }
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div {...fadeUp(0)}>
          <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Good {greeting}, <span className="text-emerald-400">{user?.name || 'there'}</span> 👋
          </h1>
          <p className="text-slate-400 text-sm md:text-base">Here is your financial overview for the month.</p>
        </motion.div>

        {overBudget.length > 0 && (
          <motion.div {...fadeUp(0.1)} className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-md shadow-lg shadow-rose-500/5">
            <AlertCircle className="text-rose-400 shrink-0" size={18} />
            <p className="text-rose-400 text-sm font-medium">Over budget in {overBudget.length} categor{overBudget.length > 1 ? 'ies' : 'y'}.</p>
          </motion.div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
        {[
          { label: 'Monthly Allowance', value: totalBudget, icon: <Wallet size={24} />, color: 'emerald', sub: 'Total Limit' },
          { label: 'Total Utilized', value: totalSpent, icon: <TrendingDown size={24} />, color: 'amber', sub: `${totalBudget === 0 ? 0 : Math.round((totalSpent / totalBudget) * 100)}% consumed` },
          { label: 'Surplus', value: totalRemaining, icon: <TrendingUp size={24} />, color: totalRemaining < 0 ? 'rose' : 'indigo', sub: totalRemaining < 0 ? 'Deficit Warning!' : 'Safe to spend or save' },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(0.1 + i * 0.1)} whileHover={{ scale: 1.02, y: -4 }} className="glass-card p-5 xl:p-6 overflow-hidden relative group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${s.color}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-white font-mono tracking-tighter mt-1 mb-2">
                  <AnimatedNumber value={s.value} />
                </p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-${s.color}-500/10 text-${s.color}-400 border border-${s.color}-500/20`}>
                  {s.sub}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-${s.color}-400/20 to-${s.color}-600/20 text-${s.color}-400 border border-${s.color}-400/20 shadow-inner`}>
                {s.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart */}
        <motion.div {...fadeUp(0.3)} className="glass-card p-6 lg:col-span-2 flex flex-col">
          <p className="text-white font-semibold text-base mb-4 flex items-center gap-2"><PieChart size={18} className="text-emerald-400"/> Distribution Analytics</p>
          {pieData.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} className="drop-shadow-sm outline-none" style={{ outline: 'none' }} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-300 text-xs font-medium">{d.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">No expenses recorded yet.</div>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div {...fadeUp(0.4)} className="glass-card p-6 lg:col-span-3 flex flex-col">
          <p className="text-white font-semibold text-base mb-4 flex items-center gap-2"><BarChart size={18} className="text-indigo-400"/> Capacity Matrix</p>
          <div className="h-[240px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Budget" fill="rgba(255,255,255,0.05)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Spent" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {barData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Footer Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HealthScore score={healthScore} />

        <motion.div {...fadeUp(0.5)} className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold text-base">Recent Activity</p>
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 font-medium">Latest {recentExpenses.length}</span>
          </div>
          
          <div className="flex flex-col gap-3">
            {recentExpenses.length > 0 ? recentExpenses.map((e, i) => (
              <motion.div key={e.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                    {CATS[e.category] || '💸'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{e.note}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{e.category} <span className="mx-1">•</span> {e.date}</p>
                  </div>
                </div>
                <p className="text-rose-400 text-base font-bold font-mono tracking-tight">-₹{e.amount.toLocaleString()}</p>
              </motion.div>
            )) : (
              <p className="text-center text-slate-500 text-sm py-4">Your ledger is clean. Add some expenses to see them here.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}