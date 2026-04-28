import mongoose from 'mongoose'

const widgetSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['bar', 'line', 'pie', 'donut', 'area', 'scatter', 'kpi', 'table', 'heatmap', 'funnel', 'gauge', 'text', 'map'] },
  title: String,
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  config: {
    xField: String,
    yField: String,
    groupBy: String,
    aggregation: { type: String, enum: ['count', 'sum', 'avg', 'min', 'max'], default: 'count' },
    filters: [{ field: String, operator: String, value: mongoose.Schema.Types.Mixed }],
    colors: [String],
    showLegend: { type: Boolean, default: true },
    showGrid: { type: Boolean, default: true },
    questionIds: [String],
  },
  layout: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    w: { type: Number, default: 4 },
    h: { type: Number, default: 3 },
  },
})

const dashboardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  widgets: [widgetSchema],
  isPublic: { type: Boolean, default: false },
  shareToken: { type: String, unique: true, sparse: true },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model('Dashboard', dashboardSchema)
