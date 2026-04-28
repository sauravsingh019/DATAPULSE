import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import Survey from '../models/Survey.js'
import Response from '../models/Response.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public: get survey by share token
router.get('/public/:token', async (req, res) => {
  try {
    const survey = await Survey.findOne({ shareToken: req.params.token, status: 'active' })
      .select('-owner')
    if (!survey) return res.status(404).json({ message: 'Survey not found or inactive' })
    res.json({ survey })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Protected routes
router.use(protect)

router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select('-questions')
    res.json({ surveys })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const token = uuidv4().replace(/-/g, '').slice(0, 12)
    const survey = await Survey.create({ ...req.body, owner: req.user._id, shareToken: token })
    res.status(201).json({ survey })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id, owner: req.user._id })
    if (!survey) return res.status(404).json({ message: 'Survey not found' })
    res.json({ survey })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    if (!survey) return res.status(404).json({ message: 'Survey not found' })
    res.json({ survey })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await Survey.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    await Response.deleteMany({ survey: req.params.id })
    res.json({ message: 'Survey deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Analytics for a survey
router.get('/:id/analytics', async (req, res) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id, owner: req.user._id })
    if (!survey) return res.status(404).json({ message: 'Survey not found' })

    const responses = await Response.find({ survey: req.params.id })
    const totalResponses = responses.length
    const completed = responses.filter(r => r.status === 'completed').length

    // Per-question analytics
    const questionStats = survey.questions.map(q => {
      const answers = responses
        .flatMap(r => r.answers)
        .filter(a => a.questionId === q.id && !a.skipped)

      if (q.type === 'rating' || q.type === 'scale' || q.type === 'number') {
        const values = answers.map(a => Number(a.response)).filter(v => !isNaN(v))
        const sorted = [...values].sort((a, b) => a - b)
        const sum = values.reduce((a, b) => a + b, 0)
        const distribution = {}
        values.forEach(v => { distribution[v] = (distribution[v] || 0) + 1 })
        return {
          questionId: q.id, label: q.label, type: q.type,
          count: values.length, skipped: answers.filter(a => a.skipped).length,
          avg: values.length ? +(sum / values.length).toFixed(2) : null,
          min: sorted[0] ?? null, max: sorted[sorted.length - 1] ?? null,
          median: sorted[Math.floor(sorted.length / 2)] ?? null,
          distribution,
        }
      }

      if (q.type === 'multiple_choice' || q.type === 'dropdown' || q.type === 'yes_no') {
        const distribution = {}
        answers.forEach(a => {
          const v = String(a.response)
          distribution[v] = (distribution[v] || 0) + 1
        })
        return { questionId: q.id, label: q.label, type: q.type, count: answers.length, distribution }
      }

      return { questionId: q.id, label: q.label, type: q.type, count: answers.length,
        responses: answers.slice(0, 50).map(a => a.response) }
    })

    res.json({ survey: { _id: survey._id, title: survey.title },
      totalResponses, completed,
      completionRate: totalResponses > 0 ? +((completed / totalResponses) * 100).toFixed(1) : 0,
      questionStats, recentResponses: responses.slice(-10).reverse() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
