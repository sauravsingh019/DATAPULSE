import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Download, ArrowLeft, TrendingUp, Users, CheckCircle, SkipForward } from 'lucide-react'
import { motion } from 'framer-motion'

const COLORS = ['#0071e3', '#34c759', '#af52de', '#ff9500', '#ff3b30', '#007aff', '#5ac8fa']

export default function SurveyAnalyticsPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('bar')

  useEffect(() => {
    api.get(`/surveys/${id}/analytics`).then(r => { setData(r.data); setLoading(false) })
  }, [id])

  const exportCsv = () => window.open(`/api/responses/survey/${id}/export`, '_blank')

  if (loading) return <div className="flex items-center justify-center h-64 text-apple-secondary text-sm">Loading analytics…</div>
  if (!data) return null

  const kpis = [
    { label: 'Total Responses', value: data.totalResponses, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Completed', value: data.completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Completion Rate', value: `${data.completionRate}%`, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Questions', value: data.questionStats?.length, icon: SkipForward, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/surveys" className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="section-title">{data.survey.title}</h1>
          <p className="text-apple-secondary text-sm mt-0.5">Survey Analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-apple-bg p-0.5 rounded-apple border border-apple-border">
            {['bar','pie'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 rounded-apple text-sm font-medium transition-all capitalize ${view === v ? 'bg-white text-apple-text shadow-sm' : 'text-apple-secondary'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={exportCsv} className="btn-secondary">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }} className="stat-card">
            <div className={`inline-flex p-2 rounded-apple ${k.bg} mb-3`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <p className="text-2xl font-semibold text-apple-text">{k.value ?? 0}</p>
            <p className="text-sm text-apple-secondary mt-0.5">{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Question Charts */}
      <div className="space-y-4">
        {data.questionStats?.map((qs, i) => (
          <motion.div key={qs.questionId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }} className="card p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-apple-text">{qs.label}</h3>
              <span className="badge-gray capitalize">{qs.type}</span>
            </div>
            <p className="text-sm text-apple-secondary mb-5">{qs.count} responses</p>

            {qs.distribution && Object.keys(qs.distribution).length > 0 ? (
              <div>
                {qs.avg !== undefined && (
                  <div className="flex gap-6 mb-5 pb-4 border-b border-apple-border/50">
                    {[['Average', qs.avg], ['Min', qs.min], ['Max', qs.max], ['Median', qs.median]].map(([l, v]) => v !== null && (
                      <div key={l}>
                        <p className="text-xs text-apple-secondary">{l}</p>
                        <p className="text-xl font-semibold text-apple-text">{v}</p>
                      </div>
                    ))}
                  </div>
                )}

                {view === 'bar' ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={Object.entries(qs.distribution).map(([k, v]) => ({ label: k, count: v }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 13 }} />
                      <defs>
                        <linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0071e3" />
                          <stop offset="100%" stopColor="#af52de" />
                        </linearGradient>
                      </defs>
                      <Bar dataKey="count" fill={`url(#g${i})`} radius={[8,8,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width="60%" height={220}>
                      <PieChart>
                        <Pie data={Object.entries(qs.distribution).map(([k, v]) => ({ name: k, value: v }))}
                          cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                          paddingAngle={3} dataKey="value">
                          {Object.keys(qs.distribution).map((_, j) => (
                            <Cell key={j} fill={COLORS[j % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 13 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {Object.entries(qs.distribution).map(([k, v], j) => (
                        <div key={k} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[j % COLORS.length] }} />
                          <span className="text-sm text-apple-text">{k}: <strong>{v}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : qs.responses?.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {qs.responses.map((r, j) => (
                  <div key={j} className="p-3 bg-apple-bg rounded-apple text-sm text-apple-text">
                    "{r}"
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-apple-secondary text-sm">No responses yet</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
