import { useState, useRef, useEffect } from 'react'
import { useFinance } from '../context/FinanceContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, Zap, AlertTriangle } from 'lucide-react'

const suggestions = [
  "Am I overspending this month?",
  "Which category consumes my budget?",
  "How can I save more money?",
  "Give me a spending summary",
  "What's my financial health score?",
  "Tips to reduce food expenses?",
]

export default function Chat() {
  const { getFinancialSummary, user, getToken } = useFinance()
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi ${user?.name || 'there'}! 👋 I'm your AI finance wingman. I can see all your budget and expense data in real time. What would you like to know?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setLoading(true)

    const summary = getFinancialSummary()
    const systemPrompt = `You are FinSmart AI, a sharp, elite, and friendly personal finance assistant.
You have the user's REAL financial data below. Be specific, use their actual numbers.
Use emojis occasionally. Always use ₹ for currency. Keep it conversational but concise. Give practical, actionable advice.

USER FINANCIAL DATA:
Name: ${summary.user}
Monthly Goal: ₹${summary.totalBudget.toLocaleString()}
Total Spent: ₹${summary.totalSpent.toLocaleString()}
Remaining: ₹${summary.totalRemaining.toLocaleString()}
Health Score: ${summary.healthScore}/100
Transactions: ${summary.transactions}

Category Breakdown:
${summary.categories.map(c => `- ${c.name}: spent ₹${c.spent} of ₹${c.budget} (${c.percent}%)`).join('\n')}

Recent Expenses:
${summary.recentExpenses.map(e => `- ${e.category}: ₹${e.amount} for "${e.note}" on ${e.date}`).join('\n')}`

    const conversationHistory = messages
      .filter((m, i) => i > 0 && !m.isError)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }))

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${BASE_URL}/api/ai/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [
            ...conversationHistory,
            { role: 'user', parts: [{ text: userText }] }
          ],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      });
      const data = await res.json()
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't interpret that response!"
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: `Connection disrupted. Please verify your internet connection or server status.`, isError: true }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[900px] max-w-4xl mx-auto gap-4 relative">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 shrink-0 px-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          <Zap size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Financial Co-pilot</h1>
          <p className="text-indigo-300 text-xs font-medium uppercase tracking-widest mt-0.5">Powered by local context data</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col glass-panel overflow-hidden relative shadow-2xl border-white/10"
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, type: 'spring', bounce: 0.4 }}
                className={`flex gap-3 md:gap-4 items-end ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl shrink-0 flex items-center justify-center shadow-lg ${
                  m.role === 'assistant' 
                    ? m.isError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    : 'bg-white/10 border border-white/20 text-slate-300 backdrop-blur-md'
                }`}>
                  {m.role === 'assistant' ? (m.isError ? <AlertTriangle size={16} /> : <Bot size={18} />) : <User size={18} />}
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.01 }} 
                  className={`max-w-[85%] md:max-w-[75%] p-3.5 md:p-4 text-sm md:text-base leading-relaxed ${
                    m.role === 'assistant' 
                      ? m.isError 
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-[20px] rounded-bl-sm' 
                        : 'bg-white/5 border border-white/10 text-slate-200 rounded-[20px] rounded-bl-sm backdrop-blur-md shadow-lg shadow-black/20'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[20px] rounded-br-sm shadow-xl shadow-indigo-500/20'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 items-end">
              <div className="w-10 h-10 rounded-xl shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Bot size={18} />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[20px] rounded-bl-sm p-4 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-1" />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="px-4 md:px-6 pb-2 inline-flex flex-wrap gap-2 justify-end">
            {suggestions.map((s, i) => (
              <motion.button key={s} 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.05 }}
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(99,102,241,0.2)' }} whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(s)} 
                className="bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 px-3 py-1.5 text-xs md:text-sm flex items-center gap-1.5 hover:text-indigo-200 transition-colors"
              >
                <Sparkles size={12} className="text-indigo-400" />{s}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Input Form */}
        <div className="p-3 md:p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="relative flex items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Ask for financial guidance..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-16 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 shadow-inner transition-all"
            />
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()} 
              disabled={loading || !input.trim()} 
              className={`absolute right-2 p-2.5 rounded-xl transition-all ${
                input.trim() ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-transparent text-white/20'
              }`}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}