import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import api from '../utils/api'
import { Database, Upload, Trash2, Eye, FileText, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    api.get('/upload').then(r => { setDatasets(r.data.datasets || []); setLoading(false) })
  }
  useEffect(load, [])

  const onDrop = useCallback((files) => {
    if (files[0]) {
      setPendingFile(files[0])
      setUploadName(files[0].name.replace(/\.(csv|json)$/i, ''))
      setShowForm(true)
      setError('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'], 'application/json': ['.json'] }, multiple: false,
  })

  const upload = async () => {
    if (!pendingFile) return
    setUploading(true); setError('')
    try {
      const form = new FormData()
      form.append('file', pendingFile)
      form.append('name', uploadName)
      form.append('description', uploadDesc)
      const { data } = await api.post('/upload/csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setDatasets(d => [data.dataset, ...d])
      setPendingFile(null); setShowForm(false); setUploadName(''); setUploadDesc('')
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteDataset = async (id) => {
    if (!confirm('Delete this dataset?')) return
    await api.delete(`/upload/${id}`)
    setDatasets(d => d.filter(ds => ds._id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="section-title">Datasets</h1>
          <p className="text-apple-secondary mt-1">Upload and analyze CSV files</p>
        </div>
      </div>

      {/* Upload Zone */}
      {!showForm ? (
        <div {...getRootProps()}
          className={`card border-2 border-dashed p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-apple-blue bg-blue-50' : 'border-apple-border hover:border-apple-blue/50 hover:bg-apple-bg'}`}>
          <input {...getInputProps()} />
          <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragActive ? 'text-apple-blue' : 'text-apple-gray'}`} />
          <p className="font-semibold text-apple-text">
            {isDragActive ? 'Drop to upload' : 'Drag & drop a CSV or JSON file'}
          </p>
          <p className="text-sm text-apple-secondary mt-1">or click to browse · Max 50MB</p>
        </div>
      ) : (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-apple-bg rounded-apple">
            <FileText className="w-5 h-5 text-apple-blue" />
            <span className="text-sm font-medium text-apple-text">{pendingFile?.name}</span>
            <span className="text-xs text-apple-secondary ml-auto">{(pendingFile?.size / 1024).toFixed(0)} KB</span>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-apple text-red-600 text-sm flex gap-2"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
          <div>
            <label className="label">Dataset Name</label>
            <input className="input" value={uploadName} onChange={e => setUploadName(e.target.value)} />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <input className="input" value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} placeholder="What is this data about?" />
          </div>
          <div className="flex gap-2">
            <button onClick={upload} className="btn-primary" disabled={uploading}>
              {uploading ? <><Loader className="w-4 h-4 animate-spin" />Uploading…</> : <><CheckCircle className="w-4 h-4" />Upload Dataset</>}
            </button>
            <button onClick={() => { setShowForm(false); setPendingFile(null) }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-apple-secondary text-sm">Loading…</div>
      ) : datasets.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <Database className="w-14 h-14 text-apple-border mb-4" />
          <h3 className="font-semibold text-apple-text mb-2">No datasets yet</h3>
          <p className="text-apple-secondary text-sm">Upload a CSV or JSON file to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {datasets.map((ds, i) => (
              <motion.div key={ds._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                className="card p-5 hover:shadow-apple-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-apple-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-apple-text">{ds.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm text-apple-secondary">{ds.rowCount?.toLocaleString()} rows</span>
                      <span className="text-apple-border">·</span>
                      <span className="text-sm text-apple-secondary">{ds.columns?.length} columns</span>
                      <span className="text-apple-border">·</span>
                      <span className="text-sm text-apple-secondary capitalize">{ds.source}</span>
                    </div>
                    {ds.description && <p className="text-xs text-apple-gray mt-0.5">{ds.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusDot status={ds.status} />
                    <Link to={`/datasets/${ds._id}`} className="btn-ghost p-2" title="View">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => deleteDataset(ds._id)} className="btn-ghost p-2 hover:text-apple-red">
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

function StatusDot({ status }) {
  const map = { ready: 'bg-apple-green', processing: 'bg-apple-orange', error: 'bg-apple-red' }
  return <span className={`w-2 h-2 rounded-full ${map[status] || 'bg-apple-gray'}`} title={status} />
}
