import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import Dashboard from '../models/Dashboard.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/', async (req, res) => {
  try {
    const dashboards = await Dashboard.find({ owner: req.user._id }).sort({ updatedAt: -1 })
    res.json({ dashboards })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const token = uuidv4().replace(/-/g, '').slice(0, 12)
    const dashboard = await Dashboard.create({ ...req.body, owner: req.user._id, shareToken: token })
    res.status(201).json({ dashboard })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('widgets.datasetId', 'name columns rowCount')
      .populate('widgets.surveyId', 'title totalResponses')
    if (!dashboard) return res.status(404).json({ message: 'Dashboard not found' })
    res.json({ dashboard })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const dashboard = await Dashboard.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    if (!dashboard) return res.status(404).json({ message: 'Dashboard not found' })
    res.json({ dashboard })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Dashboard.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    res.json({ message: 'Dashboard deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
