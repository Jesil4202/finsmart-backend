import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Tag, Calendar, PenTool, Receipt } from 'lucide-react'

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: 'easeOut' } } })

const CATEGORIES = [
  { name: 'Food & Dining', icon: '🍜', color: 'from-amber-400 to-amber-600', text: 'text-amber-500', bg: 'bg-amber-500' },
  { name: 'Transport', icon: '🚗', color: 'from-blue-400 to-blue-600', text: 'text-blue-500', bg: 'bg-blue-500' },
  { name: 'Entertainment', icon: '🎬', color: 'from-purple-400 to-purple-600', text: 'text-purple-500', bg: 'bg-purple-500' },
  { name: 'Shopping', icon: '🛍️', color: 'from-pink-400 to-pink-600', text: 'text-pink-500', bg: 'bg-pink-500' },
  { name: 'Health', icon: '💊', color: 'from-emerald-400 to-emerald-600', text: 'text-emerald-500', bg: 'bg-emerald-500' },
  { name: 'Utilities', icon: '💡', color: 'from-orange-400 to-orange-600', text: 'text-orange-500', bg: 'bg-orange-500' },
]

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category: 'Food & Dining', amount: '', note: '', date: new Date().toISOString().split('T')[0] })

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!form.amount || !form.note) return
    addExpense({ ...form, amount: Number(form.amount) })
    setForm({ category: 'Food & Dining', amount: '', note: '', date: new Date().toISOString().split('T')[0] })
    setShowForm(false)
  }

  const getCat = (name) => CATEGORIES.find(c => c.name === name) || { icon: '💸', color: 'from-slate-400 to-slate-600', text: 'text-slate-400', bg: 'bg-slate-500' }
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Expenses 🧾</h1>
          <p className="text-slate-400 text-sm hidden md:block">Log and monitor your historical transactions.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />} <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Record Expense'}</span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} 
            exit={{ opacity: 0, height: 0, marginBottom: 0 }} 
            className="overflow-hidden"
          >
            <div className="glass-panel p-6 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="flex items-center gap-2 mb-6 text-emerald-400 border-b border-white/5 pb-4">
                <PenTool size={18} />
                <h2 className="text-lg font-bold text-white">Draft Transaction</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"><Tag size={12} className="inline mr-1 -mt-0.5" /> Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="glass-input h-11 py-0 appearance-none bg-black/20">
                    {CATEGORIES.map(c => <option key={c.name} value={c.name} className="bg-slate-900">{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                    <input type="number" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="glass-input h-11 pl-8 font-mono" required min="1" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Description</label>
                  <input placeholder="Coffee, Uber, etc." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="glass-input h-11" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"><Calendar size={12} className="inline mr-1 -mt-0.5" /> Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="glass-input h-11 text-sm bg-black/20" required />
                </div>
                <div className="md:col-span-2 lg:col-span-4 mt-2">
                  <button type="submit" className="w-full btn-primary bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25">
                    Commit to Ledger
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Cumulative Oustflow', value: `₹${total.toLocaleString()}`, color: 'text-amber-400', decoration: 'bg-amber-500/10' },
          { label: 'Event Count', value: expenses.length, color: 'text-indigo-400', decoration: 'bg-indigo-500/10' },
          { label: 'Mean Velocity', value: `₹${expenses.length ? Math.round(total / expenses.length).toLocaleString() : 0}`, color: 'text-emerald-400', decoration: 'bg-emerald-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(0.1 + i * 0.1)} className={`glass-card p-5 border-t border-t-white/10 ${s.decoration} transition-all hover:bg-white/5`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{s.label}</p>
            <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUp(0.4)} className="glass-card mt-2">
        <div className="p-5 border-b border-white/5">
           <h2 className="text-white font-bold tracking-wide">Ledger History</h2>
        </div>
        <div className="flex flex-col p-2">
          <AnimatePresence>
            {sorted.map((e, i) => {
              const cat = getCat(e.category)
              return (
                <motion.div key={e._id || e.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 md:p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base">{e.note}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${cat.text} bg-white/5 px-2 py-0.5 rounded-full border border-white/5`}>
                          {e.category}
                        </span>
                        <span className="text-slate-500 text-xs font-mono">{e.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6">
                    <p className="text-rose-400 text-lg md:text-xl font-bold font-mono group-hover:scale-105 transition-transform">-₹{e.amount.toLocaleString()}</p>
                    <button onClick={() => deleteExpense(e._id || e.id)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all outline-none">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
            {sorted.length === 0 && (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><Receipt size={24} className="opacity-50" /></div>
                <p>No transactions found.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}