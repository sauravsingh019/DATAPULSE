import { create } from 'zustand'
import api from '../utils/api'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('dp_user') || 'null'),
  token: localStorage.getItem('dp_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('dp_token', data.token)
      localStorage.setItem('dp_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false })
      return false
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('dp_token', data.token)
      localStorage.setItem('dp_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('dp_token')
    localStorage.removeItem('dp_user')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))
