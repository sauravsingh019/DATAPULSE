import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import Dataset from '../models/Dataset.js'
import { protect } from '../middleware/auth.js'

const require = createRequire(import.meta.url)
const csvParser = require('csv-parser')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/'
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.json']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only CSV and JSON files are supported'))
  },
})

function inferType(values) {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '')
  if (nonNull.length === 0) return 'string'
  if (nonNull.every(v => !isNaN(Number(v)))) return 'number'
  if (nonNull.every(v => ['true','false','yes','no','1','0'].includes(String(v).toLowerCase()))) return 'boolean'
  if (nonNull.every(v => !isNaN(Date.parse(v)))) return 'date'
  return 'string'
}

function computeStats(values, type) {
  if (type !== 'number') return {}
  const nums = values.filter(v => v !== null && v !== '').map(Number).filter(n => !isNaN(n))
  if (!nums.length) return {}
  const sorted = [...nums].sort((a, b) => a - b)
  const sum = nums.reduce((a, b) => a + b, 0)
  const mean = sum / nums.length
  const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length
  return {
    min: sorted[0], max: sorted[sorted.length - 1], mean: +mean.toFixed(3),
    median: sorted[Math.floor(sorted.length / 2)],
    stdDev: +Math.sqrt(variance).toFixed(3),
  }
}

router.use(protect)

router.post('/csv', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

  try {
    const rows = []
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on('data', row => rows.push(row))
        .on('end', resolve)
        .on('error', reject)
    })

    if (!rows.length) return res.status(400).json({ message: 'CSV file is empty' })

    const columns = Object.keys(rows[0]).map(name => {
      const values = rows.map(r => r[name])
      const type = inferType(values)
      const unique = new Set(values).size
      const nullCount = values.filter(v => !v).length
      return { name, type, unique, nullCount, sample: values.slice(0, 5), stats: computeStats(values, type) }
    })

    const dataset = await Dataset.create({
      name: req.body.name || req.file.originalname.replace('.csv', ''),
      description: req.body.description || '',
      owner: req.user._id,
      source: 'csv',
      filename: req.file.originalname,
      filepath: req.file.path,
      rowCount: rows.length,
      columns,
      data: rows.slice(0, 1000), // Store max 1000 rows inline
      status: 'ready',
    })

    res.status(201).json({ dataset })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const datasets = await Dataset.find({ owner: req.user._id }).sort({ createdAt: -1 }).select('-data')
    res.json({ datasets })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const dataset = await Dataset.findOne({ _id: req.params.id, owner: req.user._id })
    if (!dataset) return res.status(404).json({ message: 'Dataset not found' })
    res.json({ dataset })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const dataset = await Dataset.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (dataset?.filepath && fs.existsSync(dataset.filepath)) fs.unlinkSync(dataset.filepath)
    res.json({ message: 'Dataset deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
