import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, Check, X, Wallet, Target, TrendingUp } from 'lucide-react'

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: 'easeOut' } } })

export default function Budget() {
  const { budgets, updateBudget, getSpentByCategory, totalBudget, totalSpent, updateIncome, user } = useFinance()
  const [editing, setEditing] = useState(null)
  const [tempVal, setTempVal] = useState('')
  
  const [editingIncome, setEditingIncome] = useState(false)
  const [tempIncome, setTempIncome] = useState('')

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Budget Configuration 🎯</h1>
          <p className="text-slate-400 text-sm">Fine-tune your global limits and category caps.</p>
        </div>
        
        {/* Global Income / Monthly Config */}
        <div className="glass-card p-4 flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0 shadow-lg shadow-emerald-500/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Target size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Monthly Goal</p>
            {editingIncome ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">₹</span>
                <input 
                  type="number" 
                  value={tempIncome} 
                  autoFocus
                  onChange={e => setTempIncome(e.target.value)}
                  className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm outline-none focus:border-indigo-500/50"
                  onKeyDown={e => {
                    if (e.key === 'Enter') { updateIncome(tempIncome); setEditingIncome(false) }
                    if (e.key === 'Escape') setEditingIncome(false)
                  }}
                />
                <button onClick={() => { updateIncome(tempIncome); setEditingIncome(false) }} className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"><Check size={14} /></button>
                <button onClick={() => setEditingIncome(false)} className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold font-mono text-indigo-100">₹{(user?.income || totalBudget).toLocaleString()}</p>
                <button onClick={() => { setTempIncome(user?.income || totalBudget); setEditingIncome(true) }} className="text-slate-500 hover:text-indigo-400 transition-colors"><Edit3 size={14} /></button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Appointed Limit', value: totalBudget, color: 'text-emerald-400' },
          { label: 'Total Used', value: totalSpent, color: 'text-amber-500' },
          { label: 'Capacity Remaining', value: totalBudget - totalSpent, color: totalBudget - totalSpent < 0 ? 'text-rose-500' : 'text-indigo-400' },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(0.1 + i * 0.08)} whileHover={{ scale: 1.02, y: -2 }} className="glass-card p-6 border-t border-t-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl -mr-10 -mt-10" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-bold font-mono ${s.color}`}>₹{s.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {budgets.map((b, i) => {
          const spent = getSpentByCategory(b.category)
          const pct = b.limit === 0 ? (spent > 0 ? 100 : 0) : Math.min((spent / b.limit) * 100, 100)
          const over = spent > b.limit

          return (
            <motion.div key={b.category} {...fadeUp(0.2 + i * 0.06)} whileHover={{ scale: 1.02, y: -2 }} className="glass-card p-5 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none transition-opacity group-hover:opacity-40" style={{ backgroundColor: b.color }} />

              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner shrink-0" style={{ boxShadow: `inset 0 0 10px ${b.color}20` }}>
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{b.category}</p>
                    <p className={`text-xs mt-0.5 ${over ? 'text-rose-400 font-medium' : 'text-slate-400'}`}>
                      {over ? '⚠️ Exceeding limit' : `${Math.round(pct)}% allocated`}
                    </p>
                  </div>
                </div>
                
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setEditing(b.category); setTempVal(b.limit) }} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Edit3 size={14} />
                </motion.button>
              </div>

              <div className="mb-4 min-h-[40px]">
                <AnimatePresence mode="wait">
                  {editing === b.category ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">₹</span>
                      <input 
                        type="number" 
                        value={tempVal} 
                        onChange={e => setTempVal(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') { updateBudget(b.category, Number(tempVal)); setEditing(null) }
                          if (e.key === 'Escape') setEditing(null)
                        }}
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm font-mono outline-none focus:border-emerald-500/50" 
                      />
                      <button onClick={() => { updateBudget(b.category, Number(tempVal)); setEditing(null) }} className="p-1.5 rounded-lg bg-emerald-500 text-white shadow shadow-emerald-500/30"><Check size={14} /></button>
                      <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20"><X size={14} /></button>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Spent</p>
                        <p className={`text-xl font-bold font-mono ${over ? 'text-rose-400' : 'text-slate-100'}`}>₹{spent.toLocaleString()}</p>
                      </div>
                      <div className="text-right border-l border-white/10 pl-4">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Limit</p>
                        <p className="text-xl font-bold font-mono" style={{ color: b.color }}>₹{b.limit.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
                  className="h-full rounded-full"
                  style={{ 
                    background: over ? '#f43f5e' : `linear-gradient(90deg, ${b.color}88, ${b.color})`,
                    boxShadow: `0 0 10px ${over ? '#f43f5e' : b.color}60`
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}