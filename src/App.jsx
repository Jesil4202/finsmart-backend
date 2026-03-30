import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Budget from './pages/Budget'
import Expenses from './pages/Expenses'
import Chat from './pages/Chat'
import Family from './pages/Family'
import Onboarding from './pages/Onboarding'
import { FinanceProvider, useFinance } from './context/FinanceContext'

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

function AnimatedRoutes() {
  const location = useLocation()
  const { user } = useFinance()

  if (!user) return (
    <Routes location={location}>
      <Route path="*" element={<Onboarding />} />
    </Routes>
  )

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full">
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/family" element={<Family />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function AppLayout() {
  const { user } = useFinance()
  return (
    <div className="min-h-screen flex flex-col sm:flex-row relative">
      {/* Background glow global */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      {user && <Navbar />}
      
      <main className={`flex-1 w-full max-w-7xl mx-auto z-10 transition-all duration-300 ${user ? 'p-4 md:p-8 sm:ml-20 md:ml-64 pb-24 sm:pb-8' : ''}`}>
        <AnimatedRoutes />
      </main>
    </div>
  )
}

function App() {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </FinanceProvider>
  )
}

export default App