import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import Response from '../models/Response.js'
import Survey from '../models/Survey.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public: submit response
router.post('/submit', async (req, res) => {
  try {
    const { surveyId, sessionId, answers, duration } = req.body
    const survey = await Survey.findById(surveyId)
    if (!survey) return res.status(404).json({ message: 'Survey not found' })

    const response = await Response.create({
      survey: surveyId, sessionId: sessionId || uuidv4(),
      answers, duration, status: 'completed',
      respondent: { ip: req.ip, userAgent: req.headers['user-agent'] },
    })

    await Survey.findByIdAndUpdate(surveyId, { $inc: { totalResponses: 1 } })
    res.status(201).json({ response })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Protected: list responses for a survey
router.get('/survey/:surveyId', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const survey = await Survey.findOne({ _id: req.params.surveyId, owner: req.user._id })
    if (!survey) return res.status(403).json({ message: 'Access denied' })

    const responses = await Response.find({ survey: req.params.surveyId })
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Response.countDocuments({ survey: req.params.surveyId })
    res.json({ responses, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Export responses as CSV
router.get('/survey/:surveyId/export', protect, async (req, res) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.surveyId, owner: req.user._id })
    if (!survey) return res.status(403).json({ message: 'Access denied' })

    const responses = await Response.find({ survey: req.params.surveyId })
    const headers = ['sessionId', 'submittedAt', 'duration', ...survey.questions.map(q => q.label)]
    const rows = responses.map(r => {
      const rowData = [r.sessionId, r.submittedAt?.toISOString(), r.duration ?? '']
      survey.questions.forEach(q => {
        const ans = r.answers.find(a => a.questionId === q.id)
        rowData.push(ans?.skipped ? 'SKIPPED' : (ans?.response ?? ''))
      })
      return rowData
    })

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="datapulse-${req.params.surveyId}.csv"`)
    res.send(csv)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
