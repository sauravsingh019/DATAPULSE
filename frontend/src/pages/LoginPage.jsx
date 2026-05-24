import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const { login, loading, error, clearError, token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const ok = await login(form.email, form.password)
    if (ok) navigate('/dashboard')
  }


  return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-apple-blue to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-apple-md">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-apple-text">DataPulse</h1>
          <p className="text-apple-secondary text-sm mt-1">Sign in to your workspace</p>
        </div>

        <div className="card p-7">
          {error && (
            <div className="mb-4 p-3 rounded-apple bg-red-50 border border-red-100 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-gray hover:text-apple-text">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-apple-secondary mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-apple-blue hover:underline font-medium">Create one</Link>
        </p>

        {/* Demo hint */}
        <div className="mt-4 p-3 rounded-apple bg-blue-50 border border-blue-100 text-xs text-blue-600 text-center">
          💡 Register a new account to get started
        </div>
      </motion.div>
    </div>
  )
}
