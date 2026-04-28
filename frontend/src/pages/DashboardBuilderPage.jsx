import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, BarChart3, ClipboardList, Database,
  Eye, EyeOff, Hash, Maximize2, PieChartIcon, Plus, Save, Settings, Table,
  Trash2, TrendingUp, Type, X, Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const COLORS = ['#0071e3', '#34c759', '#af52de', '#ff9500', '#ff3b30', '#007aff', '#5ac8fa', '#ffcc00']
const GRID_COLUMNS = 12
const DEFAULT_WIDGET_W = 4
const DEFAULT_WIDGET_H = 3

const WIDGET_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'area', label: 'Area Chart', icon: TrendingUp },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  { value: 'donut', label: 'Donut Chart', icon: PieChartIcon },
  { value: 'kpi', label: 'KPI Card', icon: Hash },
  { value: 'table', label: 'Data Table', icon: Table },
  { value: 'text', label: 'Text Block', icon: Type },
]

function cloneWidgets(widgets) {
  return widgets.map(widget => ({
    ...widget,
    layout: { x: 0, y: 0, w: DEFAULT_WIDGET_W, h: DEFAULT_WIDGET_H, ...(widget.layout || {}) },
  }))
}

function collides(a, b) {
  return a.layout.x < b.layout.x + b.layout.w &&
    a.layout.x + a.layout.w > b.layout.x &&
    a.layout.y < b.layout.y + b.layout.h &&
    a.layout.y + a.layout.h > b.layout.y
}

function compactLayout(widgets) {
  const next = cloneWidgets(widgets)
    .sort((a, b) => (a.layout.y - b.layout.y) || (a.layout.x - b.layout.x))

  next.forEach((widget, index) => {
    widget.layout.w = Math.max(2, Math.min(GRID_COLUMNS, widget.layout.w || DEFAULT_WIDGET_W))
    widget.layout.h = Math.max(2, Math.min(6, widget.layout.h || DEFAULT_WIDGET_H))
    widget.layout.x = Math.max(0, Math.min(GRID_COLUMNS - widget.layout.w, widget.layout.x || 0))
    widget.layout.y = Math.max(0, widget.layout.y || 0)

    let moved = true
    while (moved && widget.layout.y > 0) {
      widget.layout.y -= 1
      const hasCollision = next.slice(0, index).some(other => collides(widget, other))
      if (hasCollision) {
        widget.layout.y += 1
        moved = false
      }
    }

    let safety = 0
    while (next.slice(0, index).some(other => collides(widget, other)) && safety < 200) {
      widget.layout.y += 1
      safety += 1
    }
  })

  return next
}

function findNextPosition(widgets, width = DEFAULT_WIDGET_W, height = DEFAULT_WIDGET_H) {
  const placed = compactLayout(widgets)

  for (let y = 0; y < 50; y += 1) {
    for (let x = 0; x <= GRID_COLUMNS - width; x += 1) {
      const candidate = { id: '__candidate__', layout: { x, y, w: width, h: height } }
      if (!placed.some(widget => collides(candidate, widget))) {
        return { x, y, w: width, h: height }
      }
    }
  }

  return { x: 0, y: placed.reduce((max, widget) => Math.max(max, widget.layout.y + widget.layout.h), 0), w: width, h: height }
}

function normalizeDashboardWidgets(widgets) {
  return compactLayout(widgets)
}

function generateWidgetData(widget, datasets) {
  if (widget.datasetId) {
    const dataset = datasets.find(d => d._id === widget.datasetId || d._id?._id === widget.datasetId)
    if (dataset?.data) {
      const rows = dataset.data.slice(0, 100)
      const xField = widget.config?.xField
      const yField = widget.config?.yField

      if (xField && yField) {
        const grouped = {}
        rows.forEach(row => {
          const key = String(row[xField] || 'N/A')
          const value = Number(row[yField])
          if (!grouped[key]) grouped[key] = 0
          if (!Number.isNaN(value)) grouped[key] += value
        })
        return Object.entries(grouped).slice(0, 12).map(([name, value]) => ({ name, value: +value.toFixed(2) }))
      }

      if (xField) {
        const counts = {}
        rows.forEach(row => {
          const key = String(row[xField] || 'N/A')
          counts[key] = (counts[key] || 0) + 1
        })
        return Object.entries(counts).slice(0, 12).map(([name, value]) => ({ name, value }))
      }
    }
  }

  return [
    { name: 'Jan', value: 42 }, { name: 'Feb', value: 58 }, { name: 'Mar', value: 67 },
    { name: 'Apr', value: 45 }, { name: 'May', value: 82 }, { name: 'Jun', value: 73 },
    { name: 'Jul', value: 91 }, { name: 'Aug', value: 78 },
  ]
}

function WidgetRenderer({ widget, data, editing, selected, onSelect, onDelete, onToggleFullscreen, isFullscreen, onMove, onResize }) {
  const chartData = data || []

  const renderChart = () => {
    const commonProps = { data: chartData, margin: { top: 8, right: 16, left: 0, bottom: 8 } }
    const axisProps = {
      tick: { fontSize: 11, fill: '#6e6e73' },
      axisLine: false,
      tickLine: false,
    }
    const tooltipStyle = {
      contentStyle: {
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
        fontSize: 12,
      },
    }

    if (widget.type === 'kpi') {
      const total = chartData.reduce((sum, entry) => sum + (entry.value || 0), 0)
      const avg = chartData.length ? (total / chartData.length).toFixed(1) : 0
      const maxValue = Math.max(1, ...chartData.map(entry => entry.value || 0))

      return (
        <div className="flex h-full flex-col justify-between px-2 py-1">
          <div>
            <p className="text-4xl font-semibold text-apple-text">{total.toLocaleString()}</p>
            <p className="mt-1 text-sm text-apple-secondary">Total metric</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-apple-gray">Average {avg}</p>
            <div className="mt-3 flex items-end gap-1">
              {chartData.slice(0, 10).map((entry, index) => (
                <div
                  key={`${widget.id}_${index}`}
                  className="w-5 rounded-sm"
                  style={{
                    height: `${Math.max(10, ((entry.value || 0) / maxValue) * 56)}px`,
                    backgroundColor: COLORS[index % COLORS.length],
                    opacity: 0.8,
                  }}
                  title={`${entry.name}: ${entry.value}`}
                />
              ))}
            </div>
          </div>
        </div>
      )
    }

    if (widget.type === 'text') {
      return (
        <div className="flex h-full items-center justify-center px-4 text-center">
          <p className="max-w-md text-sm leading-6 text-apple-secondary">
            {widget.config?.textContent || 'Add notes, definitions, or guidance for the dashboard here.'}
          </p>
        </div>
      )
    }

    if (widget.type === 'table') {
      const columns = chartData.length > 0 ? Object.keys(chartData[0]) : ['name', 'value']
      return (
        <div className="h-full overflow-auto rounded-xl border border-apple-border/60">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-apple-bg">
              <tr className="border-b border-apple-border">
                {columns.map(column => (
                  <th key={column} className="px-3 py-2 text-left font-medium text-apple-secondary">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.slice(0, 20).map((row, index) => (
                <tr key={`${widget.id}_row_${index}`} className="border-b border-apple-border/40">
                  {columns.map(column => (
                    <td key={column} className="px-3 py-2 text-apple-text">
                      {String(row[column] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (widget.type === 'pie' || widget.type === 'donut') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={widget.type === 'donut' ? '48%' : 0}
              outerRadius="76%"
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
            >
              {chartData.map((_, index) => <Cell key={`${widget.id}_pie_${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (widget.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (widget.type === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`ag_${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.24} />
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke={COLORS[0]} fill={`url(#ag_${widget.id})`} strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis allowDecimals={false} {...axisProps} />
          <Tooltip {...tooltipStyle} />
          <defs>
            <linearGradient id={`bg_${widget.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[0]} />
              <stop offset="100%" stopColor={COLORS[2]} />
            </linearGradient>
          </defs>
          <Bar dataKey="value" fill={`url(#bg_${widget.id})`} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white ${
        selected ? 'border-apple-blue shadow-apple-md ring-2 ring-blue-100' : 'border-apple-border/70 shadow-sm'
      } ${isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between border-b border-apple-border/60 px-4 py-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-apple-text">{widget.title || 'Untitled Widget'}</h4>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-apple-gray">
            {widget.type} . {widget.layout.w}x{widget.layout.h}
          </p>
        </div>

        <div className="ml-3 flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onToggleFullscreen() }} className="btn-ghost p-1.5" title="Fullscreen">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          {editing && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="btn-ghost p-1.5 hover:text-apple-red" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {editing && selected && (
        <div className="flex flex-wrap items-center gap-1 border-b border-apple-border/60 bg-apple-bg/70 px-3 py-2">
          <button onClick={(e) => { e.stopPropagation(); onMove('left') }} className="btn-ghost px-2 py-1 text-xs" title="Move left">
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMove('right') }} className="btn-ghost px-2 py-1 text-xs" title="Move right">
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMove('up') }} className="btn-ghost px-2 py-1 text-xs" title="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMove('down') }} className="btn-ghost px-2 py-1 text-xs" title="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="mx-1 h-4 w-px bg-apple-border" />
          <button onClick={(e) => { e.stopPropagation(); onResize('w', -1) }} className="btn-ghost px-2 py-1 text-xs">
            W-
          </button>
          <button onClick={(e) => { e.stopPropagation(); onResize('w', 1) }} className="btn-ghost px-2 py-1 text-xs">
            W+
          </button>
          <button onClick={(e) => { e.stopPropagation(); onResize('h', -1) }} className="btn-ghost px-2 py-1 text-xs">
            H-
          </button>
          <button onClick={(e) => { e.stopPropagation(); onResize('h', 1) }} className="btn-ghost px-2 py-1 text-xs">
            H+
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 px-3 py-3">
        {renderChart()}
      </div>
    </div>
  )
}

function WidgetConfigPanel({ widget, datasets, onUpdate, onClose }) {
  const [local, setLocal] = useState(widget)
  const selectedDataset = datasets.find(dataset => dataset._id === local.datasetId)

  const update = (path, value) => {
    setLocal(current => {
      const next = JSON.parse(JSON.stringify(current))
      const parts = path.split('.')
      let target = next

      for (let index = 0; index < parts.length - 1; index += 1) {
        if (!target[parts[index]]) target[parts[index]] = {}
        target = target[parts[index]]
      }

      target[parts[parts.length - 1]] = value
      return next
    })
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-apple-border bg-white">
      <div className="flex items-center justify-between border-b border-apple-border px-4 py-4">
        <div>
          <h3 className="font-semibold text-apple-text">Widget Settings</h3>
          <p className="text-xs text-apple-secondary">Tune the selected tile</p>
        </div>
        <button onClick={() => { onUpdate(local); onClose() }} className="btn-primary px-3 py-1 text-xs">
          Apply
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={local.title || ''} onChange={(e) => update('title', e.target.value)} />
        </div>

        <div>
          <label className="label">Chart Type</label>
          <select className="input" value={local.type} onChange={(e) => update('type', e.target.value)}>
            {WIDGET_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>

        <div className="border-t border-apple-border pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-apple-secondary">Data Source</p>
          <label className="label">Dataset</label>
          <select className="input" value={local.datasetId || ''} onChange={(e) => update('datasetId', e.target.value || undefined)}>
            <option value="">Demo Data</option>
            {datasets.map(dataset => (
              <option key={dataset._id} value={dataset._id}>{dataset.name}</option>
            ))}
          </select>

          {selectedDataset && (
            <>
              <div className="mt-3">
                <label className="label">Category / X Axis</label>
                <select className="input" value={local.config?.xField || ''} onChange={(e) => update('config.xField', e.target.value)}>
                  <option value="">Select column</option>
                  {selectedDataset.columns?.map(column => (
                    <option key={column.name} value={column.name}>{column.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <label className="label">Metric / Y Axis</label>
                <select className="input" value={local.config?.yField || ''} onChange={(e) => update('config.yField', e.target.value)}>
                  <option value="">Count rows</option>
                  {selectedDataset.columns?.filter(column => column.type === 'number').map(column => (
                    <option key={column.name} value={column.name}>{column.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {local.type === 'text' && (
          <div className="border-t border-apple-border pt-4">
            <label className="label">Text Content</label>
            <textarea
              rows={5}
              className="input resize-none"
              value={local.config?.textContent || ''}
              onChange={(e) => update('config.textContent', e.target.value)}
            />
          </div>
        )}

        <div className="rounded-xl border border-apple-border bg-apple-bg/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-apple-secondary">Layout</p>
          <p className="mt-2 text-sm text-apple-text">
            Position: ({local.layout?.x ?? 0}, {local.layout?.y ?? 0})
          </p>
          <p className="mt-1 text-sm text-apple-text">
            Size: {local.layout?.w ?? DEFAULT_WIDGET_W} columns x {local.layout?.h ?? DEFAULT_WIDGET_H} rows
          </p>
        </div>
      </div>
    </div>
  )
}

function WidgetPalette({ datasets, surveys, onAdd }) {
  return (
    <div className="w-60 flex-shrink-0 overflow-y-auto border-r border-apple-border bg-white p-3">
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-apple-secondary">Add Widget</p>
      <div className="space-y-1">
        {WIDGET_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => onAdd(type.value)}
            className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition-colors hover:bg-apple-bg"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <type.icon className="h-4 w-4 text-apple-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-apple-text">{type.label}</p>
              <p className="text-xs text-apple-secondary">Drop it on the canvas</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 border-t border-apple-border pt-4">
        <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-apple-secondary">Data Sources</p>
        <div className="space-y-1">
          {datasets.slice(0, 4).map(dataset => (
            <div key={dataset._id} className="flex items-center gap-2 rounded-xl p-2 text-xs text-apple-text">
              <Database className="h-3.5 w-3.5 text-orange-500" />
              <span className="truncate">{dataset.name}</span>
            </div>
          ))}
          {surveys.slice(0, 3).map(survey => (
            <div key={survey._id} className="flex items-center gap-2 rounded-xl p-2 text-xs text-apple-text">
              <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
              <span className="truncate">{survey.title}</span>
            </div>
          ))}
          {datasets.length === 0 && surveys.length === 0 && (
            <p className="px-2 text-xs text-apple-gray">No data sources yet. Upload a dataset or create a survey first.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState({
    title: 'New Dashboard',
    description: '',
    widgets: [],
    isPublic: false,
    theme: 'light',
  })
  const [datasets, setDatasets] = useState([])
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(true)
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [fullscreenWidget, setFullscreenWidget] = useState(null)
  const [widgetData, setWidgetData] = useState({})

  useEffect(() => {
    const requests = [
      api.get('/upload').then(response => setDatasets(response.data.datasets || [])),
      api.get('/surveys').then(response => setSurveys(response.data.surveys || [])),
    ]

    if (id) {
      requests.push(
        api.get(`/dashboards/${id}`).then(response => {
          setDashboard(current => ({
            ...current,
            ...response.data.dashboard,
            widgets: normalizeDashboardWidgets(response.data.dashboard.widgets || []),
          }))
          setLoading(false)
        }),
      )
    } else {
      setLoading(false)
    }

    Promise.all(requests).catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    const nextData = {}
    dashboard.widgets.forEach(widget => {
      nextData[widget.id] = generateWidgetData(widget, datasets)
    })
    setWidgetData(nextData)
  }, [dashboard.widgets, datasets])

  const sortedWidgets = useMemo(
    () => [...dashboard.widgets].sort((a, b) => (a.layout?.y - b.layout?.y) || (a.layout?.x - b.layout?.x)),
    [dashboard.widgets],
  )

  const activeWidget = dashboard.widgets.find(widget => widget.id === selectedWidget)

  const commitWidgets = (updater) => {
    setDashboard(current => {
      const rawWidgets = typeof updater === 'function' ? updater(current.widgets) : updater
      return { ...current, widgets: normalizeDashboardWidgets(rawWidgets) }
    })
  }

  const addWidget = (type) => {
    const layout = findNextPosition(dashboard.widgets)
    const widget = {
      id: `w_${Date.now()}`,
      type,
      title: WIDGET_TYPES.find(entry => entry.value === type)?.label || 'Widget',
      config: {},
      layout,
    }

    commitWidgets(widgets => [...widgets, widget])
    setSelectedWidget(widget.id)
  }

  const updateWidget = (widgetId, updates) => {
    commitWidgets(widgets => widgets.map(widget => (widget.id === widgetId ? { ...widget, ...updates } : widget)))
  }

  const deleteWidget = (widgetId) => {
    commitWidgets(widgets => widgets.filter(widget => widget.id !== widgetId))
    if (selectedWidget === widgetId) setSelectedWidget(null)
    if (fullscreenWidget === widgetId) setFullscreenWidget(null)
  }

  const moveWidget = (widgetId, direction) => {
    commitWidgets(widgets => widgets.map(widget => {
      if (widget.id !== widgetId) return widget

      const next = { ...widget, layout: { ...widget.layout } }
      if (direction === 'left') next.layout.x = Math.max(0, next.layout.x - 1)
      if (direction === 'right') next.layout.x = Math.min(GRID_COLUMNS - next.layout.w, next.layout.x + 1)
      if (direction === 'up') next.layout.y = Math.max(0, next.layout.y - 1)
      if (direction === 'down') next.layout.y += 1
      return next
    }))
  }

  const resizeWidget = (widgetId, axis, delta) => {
    commitWidgets(widgets => widgets.map(widget => {
      if (widget.id !== widgetId) return widget

      const next = { ...widget, layout: { ...widget.layout } }
      if (axis === 'w') {
        next.layout.w = Math.max(2, Math.min(GRID_COLUMNS, next.layout.w + delta))
        next.layout.x = Math.min(next.layout.x, GRID_COLUMNS - next.layout.w)
      }
      if (axis === 'h') {
        next.layout.h = Math.max(2, Math.min(6, next.layout.h + delta))
      }
      return next
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      if (id) {
        await api.put(`/dashboards/${id}`, dashboard)
      } else {
        const response = await api.post('/dashboards', dashboard)
        navigate(`/dashboards/${response.data.dashboard._id}`, { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-sm text-apple-secondary">Loading...</div>
  }

  return (
    <div className="flex h-full flex-col -m-8">
      <div className="flex items-center gap-4 border-b border-apple-border bg-white px-6 py-3">
        <Link to="/dashboards" className="btn-ghost p-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="min-w-0 flex-1">
          <input
            value={dashboard.title}
            onChange={(e) => setDashboard(current => ({ ...current, title: e.target.value }))}
            className="w-full border-none bg-transparent text-base font-semibold text-apple-text outline-none"
          />
          <p className="mt-1 text-xs text-apple-secondary">
            One surface, resizable tiles, and layout controls like a real working dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(value => !value)} className={editing ? 'btn-secondary py-1.5' : 'btn-primary py-1.5'}>
            {editing ? <><EyeOff className="h-4 w-4" />Preview</> : <><Eye className="h-4 w-4" />Edit</>}
          </button>
          <button onClick={save} className="btn-primary py-1.5" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {editing && <WidgetPalette datasets={datasets} surveys={surveys} onAdd={addWidget} />}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-apple-bg">
          <div className="border-b border-apple-border/70 bg-white/70 px-6 py-3 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3 text-xs text-apple-secondary">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                <Zap className="h-3.5 w-3.5 text-apple-blue" />
                <span>12-column dashboard canvas</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5">
                <Settings className="h-3.5 w-3.5 text-apple-blue" />
                <span>Select a tile to move or resize it</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {sortedWidgets.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
                  <BarChart3 className="h-10 w-10 text-blue-300" />
                </div>
                <h3 className="mb-2 font-semibold text-apple-text">Empty Dashboard</h3>
                <p className="max-w-sm text-sm text-apple-secondary">
                  {editing ? 'Add widgets from the left and arrange them on this canvas like a Power BI board.' : 'No widgets added yet.'}
                </p>
              </div>
            ) : (
              <div
                className="grid min-h-[720px] gap-4 rounded-2xl border border-dashed border-apple-border/80 bg-white/40 p-4"
                style={{
                  gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
                  gridAutoRows: '110px',
                }}
              >
                <AnimatePresence>
                  {sortedWidgets.map((widget, index) => (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.03 }}
                      style={{
                        gridColumn: `${widget.layout.x + 1} / span ${widget.layout.w}`,
                        gridRow: `${widget.layout.y + 1} / span ${widget.layout.h}`,
                      }}
                      className="min-h-0"
                    >
                      <WidgetRenderer
                        widget={widget}
                        data={widgetData[widget.id]}
                        editing={editing}
                        selected={selectedWidget === widget.id}
                        onSelect={() => editing && setSelectedWidget(selectedWidget === widget.id ? null : widget.id)}
                        onDelete={() => deleteWidget(widget.id)}
                        isFullscreen={fullscreenWidget === widget.id}
                        onToggleFullscreen={() => setFullscreenWidget(fullscreenWidget === widget.id ? null : widget.id)}
                        onMove={(direction) => moveWidget(widget.id, direction)}
                        onResize={(axis, delta) => resizeWidget(widget.id, axis, delta)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {editing && selectedWidget && activeWidget && (
          <WidgetConfigPanel
            key={selectedWidget}
            widget={activeWidget}
            datasets={datasets}
            onUpdate={(updates) => updateWidget(selectedWidget, updates)}
            onClose={() => setSelectedWidget(null)}
          />
        )}
      </div>

      {fullscreenWidget && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setFullscreenWidget(null)}>
          <button
            onClick={() => setFullscreenWidget(null)}
            className="absolute right-5 top-5 rounded-full bg-white p-2 text-apple-text shadow-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
