import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { BarChart3, Plus, Trash2, Edit3, Eye, Share2, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboards').then(r => { setDashboards(r.data.dashboards || []); setLoading(false) })
  }, [])

  const deleteDashboard = async (id) => {
    if (!confirm('Delete this dashboard?')) return
    await api.delete(`/dashboards/${id}`)
    setDashboards(d => d.filter(db => db._id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="section-title">Dashboards</h1>
          <p className="text-apple-secondary mt-1">Build interactive data dashboards</p>
        </div>
        <Link to="/dashboards/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-apple-secondary text-sm">Loading…</div>
      ) : dashboards.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <BarChart3 className="w-14 h-14 text-apple-border mb-4" />
          <h3 className="font-semibold text-apple-text mb-2">No dashboards yet</h3>
          <p className="text-apple-secondary text-sm mb-6">Create a dashboard to visualize your data</p>
          <Link to="/dashboards/new" className="btn-primary"><Plus className="w-4 h-4" />Create Dashboard</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {dashboards.map((db, i) => (
              <motion.div key={db._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                className="card p-5 hover:shadow-apple-md transition-shadow group cursor-pointer"
                onClick={() => navigate(`/dashboards/${db._id}`)}>
                {/* Preview area */}
                <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-apple mb-4 flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-blue-300" />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-apple-text truncate">{db.title}</h3>
                    {db.description && <p className="text-sm text-apple-secondary mt-0.5 line-clamp-2">{db.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-apple-gray">{db.widgets?.length || 0} widgets</span>
                      <span className="text-apple-border">·</span>
                      {db.isPublic
                        ? <span className="flex items-center gap-1 text-xs text-green-600"><Share2 className="w-3 h-3" />Public</span>
                        : <span className="flex items-center gap-1 text-xs text-apple-gray"><Lock className="w-3 h-3" />Private</span>
                      }
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/dashboards/${db._id}`} onClick={e => e.stopPropagation()} className="btn-ghost p-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={e => { e.stopPropagation(); deleteDashboard(db._id) }} className="btn-ghost p-1.5 hover:text-apple-red">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
