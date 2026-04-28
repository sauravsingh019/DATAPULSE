import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { ArrowLeft, Database, Hash, Type, Calendar, ToggleLeft, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const COLORS = ['#0071e3', '#34c759', '#af52de', '#ff9500', '#ff3b30', '#007aff']

const typeIcon = { number: Hash, string: Type, date: Calendar, boolean: ToggleLeft }

export default function DatasetDetailPage() {
  const { id } = useParams()
  const [dataset, setDataset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCol, setActiveCol] = useState(null)
  const [tab, setTab] = useState('overview') // overview | table | columns

  useEffect(() => {
    api.get(`/upload/${id}`).then(r => {
      setDataset(r.data.dataset)
      setActiveCol(r.data.dataset?.columns?.[0]?.name || null)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64 text-apple-secondary text-sm">Loading…</div>
  if (!dataset) return <div className="text-center py-20 text-apple-secondary">Dataset not found</div>

  const col = dataset.columns?.find(c => c.name === activeCol)
  const rows = dataset.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/datasets" className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <h1 className="section-title">{dataset.name}</h1>
          <p className="text-apple-secondary text-sm">{dataset.rowCount?.toLocaleString()} rows · {dataset.columns?.length} columns · {dataset.source}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Rows', value: dataset.rowCount?.toLocaleString() },
          { label: 'Columns', value: dataset.columns?.length },
          { label: 'Numeric Cols', value: dataset.columns?.filter(c => c.type === 'number').length },
          { label: 'Text Cols', value: dataset.columns?.filter(c => c.type === 'string').length },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="stat-card">
            <p className="text-2xl font-semibold text-apple-text">{s.value ?? 0}</p>
            <p className="text-sm text-apple-secondary mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-apple-bg p-1 rounded-apple w-fit">
        {['overview','table','columns'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-apple text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white text-apple-text shadow-sm' : 'text-apple-secondary hover:text-apple-text'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Column Selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-apple-secondary mb-3">Columns</p>
            {dataset.columns?.map(c => {
              const Icon = typeIcon[c.type] || Database
              return (
                <button key={c.name} onClick={() => setActiveCol(c.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-apple transition-all text-left ${activeCol === c.name ? 'bg-blue-50 text-apple-blue ring-1 ring-apple-blue' : 'hover:bg-apple-bg text-apple-text'}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs opacity-60">{c.type} · {c.unique} unique</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Column Analysis */}
          <div className="lg:col-span-2">
            {col && (
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-apple">
                    <Database className="w-5 h-5 text-apple-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-apple-text">{col.name}</h3>
                    <p className="text-sm text-apple-secondary capitalize">{col.type} · {col.unique} unique values · {col.nullCount} nulls</p>
                  </div>
                </div>

                {col.type === 'number' && col.stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-apple-bg rounded-apple">
                    {[['Min', col.stats.min], ['Max', col.stats.max], ['Mean', col.stats.mean], ['Std Dev', col.stats.stdDev]].map(([l, v]) => (
                      <div key={l}>
                        <p className="text-xs text-apple-secondary">{l}</p>
                        <p className="text-lg font-semibold text-apple-text">{v ?? '—'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {col.sample && (
                  <div>
                    <p className="text-sm font-medium text-apple-secondary mb-2">Sample Values</p>
                    <div className="flex flex-wrap gap-2">
                      {col.sample.map((v, i) => (
                        <span key={i} className="px-3 py-1 bg-apple-bg rounded-full text-sm text-apple-text font-mono">{String(v) || 'null'}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Distribution for numeric */}
                {col.type === 'number' && rows.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-apple-secondary mb-2">Distribution</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={buildBins(rows.map(r => Number(r[col.name])).filter(n => !isNaN(n)), 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                        <XAxis dataKey="bin" tick={{ fontSize: 10, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6e6e73' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                        <Bar dataKey="count" fill="#0071e3" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Value counts for categorical */}
                {(col.type === 'string' || col.type === 'boolean') && rows.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-apple-secondary mb-2">Value Counts</p>
                    {(() => {
                      const counts = {}
                      rows.forEach(r => { const v = String(r[col.name] ?? 'null'); counts[v] = (counts[v] || 0) + 1 })
                      const top = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 8)
                      return (
                        <div className="flex items-center gap-4">
                          <ResponsiveContainer width="55%" height={160}>
                            <PieChart>
                              <Pie data={top.map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                                {top.map((_, j) => <Cell key={j} fill={COLORS[j % COLORS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="space-y-1">
                            {top.map(([k, v], j) => (
                              <div key={k} className="flex items-center gap-2 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[j % COLORS.length] }} />
                                <span className="text-apple-text truncate max-w-[100px]">{k}</span>
                                <span className="text-apple-secondary ml-auto">{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'table' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-apple-border bg-apple-bg">
                  {dataset.columns?.map(c => (
                    <th key={c.name} className="px-4 py-3 text-left font-medium text-apple-secondary whitespace-nowrap">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((row, i) => (
                  <tr key={i} className={`border-b border-apple-border/50 ${i % 2 === 0 ? '' : 'bg-apple-bg/40'}`}>
                    {dataset.columns?.map(c => (
                      <td key={c.name} className="px-4 py-2.5 text-apple-text font-mono text-xs whitespace-nowrap max-w-xs truncate">
                        {String(row[c.name] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 100 && (
              <div className="p-4 text-center text-sm text-apple-secondary border-t border-apple-border">
                Showing 100 of {rows.length.toLocaleString()} rows
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'columns' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-apple-border bg-apple-bg">
                {['Column','Type','Unique','Nulls','Min','Max','Mean'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-apple-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.columns?.map((c, i) => (
                <tr key={c.name} className={`border-b border-apple-border/50 ${i % 2 === 0 ? '' : 'bg-apple-bg/40'}`}>
                  <td className="px-4 py-3 font-medium text-apple-text">{c.name}</td>
                  <td className="px-4 py-3"><span className="badge-gray capitalize">{c.type}</span></td>
                  <td className="px-4 py-3 text-apple-secondary">{c.unique}</td>
                  <td className="px-4 py-3 text-apple-secondary">{c.nullCount}</td>
                  <td className="px-4 py-3 text-apple-secondary font-mono">{c.stats?.min ?? '—'}</td>
                  <td className="px-4 py-3 text-apple-secondary font-mono">{c.stats?.max ?? '—'}</td>
                  <td className="px-4 py-3 text-apple-secondary font-mono">{c.stats?.mean ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function buildBins(values, binCount = 10) {
  if (!values.length) return []
  const min = Math.min(...values), max = Math.max(...values)
  const size = (max - min) / binCount || 1
  const bins = Array.from({ length: binCount }, (_, i) => ({ bin: +(min + i * size).toFixed(1), count: 0 }))
  values.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / size), binCount - 1)
    bins[idx].count++
  })
  return bins
}
