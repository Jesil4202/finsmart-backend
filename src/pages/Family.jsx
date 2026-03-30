import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Copy, Check, Plus, Key, TrendingDown, UserPlus } from 'lucide-react'

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: 'easeOut' } } })

export default function Family() {
  const { group, createGroup, joinGroup, expenses, user } = useFinance()
  const [inviteCode, setInviteCode] = useState('')
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setLoading(true)
    await createGroup(groupName.trim())
    setLoading(false)
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!inviteCode.trim()) return
    setLoading(true)
    setError('')
    const success = await joinGroup(inviteCode.trim())
    if(!success) setError('Invalid code or already a member.');
    setLoading(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(group?.inviteCode || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!group) {
    return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto mt-4">
        <motion.div {...fadeUp(0)} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Family & Cohort Mode</h1>
          <p className="text-slate-400">Share a unified ledger. Track group spending, calculate equal splits, and sync budgets instantly.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <motion.div {...fadeUp(0.1)} className="glass-card p-6 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Plus size={20} className="text-indigo-400"/> Form a New Group</h2>
            <p className="text-sm text-slate-400 mb-6">You will be designated as the administrator. An invite code will be generated for others to merge into your ledger.</p>
            <form onSubmit={handleCreate} className="space-y-4">
              <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Smith Family, Euro Trip '26" className="glass-input" />
              <button type="submit" disabled={loading || !groupName.trim()} className="btn-primary w-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/25">Deploy Group</button>
            </form>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="glass-card p-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
             <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Key size={20} className="text-emerald-400"/> Join Existing Ledger</h2>
            <p className="text-sm text-slate-400 mb-6">Enter an 8-character secure invite token provided by your ledger administrator.</p>
            <form onSubmit={handleJoin} className="space-y-4">
              <input value={inviteCode} onChange={e => {setInviteCode(e.target.value); setError('')}} placeholder="Invite Token (e.g. X8A9F21B)" className="glass-input font-mono uppercase tracking-widest text-emerald-100" />
              {error && <p className="text-rose-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading || !inviteCode.trim()} className="btn-primary w-full bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25">Authenticate & Join</button>
            </form>
          </motion.div>
        </div>
      </div>
    )
  }

  const memberShares = {};
  group.memberDetails?.forEach(m => memberShares[m.userId] = { name: m.name, spent: 0 });
  
  let totalSpent = 0;
  expenses.forEach(e => {
     if(memberShares[e.userId]) {
         memberShares[e.userId].spent += e.amount;
         totalSpent += e.amount;
     }
  });

  const memberCount = group.members.length;
  const equalShare = memberCount > 0 ? totalSpent / memberCount : 0;
  
  const sharesArray = Object.keys(memberShares).map(k => ({
     id: k,
     name: memberShares[k].name,
     spent: memberShares[k].spent,
     balance: memberShares[k].spent - equalShare
  })).sort((a, b) => b.balance - a.balance);

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <motion.div {...fadeUp(0)} className="glass-card p-6 border border-indigo-500/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="z-10">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Active Ledger</p>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">{group.groupName}</h1>
          <p className="text-slate-400 text-sm flex items-center gap-2"><Users size={16}/> {memberCount} active constituents</p>
        </div>
        <div className="z-10 bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner">
           <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Secure Connection Token</p>
           <div className="flex items-center gap-3">
             <code className="text-xl font-bold font-mono text-indigo-300 tracking-[0.2em] select-all">{group.inviteCode}</code>
             <button onClick={copyCode} className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">
                {copied ? <Check size={16} /> : <Copy size={16} />}
             </button>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div {...fadeUp(0.1)} className="glass-card p-6 flex flex-col">
          <p className="text-white font-semibold text-base mb-4 border-b border-white/5 pb-3">Financial Distribution Metrics</p>
          <div className="flex items-center justify-between mb-6 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500"><TrendingDown size={20}/></div>
                <div>
                   <p className="text-xs font-semibold uppercase text-amber-500/80">Gross Expenditure</p>
                   <p className="text-2xl font-bold font-mono text-amber-400">₹{totalSpent.toLocaleString()}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-xs font-semibold uppercase text-slate-500">Parity Target (Per User)</p>
                <p className="text-xl font-bold font-mono text-slate-300 pointer-events-none">₹{Math.round(equalShare).toLocaleString()}</p>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             {sharesArray.map(m => (
               <div key={m.id} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-inner">
                       {m.name.charAt(0).toUpperCase()}
                     </div>
                     <span className="font-medium text-sm text-slate-200">{m.name} {m.id === user?.userId && '(You)'}</span>
                   </div>
                   <span className="font-mono text-sm text-white font-semibold shadow-sm">₹{m.spent.toLocaleString()} injected</span>
                 </div>
                 <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${totalSpent === 0 ? 0 : Math.min((m.spent / totalSpent) * 100, 100)}%` }}/>
                 </div>
                 <p className={`text-[11px] font-bold text-right tracking-widest uppercase ${m.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.balance >= 0 ? `+ ₹${Math.round(m.balance).toLocaleString()} OWED` : `- ₹${Math.abs(Math.round(m.balance)).toLocaleString()} OWES`}
                 </p>
               </div>
             ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="glass-card p-6">
           <p className="text-white font-semibold text-base mb-4 border-b border-white/5 pb-3">Latest Group Ledger Events</p>
           <div className="flex flex-col gap-3">
             {expenses.slice(0, 8).map(e => (
               <div key={e._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default border border-transparent hover:border-white/5">
                 <div>
                   <p className="text-white text-sm font-semibold">{e.note}</p>
                   <p className="text-slate-400 text-[11px] mt-0.5"><span className="text-indigo-400 font-medium">{e.userName}</span> • {e.category} • {e.date}</p>
                 </div>
                 <p className="text-rose-400 text-[15px] font-bold font-mono tracking-tight">-₹{e.amount.toLocaleString()}</p>
               </div>
             ))}
             {expenses.length === 0 && <p className="text-slate-500 text-sm italic text-center py-6">Ledger initialized. No cross-transactions yet.</p>}
           </div>
        </motion.div>
      </div>

    </div>
  )
}
