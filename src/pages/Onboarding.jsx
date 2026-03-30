import { useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react'

export default function Onboarding() {
  const { loginUser } = useFinance()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name to continue')
      return
    }
    setLoading(true)
    setError('')
    const success = await loginUser(name.trim())
    if (!success) {
      setError('Failed to securely connect. Is the database running?')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-panel p-8 md:p-10 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ rotate: -180, scale: 0 }} 
            animate={{ rotate: 0, scale: 1 }} 
            transition={{ type: 'spring', delay: 0.2, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Welcome to <span className="text-gradient from-emerald-400 to-teal-400">FinSmart</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Your premium AI-powered financial copilot. Track, budget, and optimize your wealth playfully.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1">
              What should we call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              placeholder="Enter your name"
              className="glass-input"
              autoFocus
              disabled={loading}
            />
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-sm ml-1 mt-1">
                {error}
              </motion.p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><span className="hidden sm:inline">Access</span> Dashboard <ArrowRight className="w-5 h-5" /></>}
          </motion.button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Your financial data is encrypted and backed up seamlessly to our servers.</span>
        </div>
      </motion.div>
    </div>
  )
}