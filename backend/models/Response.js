import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionLabel: String,
  questionType: String,
  response: mongoose.Schema.Types.Mixed,
  skipped: { type: Boolean, default: false },
})

const responseSchema = new mongoose.Schema({
  survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  sessionId: { type: String, required: true },
  respondent: {
    ip: String,
    userAgent: String,
    location: String,
  },
  answers: [answerSchema],
  status: { type: String, enum: ['partial', 'completed'], default: 'completed' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: Date.now },
  duration: Number, // seconds
  metadata: mongoose.Schema.Types.Mixed,
})

export default mongoose.model('Response', responseSchema)
