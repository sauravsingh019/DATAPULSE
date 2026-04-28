import mongoose from 'mongoose'

const columnSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['string', 'number', 'boolean', 'date', 'mixed'] },
  unique: Number,
  nullCount: Number,
  sample: [mongoose.Schema.Types.Mixed],
  stats: {
    min: Number,
    max: Number,
    mean: Number,
    median: Number,
    mode: mongoose.Schema.Types.Mixed,
    stdDev: Number,
  },
})

const datasetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, enum: ['csv', 'json', 'survey', 'api', 'manual'], default: 'csv' },
  filename: String,
  filepath: String,
  rowCount: { type: Number, default: 0 },
  columns: [columnSchema],
  data: { type: mongoose.Schema.Types.Mixed },  // Store small datasets inline
  status: { type: String, enum: ['processing', 'ready', 'error'], default: 'ready' },
  tags: [String],
  survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Dataset', datasetSchema)
