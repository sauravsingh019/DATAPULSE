import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import api from '../utils/api'
import { ClipboardList, Database, BarChart3, TrendingUp, Plus, ArrowRight, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' } }),
}

export default function DashboardHome() {
  const { user } = useAuthStore()
  const [data, setData] = useState({ surveys: [], datasets: [], dashboards: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/surveys').then(r => r.data.surveys || []),
      api.get('/upload').then(r => r.data.datasets || []),
      api.get('/dashboards').then(r => r.data.dashboards || []),
    ]).then(([surveys, datasets, dashboards]) => {
      setData({ surveys, datasets, dashboards })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalResponses = data.surveys.reduce((s, sv) => s + (sv.totalResponses || 0), 0)
  const activeSurveys = data.surveys.filter(s => s.status === 'active').length

  // Mock trend data for demo chart
  const trend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
    responses: Math.floor(Math.random() * 40 + 10),
  }))

  const stats = [
    { label: 'Total Surveys', value: data.surveys.length, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50', link: '/surveys' },
    { label: 'Active Surveys', value: activeSurveys, icon: Activity, color: 'text-green-500', bg: 'bg-green-50', link: '/surveys' },
    { label: 'Total Responses', value: totalResponses, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50', link: '/surveys' },
    { label: 'Datasets', value: data.datasets.length, icon: Database, color: 'text-orange-500', bg: 'bg-orange-50', link: '/datasets' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-apple-secondary text-sm">Loading…</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <h1 className="section-title">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-apple-secondary mt-1">Here's what's happening with your data today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="show">
            <Link to={s.link} className="stat-card block hover:shadow-apple-md transition-shadow">
              <div className={`inline-flex p-2 rounded-apple ${s.bg} mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-semibold text-apple-text">{s.value}</p>
              <p className="text-sm text-apple-secondary mt-0.5">{s.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Chart + Recent */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-3 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-apple-text">Response Trend</h2>
              <p className="text-sm text-apple-secondary">Last 7 days</p>
            </div>
            <div className="badge-blue">Weekly</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 13 }} />
              <Area type="monotone" dataKey="responses" stroke="#0071e3" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Surveys */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-apple-text">Recent Surveys</h2>
            <Link to="/surveys" className="text-sm text-apple-blue hover:underline flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {data.surveys.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-10 h-10 text-apple-border mx-auto mb-3" />
              <p className="text-sm text-apple-secondary">No surveys yet</p>
              <Link to="/surveys/new" className="btn-primary mt-3 text-xs">Create Survey</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.surveys.slice(0, 5).map(s => (
                <Link key={s._id} to={`/surveys/${s._id}/analytics`}
                  className="flex items-center gap-3 p-3 rounded-apple hover:bg-apple-bg transition-colors group">
                  <div className="w-8 h-8 rounded-apple bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-apple-text truncate">{s.title}</p>
                    <p className="text-xs text-apple-secondary">{s.totalResponses || 0} responses</p>
                  </div>
                  <StatusBadge status={s.status} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="font-semibold text-apple-text mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Create Survey', desc: 'Build forms and surveys', icon: ClipboardList, link: '/surveys/new', color: 'from-blue-500 to-blue-600' },
            { label: 'Upload Dataset', desc: 'Import CSV for analysis', icon: Database, link: '/datasets', color: 'from-orange-500 to-orange-600' },
            { label: 'New Dashboard', desc: 'Build visual dashboards', icon: BarChart3, link: '/dashboards/new', color: 'from-purple-500 to-purple-600' },
          ].map(a => (
            <Link key={a.label} to={a.link}
              className="card p-5 hover:shadow-apple-md transition-all group flex items-center gap-4">
              <div className={`w-10 h-10 rounded-apple-lg bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0`}>
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-apple-text text-sm">{a.label}</p>
                <p className="text-xs text-apple-secondary">{a.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-apple-gray ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = { active: 'badge-green', draft: 'badge-gray', paused: 'badge-orange', closed: 'badge-red' }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
