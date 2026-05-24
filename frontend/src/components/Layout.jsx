import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import BackgroundPulse from './BackgroundPulse'
import {
  LayoutDashboard, ClipboardList, Database, BarChart3,
  LogOut, ChevronRight, Plus, User, Zap
} from 'lucide-react'
import { motion } from 'framer-motion'


const nav = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Surveys', path: '/surveys', icon: ClipboardList },
  { label: 'Datasets', path: '/datasets', icon: Database },
  { label: 'Dashboards', path: '/dashboards', icon: BarChart3 },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="relative flex h-screen overflow-hidden bg-apple-bg">
      {/* Dynamic Background signal grid for logged-in panel */}
      <BackgroundPulse mode="grid" speed={0.4} color="#0071e3" density={15} />

      {/* Sidebar */}
      <aside className="relative z-10 w-60 flex-shrink-0 bg-apple-surface border-r border-apple-border/60 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-apple-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-apple-text tracking-tight">DataPulse</p>
              <p className="text-[10px] text-apple-gray uppercase tracking-widest">Analytics</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ label, path, icon: Icon }) => {
            const active = path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path)
            return (
              <Link key={path} to={path}
                className={active ? 'nav-item-active' : 'nav-item'}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
              </Link>
            )
          })}

          <div className="pt-4 pb-2">
            <p className="px-3 text-[10px] font-semibold text-apple-gray uppercase tracking-widest mb-2">Quick Actions</p>
            <button onClick={() => navigate('/surveys/new')}
              className="nav-item w-full text-apple-blue hover:bg-blue-50">
              <Plus className="w-4 h-4" />
              New Survey
            </button>
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-apple-border/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-apple-text truncate">{user?.name}</p>
              <p className="text-xs text-apple-gray truncate">{user?.role}</p>
            </div>
            <button onClick={() => { navigate('/'); logout(); }} title="Logout"
              className="text-apple-gray hover:text-apple-red transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="p-8 max-w-7xl mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
