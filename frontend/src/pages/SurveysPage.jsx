import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { ClipboardList, Plus, BarChart3, Edit3, Trash2, ExternalLink, Copy, Tv, MoreHorizontal, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SurveysPage() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const load = () => {
    api.get('/surveys').then(r => { setSurveys(r.data.surveys || []); setLoading(false) })
  }

  useEffect(load, [])

  const deleteSurvey = async (id) => {
    if (!confirm('Delete this survey and all its responses?')) return
    await api.delete(`/surveys/${id}`)
    setSurveys(s => s.filter(sv => sv._id !== id))
  }

  const copyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${token}`)
    alert('Survey link copied!')
  }

  const filtered = surveys.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="section-title">Surveys</h1>
          <p className="text-apple-secondary mt-1">{surveys.length} total · {surveys.filter(s => s.status === 'active').length} active</p>
        </div>
        <Link to="/surveys/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Survey
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray" />
          <input className="input pl-9 py-2" placeholder="Search surveys…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex bg-apple-bg rounded-apple border border-apple-border overflow-hidden">
          {['all','active','draft','paused','closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-white text-apple-text shadow-sm' : 'text-apple-secondary hover:text-apple-text'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-apple-secondary text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <ClipboardList className="w-14 h-14 text-apple-border mb-4" />
          <h3 className="font-semibold text-apple-text mb-2">No surveys found</h3>
          <p className="text-apple-secondary text-sm mb-6">Create your first survey to start collecting responses.</p>
          <Link to="/surveys/new" className="btn-primary"><Plus className="w-4 h-4" />Create Survey</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {filtered.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }} transition={{ delay: i * 0.04 }}
                className="card p-5 hover:shadow-apple-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-apple-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-apple-text">{s.title}</h3>
                      <StatusBadge status={s.status} />
                    </div>
                    <p className="text-sm text-apple-secondary mt-0.5">
                      {s.totalResponses || 0} responses · {s.questions?.length || 0} questions ·
                      Created {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/surveys/${s._id}/analytics`)}
                      title="Analytics" className="btn-ghost p-2">
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => navigate(`/surveys/${s._id}/kiosk`)}
                      title="Kiosk Mode" className="btn-ghost p-2">
                      <Tv className="w-4 h-4" />
                    </button>
                    <button onClick={() => copyLink(s.shareToken)}
                      title="Copy Link" className="btn-ghost p-2">
                      <Copy className="w-4 h-4" />
                    </button>
                    <Link to={`/surveys/${s._id}/edit`} title="Edit"
                      className="btn-ghost p-2">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteSurvey(s._id)} title="Delete"
                      className="btn-ghost p-2 hover:text-apple-red">
                      <Trash2 className="w-4 h-4" />
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

function StatusBadge({ status }) {
  const map = { active: 'badge-green', draft: 'badge-gray', paused: 'badge-orange', closed: 'badge-red' }
  return <span className={map[status] || 'badge-gray'}>{status}</span>
}
