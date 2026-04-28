import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['rating', 'text', 'multiple_choice', 'checkbox', 'dropdown', 'scale', 'yes_no', 'date', 'number', 'email'], required: true },
  label: { type: String, required: true },
  description: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: [{ label: String, value: String }],
  min: Number,
  max: Number,
  minLabel: String,
  maxLabel: String,
  placeholder: String,
  order: { type: Number, default: 0 },
})

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'active', 'paused', 'closed'], default: 'draft' },
  questions: [questionSchema],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  settings: {
    allowAnonymous: { type: Boolean, default: true },
    showProgressBar: { type: Boolean, default: true },
    shuffleQuestions: { type: Boolean, default: false },
    autoResetSeconds: { type: Number, default: 60 },
    thankYouMessage: { type: String, default: 'Thank you for your response!' },
    redirectUrl: { type: String, default: '' },
  },
  theme: {
    primaryColor: { type: String, default: '#0071e3' },
    accentColor: { type: String, default: '#34c759' },
    logoUrl: { type: String, default: '' },
  },
  tags: [String],
  totalResponses: { type: Number, default: 0 },
  shareToken: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

surveySchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('Survey', surveySchema)
