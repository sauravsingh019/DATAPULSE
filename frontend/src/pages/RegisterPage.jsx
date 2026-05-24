import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { register, loading, error, clearError, token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const ok = await register(form.name, form.email, form.password)
    if (ok) navigate('/dashboard')
  }


  return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-apple-blue to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-apple-md">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-apple-text">Create Account</h1>
          <p className="text-apple-secondary text-sm mt-1">Start your analytics journey</p>
        </div>

        <div className="card p-7">
          {error && <div className="mb-4 p-3 rounded-apple bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[['name','Name','John Doe','text'],['email','Email','you@example.com','email'],['password','Password','••••••••','password']].map(([key,label,ph,type]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type={type} className="input" placeholder={ph}
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
              </div>
            ))}
            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-apple-secondary mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-apple-blue hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
