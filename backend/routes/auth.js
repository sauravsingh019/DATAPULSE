import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const getJwtSecret = () => process.env.JWT_SECRET || 'datapulse_secret_2024'
const sign = (id) => jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' })

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, role: role || 'analyst' })
    res.status(201).json({ user: user.toSafe(), token: sign(user._id) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    res.json({ user: user.toSafe(), token: sign(user._id) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user })
})

router.patch('/me', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true })
    res.json({ user: user.toSafe() })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
