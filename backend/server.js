import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import surveyRoutes from './routes/surveys.js'
import responseRoutes from './routes/responses.js'
import uploadRoutes from './routes/uploads.js'
import dashboardRoutes from './routes/dashboards.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/surveys', surveyRoutes)
app.use('/api/responses', responseRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/dashboards', dashboardRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'DataPulse API', version: '1.0.0' }))

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/datapulse'

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 DataPulse API running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
