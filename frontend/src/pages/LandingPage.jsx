import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import BackgroundPulse from '../components/BackgroundPulse'
import {
  Zap, ArrowRight, Check, BarChart3, ClipboardList, Database,
  Users, Lock, Plus, X, ChevronDown, Play, Sparkles, Star,
  CheckCircle2, Eye, EyeOff, Globe, Shield, RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandingPage() {
  const { user, token, login, register, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login') // 'login' | 'register'

  // Pricing State
  const [billingPeriod, setBillingPeriod] = useState('monthly') // 'monthly' | 'yearly'

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState(null)

  // Auth Form State
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState(null)

  // Interactive Survey Feature State

  const [surveyAnswer, setSurveyAnswer] = useState(null)
  const [surveySubmitting, setSurveySubmitting] = useState(false)
  const [surveySubmitted, setSurveySubmitted] = useState(false)

  // Interactive Dataset Feature State
  const [selectedColumn, setSelectedColumn] = useState('revenue')

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  useEffect(() => {
    // Clear auth errors when switching tabs or opening/closing modal
    clearError()
    setLocalError(null)
  }, [authTab, modalOpen, clearError])


  const openAuthModal = (tab = 'login') => {
    setAuthTab(tab)
    setAuthForm({ name: '', email: '', password: '' })
    setModalOpen(true)
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    clearError()
    setLocalError(null)

    if (authTab === 'login') {
      const ok = await login(authForm.email, authForm.password)
      if (ok) {
        setModalOpen(false)
        navigate('/dashboard')
      }
    } else {
      if (!authForm.name.trim()) {
        setLocalError('Name is required')
        return
      }
      const ok = await register(authForm.name, authForm.email, authForm.password)
      if (ok) {
        setModalOpen(false)
        navigate('/dashboard')
      }
    }
  }

  // Interactive features simulations
  const handleSurveySubmit = (e) => {
    e.preventDefault()
    if (!surveyAnswer) return
    setSurveySubmitting(true)
    setTimeout(() => {
      setSurveySubmitting(false)
      setSurveySubmitted(true)
    }, 800)
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterSubscribed(true)
    setNewsletterEmail('')
    setTimeout(() => setNewsletterSubscribed(false), 5000)
  }

  // Sample data for simulations
  const columnsData = {
    revenue: {
      type: 'Number',
      mean: '$45,230',
      max: '$98,400',
      min: '$12,500',
      distribution: [30, 45, 65, 80, 50, 20]
    },
    satisfaction: {
      type: 'Rating (1-5)',
      mean: '4.7 / 5',
      max: '5.0',
      min: '2.0',
      distribution: [5, 10, 15, 30, 80, 150]
    },
    department: {
      type: 'Categorical',
      mean: 'N/A',
      max: 'Sales (42%)',
      min: 'Legal (3%)',
      distribution: [80, 60, 45, 20, 10, 5]
    }
  }

  return (
    <div className="relative min-h-screen bg-white text-apple-text font-sans overflow-x-hidden">
      
      {/* Crisp White Background with premium, ultra-soft Apple Blue & Purple ambient glowing pastels */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-gradient-to-br from-apple-blue/10 to-apple-purple/5 blur-[130px]" />
        <div className="absolute top-[35%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-apple-purple/5 to-apple-blue/10 blur-[150px]" />
        <div className="absolute bottom-[15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-apple-blue/5 to-apple-purple/5 blur-[120px]" />
      </div>

      {/* 1. GLASSMORPHISM FLOATING HEADER */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-apple bg-white/75 border-b border-slate-100 text-apple-text transition-all duration-300 shadow-[0_2px_15px_rgba(0,113,227,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center shadow-[0_4px_12px_rgba(0,113,227,0.15)] group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-apple-blue to-apple-purple">
              DataPulse
            </span>
          </Link>

          {/* Navigation Anchors - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            {['features', 'demo', 'pricing', 'faq'].map((anchor) => (
              <a
                key={anchor}
                href={`#${anchor}`}
                className="text-sm font-semibold transition-colors capitalize text-slate-500 hover:text-apple-blue"
              >
                {anchor === 'demo' ? 'Live Showcase' : anchor === 'faq' ? 'FAQs' : anchor}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {token ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 bg-[#0066cc] text-white border-none shadow-[0_3px_0_#004494,0_6px_15px_rgba(0,113,227,0.12)] hover:bg-[#0055b3] active:translate-y-[2px] active:shadow-[0_1px_0_#004494] transition-all duration-200 font-bold cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal('login')}
                  className="text-sm font-bold transition-colors px-3 py-2 text-slate-500 hover:text-apple-blue"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuthModal('register')}
                  className="btn-primary px-4 py-2 bg-[#0066cc] text-white border-none shadow-[0_3px_0_#004494,0_6px_15px_rgba(0,113,227,0.12)] hover:bg-[#0055b3] active:translate-y-[2px] active:shadow-[0_1px_0_#004494] transition-all duration-200 font-bold flex items-center cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-apple-blue text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-apple-blue" />
              Next-Gen MERN Analytics Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-apple-text">
              Transform Data into{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-apple-blue to-apple-purple animate-pulse-slow">
                Actionable Pulse
              </span>
            </h1>
            
            <p className="text-lg text-apple-secondary max-w-xl mx-auto lg:mx-0 font-medium">
              Build drag-and-drop feedback surveys, extract robust statistics from CSV/JSON datasets, and construct live, interactive PowerBI-style dashboards in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => openAuthModal('register')}
                className="btn-primary w-full sm:w-auto text-base px-6 py-3.5 justify-center bg-[#0066cc] text-white border-none shadow-[0_4px_0_#004494,0_8px_20px_rgba(0,113,227,0.12)] hover:bg-[#0055b3] active:translate-y-[3px] active:shadow-[0_1px_0_#004494] transition-all duration-200 font-extrabold flex items-center cursor-pointer"
              >
                Launch Your Workspace Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
              <a 
                href="#demo"
                className="btn-secondary w-full sm:w-auto text-base px-6 py-3.5 justify-center border-2 border-slate-200 bg-white text-apple-text shadow-[0_4px_0_#e2e8f0] hover:border-apple-blue hover:text-apple-blue hover:bg-blue-50/10 active:translate-y-[2px] active:shadow-[0_1px_0_#e2e8f0] transition-all duration-200 font-bold flex items-center cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-current mr-2" />
                Live Interactive Demo
              </a>
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-apple-gray font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-apple-green" /> No credit card required
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-apple-green" /> 1-Click setup
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-apple-green" /> 100% Secure JWT Auth
              </div>
            </div>
          </motion.div>

          {/* Right Mockup/Canvas Column */}
          <div className="lg:col-span-6 relative">
            {/* Background glowing circle */}
            <div className="absolute inset-0 bg-gradient-to-tr from-apple-blue/5 to-apple-purple/5 blur-3xl rounded-full" />
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden"
            >
              {/* Fake Window bar */}
              <div className="bg-[#f8fafc] border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="ml-4 px-3 py-0.5 rounded bg-white border border-slate-100 text-[10px] text-apple-gray font-mono tracking-tight shadow-sm flex-1 max-w-[240px] truncate">
                  app.datapulse.io/dashboard
                </div>
              </div>

              {/* Mockup Content */}
              <div className="p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                    <p className="text-[10px] uppercase tracking-wider text-apple-gray font-bold">Total Responses</p>
                    <p className="text-xl font-extrabold text-apple-blue mt-1">12,845</p>
                    <span className="text-[9px] font-semibold text-apple-green">+14.2% this wk</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                    <p className="text-[10px] uppercase tracking-wider text-apple-gray font-bold">Datasets</p>
                    <p className="text-xl font-extrabold text-apple-purple mt-1">42</p>
                    <span className="text-[9px] font-semibold text-apple-green">Auto Indexing</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                    <p className="text-[10px] uppercase tracking-wider text-apple-gray font-bold">Active Dashboards</p>
                    <p className="text-xl font-extrabold text-apple-orange mt-1">18</p>
                    <span className="text-[9px] font-semibold text-apple-secondary">Live Synced</span>
                  </div>
                </div>

                {/* Simulated Chart */}
                <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.02)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-apple-text">User Growth & Conversion Trend</h4>
                      <p className="text-[10px] text-apple-secondary">Monthly analytics preview</p>
                    </div>
                    <span className="badge-blue bg-blue-50 text-apple-blue font-extrabold text-[10px] px-2 py-0.5 rounded-full">Live Update</span>
                  </div>
                  
                  {/* Visual Chart Bars */}
                  <div className="h-32 flex items-end gap-2 pt-4 justify-between">
                    {[35, 55, 40, 75, 90, 60, 85, 110, 95, 120, 135].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div 
                          className="w-full rounded-t bg-gradient-to-t from-apple-blue to-apple-purple opacity-90 hover:opacity-100 transition-all cursor-pointer relative group"
                          style={{ height: `${(val / 140) * 100}%` }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-apple-text text-white text-[9px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none whitespace-nowrap shadow-md">
                            {val * 10} pts
                          </div>
                        </div>
                        <span className="text-[8px] text-apple-gray font-mono font-medium">M{idx+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Indicator */}
                <div className="flex items-center justify-between text-xs p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-apple-secondary flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse" />
                    Connected to AWS & MongoDB Cloud instances
                  </span>
                  <button 
                    onClick={() => openAuthModal('register')} 
                    className="text-[11px] font-extrabold text-apple-blue hover:text-apple-blueDark transition-colors flex items-center gap-0.5"
                  >
                    Configure Pipeline <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC STATS / SOCIAL PROOF */}
      <section className="bg-white border-y border-apple-border/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold tracking-wider text-apple-gray uppercase mb-8">
            Empowering Modern Startups, Scale-ups and Data-driven Teams
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center items-center">
            <div>
              <p className="text-3xl font-extrabold text-apple-text">5.2M+</p>
              <p className="text-xs text-apple-secondary mt-1">Data Events Daily</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-apple-text">99.99%</p>
              <p className="text-xs text-apple-secondary mt-1">API Live Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-apple-text">12,500+</p>
              <p className="text-xs text-apple-secondary mt-1">Active Survey Forms</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-apple-text">8x</p>
              <p className="text-xs text-apple-secondary mt-1">Faster Dashboard Launch</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES DYNAMIC SHOWCASE */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-apple-text">
            Enterprise-Grade Features Built for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-apple-blue to-apple-purple">
              Launching Products
            </span>
          </h2>
          <p className="text-base sm:text-lg text-apple-secondary font-medium">
            Equipped with tools covering the entire data lifecycle. From responsive data collection to deep summaries and pixel-perfect dynamic reporting dashboards.
          </p>
        </motion.div>

        {/* Feature 1: Survey Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-apple-blue flex items-center justify-center shadow-sm border border-blue-100">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-apple-text tracking-tight">
              1. Drag-and-Drop Responsive Survey Creator
            </h3>
            <p className="text-base text-apple-secondary font-medium leading-relaxed">
              Design gorgeous forms with 10+ advanced question types: rating scales, NPS, multiple choices, and text inputs. Includes a custom tablet-friendly **Kiosk Mode** with auto-reset and inactivity timers, perfect for in-person responses.
            </p>
            <ul className="space-y-3">
              {[
                'NPS, Rating Scales, Radio & Checkboxes',
                'Shareable public links & inline embedding',
                'Automatic completion rate and drop-off analytics',
                'Device Kiosk mode with custom timeouts'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-apple-text">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Interactive Survey Simulation */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h4 className="text-sm font-extrabold text-apple-text">Live Feature Preview</h4>
                  <p className="text-[11px] text-apple-secondary font-medium">Interactive Drag-and-Drop Survey Kiosk</p>
                </div>
                <span className="badge-green bg-green-50 text-apple-green font-extrabold text-[10px] px-2 py-0.5 rounded-full">Kiosk Ready</span>
              </div>

              {!surveySubmitted ? (
                <form onSubmit={handleSurveySubmit} className="space-y-5">
                  <p className="text-sm font-extrabold text-apple-text">
                    Question: How satisfied are you with our real-time CSV analytics tools?
                  </p>
                  
                  {/* Rating 1 to 5 selector */}
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setSurveyAnswer(score)}
                        className={`flex-1 py-3 rounded-xl border text-sm font-extrabold transition-all duration-200 cursor-pointer active:translate-y-[2px] ${
                          surveyAnswer === score
                            ? 'bg-[#0066cc] text-white border-none shadow-[0_3px_0_#004494] scale-102 active:shadow-[0_1px_0_#004494]'
                            : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 shadow-[0_3px_0_#cbd5e1] hover:border-slate-300 active:shadow-[0_1px_0_#cbd5e1]'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between text-[11px] font-semibold text-apple-secondary px-1">
                    <span>1 — Disappointed</span>
                    <span>5 — Extremely Happy</span>
                  </div>

                  <button
                    type="submit"
                    disabled={!surveyAnswer || surveySubmitting}
                    className="w-full justify-center py-3 rounded-xl text-xs font-bold bg-[#0066cc] text-white border-none shadow-[0_3px_0_#004494,0_6px_15px_rgba(0,113,227,0.12)] hover:bg-[#0055b3] active:translate-y-[2px] active:shadow-[0_1px_0_#004494] transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {surveySubmitting ? 'Recording Response...' : 'Submit Feedback'}
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-green-50 text-apple-green flex items-center justify-center mx-auto shadow-sm">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-apple-text">Feedback Submitted Successfully!</h5>
                    <p className="text-xs text-apple-secondary mt-1 font-medium">The system recorded rating {surveyAnswer} / 5 into analytics.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSurveyAnswer(null)
                      setSurveySubmitted(false)
                    }}
                    className="text-xs font-extrabold text-apple-blue hover:text-apple-blueDark hover:underline"
                  >
                    Try Another Response
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Feature 2: Dataset Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Simulation Area */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 order-2 lg:order-1"
          >
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h4 className="text-sm font-extrabold text-apple-text">Auto-Detect Dataset Explorer</h4>
                  <p className="text-[11px] text-apple-secondary font-medium">Click columns to inspect statistics instantly</p>
                </div>
                <span className="badge-blue bg-blue-50 text-apple-blue font-extrabold text-[10px] px-2 py-0.5 rounded-full">CSV/JSON Engine</span>
              </div>

              {/* Column selector tabs */}
              <div className="flex gap-2 mb-4 bg-slate-50 p-1 rounded-xl">
                {Object.keys(columnsData).map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColumn(col)}
                    className={`flex-1 py-2 rounded-lg text-xs font-extrabold capitalize transition-all duration-200 ${
                      selectedColumn === col
                        ? 'bg-gradient-to-r from-apple-blue to-apple-purple text-white shadow-[0_4px_12px_rgba(0,113,227,0.18)]'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>

              {/* Detailed statistical preview card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.01)] text-center">
                  <span className="text-[10px] text-apple-gray uppercase tracking-wider font-extrabold">Datatype</span>
                  <p className="text-xs font-extrabold text-apple-blue mt-1">{columnsData[selectedColumn].type}</p>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.01)] text-center">
                  <span className="text-[10px] text-apple-gray uppercase tracking-wider font-extrabold">Mean / Median</span>
                  <p className="text-xs font-extrabold text-apple-purple mt-1">{columnsData[selectedColumn].mean}</p>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.01)] text-center">
                  <span className="text-[10px] text-apple-gray uppercase tracking-wider font-extrabold">Max Record</span>
                  <p className="text-xs font-extrabold text-apple-blue mt-1">{columnsData[selectedColumn].max}</p>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 shadow-[0_4px_10px_rgba(0,0,0,0.01)] text-center">
                  <span className="text-[10px] text-apple-gray uppercase tracking-wider font-extrabold">Min Record</span>
                  <p className="text-xs font-extrabold text-apple-purple mt-1">{columnsData[selectedColumn].min}</p>
                </div>
              </div>

              {/* Small distribution preview chart */}
              <div className="bg-slate-50/20 border border-slate-100 p-4 rounded-xl space-y-2">
                <p className="text-[11px] font-bold text-apple-secondary capitalize">{selectedColumn} Value Distribution</p>
                <div className="h-20 flex items-end gap-3 justify-center pt-2">
                  {columnsData[selectedColumn].distribution.map((val, idx) => (
                    <div key={idx} className="flex-1 bg-gradient-to-t from-apple-blue to-apple-purple opacity-90 hover:opacity-100 rounded-t transition-all duration-200 cursor-pointer" style={{ height: `${(val / 160) * 100}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6 order-1 lg:order-2"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 text-apple-green flex items-center justify-center shadow-sm border border-green-100">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-apple-text tracking-tight">
              2. 1-Click CSV & JSON Analytical Summary
            </h3>
            <p className="text-base text-apple-secondary font-medium leading-relaxed">
              Upload raw transaction csv or json files up to 50MB. Our backend engine automatically reads datatypes (integers, strings, floats, dates, booleans) and calculates robust metrics including min, max, mean, and category counts in under 2 seconds.
            </p>
            <ul className="space-y-3">
              {[
                'Smart auto column type-detection',
                'Instant statistical summaries (std dev, mean, min, max)',
                'Value occurrences distribution charts',
                'Tabular data explorer with robust search & sorting'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-apple-text">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Feature 3: Dashboard Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-apple-purple flex items-center justify-center shadow-sm border border-purple-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-apple-text tracking-tight">
              3. PowerBI-Style Custom Dashboard Canvas
            </h3>
            <p className="text-base text-apple-secondary font-medium leading-relaxed">
              Construct complex, high-fidelity business intelligence dashboards with a full drag-and-drop widget builder. Place Bar Charts, Line Graphs, Area Plots, Donut Charts, and customized KPI Cards connected directly to your dataset variables.
            </p>
            <ul className="space-y-3">
              {[
                'Drag-and-drop customizable canvas builder',
                'Visual widgets: Bar, Line, Area, Pie, KPI, Tables',
                'Dynamically links dataset columns to chart variables',
                'Fully shareable dashboard view & theme editor'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-apple-text">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Layout Canvas Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-extrabold text-apple-text">Interactive Widget Canvas</h4>
                  <p className="text-[11px] text-apple-secondary font-medium">Simulated layout customizer</p>
                </div>
                <span className="badge bg-purple-50 text-apple-purple font-extrabold text-[10px] px-2 py-0.5 rounded-full">Canvas Mode</span>
              </div>

              {/* Grid with visual widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border border-slate-100 bg-white hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] rounded-xl flex flex-col justify-between h-28 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-apple-gray font-extrabold">Revenue widget</span>
                    <BarChart3 className="w-3.5 h-3.5 text-apple-blue animate-pulse" />
                  </div>
                  <div className="h-10 w-full flex items-end gap-1">
                    <div className="h-6 flex-1 bg-gradient-to-t from-apple-blue to-apple-purple rounded-t" />
                    <div className="h-9 flex-1 bg-gradient-to-t from-apple-blue to-apple-purple rounded-t" />
                    <div className="h-7 flex-1 bg-gradient-to-t from-apple-blue to-apple-purple rounded-t" />
                    <div className="h-10 flex-1 bg-gradient-to-t from-apple-blue to-apple-purple rounded-t" />
                  </div>
                </div>

                <div className="p-3 border border-slate-100 bg-white hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] rounded-xl flex flex-col justify-between h-28 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider text-apple-gray font-extrabold">Churn widget</span>
                    <RefreshCw className="w-3.5 h-3.5 text-apple-red animate-spin-slow" />
                  </div>
                  <p className="text-xl font-extrabold text-apple-red">1.42%</p>
                  <span className="text-[8px] text-apple-green font-semibold">▼ 0.2% vs last month</span>
                </div>

                {/* Simulated add widget */}
                <div 
                  onClick={() => openAuthModal('register')}
                  className="p-3 border-2 border-dashed border-slate-200 bg-slate-50/30 hover:bg-slate-50/80 hover:border-slate-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.02)] rounded-xl flex flex-col items-center justify-center h-28 transition-all duration-200 cursor-pointer text-center group"
                >
                  <Plus className="w-6 h-6 text-apple-purple group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-extrabold text-apple-purple mt-2">Add Canvas Widget</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. INTERACTIVE PRODUCT SHOWCASE - STEPPER */}
      <section className="bg-white border-y border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <h2 className="text-3xl font-extrabold text-apple-text tracking-tight">Simple 3-Step Setup Workflow</h2>
            <p className="text-apple-secondary text-base font-medium">Follow our optimized startup pipeline to go from raw audience queries to predictive analytics.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.02)] rounded-3xl p-8 space-y-5 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,113,227,0.04)] hover:border-slate-200 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple text-white flex items-center justify-center font-extrabold shadow-[0_4px_12px_rgba(0,113,227,0.15)]">1</div>
              <h4 className="text-lg font-extrabold text-apple-text">Gather Feedback & Files</h4>
              <p className="text-sm text-apple-secondary leading-relaxed font-medium">Deploy drag-and-drop surveys or drag and drop raw CSV/JSON analytics spreadsheets into the system.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.02)] rounded-3xl p-8 space-y-5 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,113,227,0.04)] hover:border-slate-200 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple text-white flex items-center justify-center font-extrabold shadow-[0_4px_12px_rgba(0,113,227,0.15)]">2</div>
              <h4 className="text-lg font-extrabold text-apple-text">Process & Aggregate</h4>
              <p className="text-sm text-apple-secondary leading-relaxed font-medium">Our automated pipeline computes standard variations, metrics, category percentages, and charts instantly.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.02)] rounded-3xl p-8 space-y-5 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,113,227,0.04)] hover:border-slate-200 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple text-white flex items-center justify-center font-extrabold shadow-[0_4px_12px_rgba(0,113,227,0.15)]">3</div>
              <h4 className="text-lg font-extrabold text-apple-text">Render Dynamic Insight</h4>
              <p className="text-sm text-apple-secondary leading-relaxed font-medium">Drag dashboard widgets on canvas to show stats live. Share public URLs or export files into CSV reports.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE PRICING GRID */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-apple-text">Transparent Startup Pricing Packages</h2>
          <p className="text-apple-secondary text-sm">Flexible options that adapt to your user counts. Upgrade or downgrade seamlessly as you launch.</p>
          
          {/* Monthly/Yearly toggle */}
          <div className="inline-flex items-center gap-1 bg-apple-bg border border-apple-border/40 p-1.5 rounded-full mt-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-apple-blue text-white shadow'
                  : 'text-apple-secondary hover:text-apple-text'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === 'yearly'
                  ? 'bg-apple-blue text-white shadow'
                  : 'text-apple-secondary hover:text-apple-text'
              }`}
            >
              Yearly Billing
              <span className="bg-apple-green text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Free Package */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.02)] rounded-3xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-300 p-8 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Workspace Free</span>
              <p className="text-3xl font-extrabold text-apple-text mt-4">
                $0
              </p>
              <p className="text-xs text-apple-gray mt-1">Lifetime free, no trial restrictions</p>
              
              <hr className="my-6 border-apple-border/20" />
              
              <ul className="space-y-4 text-sm font-semibold text-apple-secondary">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Up to 3 active surveys
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> 100 survey submissions / month
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Max 2MB CSV uploads
                </li>
                <li className="flex items-center gap-2.5 text-apple-gray/60 line-through">
                  <X className="w-4 h-4 text-red-500 bg-red-100 p-0.5 rounded-full flex-shrink-0" /> Custom Dashboard widgets
                </li>
                <li className="flex items-center gap-2.5 text-apple-gray/60 line-through">
                  <X className="w-4 h-4 text-red-500 bg-red-100 p-0.5 rounded-full flex-shrink-0" /> Public sharing embeds
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => openAuthModal('register')}
              className="w-full justify-center mt-8 py-3 rounded-xl font-bold border border-slate-200 text-slate-700 bg-white shadow-[0_4px_0_#e2e8f0] hover:bg-slate-50 hover:border-apple-blue hover:text-apple-blue active:translate-y-[2px] active:shadow-[0_1px_0_#e2e8f0] transition-all duration-200 flex items-center justify-center cursor-pointer"
            >
              Sign Up Free
            </button>
          </motion.div>

          {/* Growth Package (Most Popular) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border-2 border-apple-blue/20 shadow-[0_20px_50px_rgba(0,113,227,0.06)] rounded-3xl relative overflow-hidden transform md:-translate-y-2 hover:-translate-y-3.5 hover:shadow-[0_24px_60px_rgba(0,113,227,0.1)] hover:border-apple-blue/40 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top highlight badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-apple-blue to-apple-purple text-white text-[9px] font-extrabold px-4 py-1.5 rounded-bl uppercase tracking-widest">
              Recommended Startup Option
            </div>
            
            <div className="p-8 flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-extrabold text-apple-purple uppercase tracking-widest">Growth Plan</span>
                <p className="text-4xl font-extrabold text-apple-text mt-4 flex items-baseline">
                  {billingPeriod === 'monthly' ? '$29' : '$23'}
                  <span className="text-xs text-apple-secondary font-semibold ml-1">/ month</span>
                </p>
                <p className="text-xs text-apple-gray mt-1 font-semibold">Billed {billingPeriod === 'monthly' ? 'monthly' : 'yearly (20% off)'}</p>
                
                <hr className="my-6 border-apple-border/20" />
                
                <ul className="space-y-4 text-sm font-bold text-apple-text">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Unlimited active surveys
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Unlimited submissions
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Max 20MB CSV uploads
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Custom Dashboard widgets
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Public sharing embeds
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={() => openAuthModal('register')}
                className="w-full justify-center mt-8 py-3.5 rounded-xl font-bold bg-[#0066cc] text-white border-none shadow-[0_4px_0_#004494,0_8px_20px_rgba(0,113,227,0.12)] hover:bg-[#0055b3] active:translate-y-[3px] active:shadow-[0_1px_0_#004494] transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                Get Started Now
              </button>
            </div>
          </motion.div>

          {/* Enterprise Package */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.02)] rounded-3xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-300 p-8 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enterprise Elite</span>
              <p className="text-3xl font-extrabold text-apple-text mt-4 flex items-baseline">
                {billingPeriod === 'monthly' ? '$89' : '$71'}
                <span className="text-xs text-apple-secondary font-semibold ml-1">/ month</span>
              </p>
              <p className="text-xs text-apple-gray mt-1 font-semibold font-sans">For corporate teams and massive volume</p>
              
              <hr className="my-6 border-apple-border/20" />
              
              <ul className="space-y-4 text-sm font-semibold text-apple-secondary">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> All features in Growth plan
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Max 50MB CSV/JSON uploads
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Dedicated database indexers
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> Custom roles & admin controls
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 p-0.5 rounded-full flex-shrink-0" /> VIP priority live Slack support
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => openAuthModal('register')}
              className="w-full justify-center mt-8 py-3 rounded-xl font-bold border border-slate-200 text-slate-700 bg-white shadow-[0_4px_0_#e2e8f0] hover:bg-slate-50 hover:border-apple-blue hover:text-apple-blue active:translate-y-[2px] active:shadow-[0_1px_0_#e2e8f0] transition-all duration-200 flex items-center justify-center cursor-pointer"
            >
              Contact Sales
            </button>
          </motion.div>
        </div>
      </section>

      {/* 7. DYNAMIC ACCORDION FAQS */}
      <section id="faq" className="bg-white border-y border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-3"
          >
            <h2 className="text-3xl font-extrabold text-apple-text tracking-tight">Frequently Asked Questions</h2>
            <p className="text-apple-secondary text-base font-medium">Have queries about launching DataPulse? Here are our standard responses.</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the auto column type-detection work for uploaded CSV files?',
                a: 'Once you upload any CSV or JSON spreadsheet, our MERN backend checks the values of each column. If the records consistently contain numbers, dates, booleans, or standard text, the database maps the column type accordingly. It then exposes relevant widgets (e.g. histograms for integers, pie charts for categorical labels).'
              },
              {
                q: 'What is tablet-friendly Kiosk Mode inside survey options?',
                a: 'Kiosk Mode is custom-designed for customer feedback tablets in brick-and-mortar storefronts or conferences. When enabled, it opens a fullscreen survey viewport with an inactivity timer. If a user walks away halfway, the page resets automatically to the home question, keeping the workspace secure.'
              },
              {
                q: 'Are the dashboards created in DataPulse shareable publicly?',
                a: 'Absolutely! Premium workspaces on Growth or Enterprise packages can generate encrypted public access tokens. You can send this public URL to clients, allowing them to view and interact with dashboard graphics in real time, even without a registered account.'
              },
              {
                q: 'Is my data secure in the MERN-stack environment?',
                a: 'Yes, data privacy is our top priority. We store passwords safely utilizing high-factor bcrypt hashes. Session routes are protected with cryptographically signed JSON Web Tokens (JWT). All CSV and survey records are isolated inside secure MongoDB tables.'
              }
            ].map((faq, idx) => {
              const active = expandedFaq === idx
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${active ? 'border-l-4 border-l-apple-blue border-slate-200 shadow-[0_8px_25px_rgba(0,113,227,0.04)]' : 'border-slate-100 hover:border-slate-200 hover:shadow-[0_8px_25px_rgba(0,113,227,0.02)]'}`}
                >
                  <button
                    onClick={() => setExpandedFaq(active ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-extrabold text-sm text-apple-text focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4.5 h-4.5 text-apple-blue transition-transform duration-300 ${active ? 'rotate-180 text-apple-purple' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-apple-secondary leading-relaxed border-t border-slate-100 font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mx-auto space-y-3"
        >
          <h2 className="text-3xl font-extrabold text-apple-text tracking-tight">Loved by Data-Driven Startups</h2>
          <p className="text-apple-secondary text-base font-medium">Read positive reviews from product managers, founders, and business analysts.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-100 shadow-[0_12px_35px_rgba(0,0,0,0.02)] rounded-3xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-300 p-6 space-y-4"
          >
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-apple-secondary italic leading-relaxed font-medium">
              "We replaced our expensive data visualization licenses with DataPulse. The ability to import CSV spreadsheets and instantly build customizable widgets saved our product operations team hours every week."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                AM
              </div>
              <div>
                <p className="text-xs font-extrabold text-apple-text">Alex Martinez</p>
                <p className="text-[10px] text-apple-secondary font-semibold">VP of Analytics, TechSaaS Inc.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-100 shadow-[0_12px_35px_rgba(0,0,0,0.02)] rounded-3xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-300 p-6 space-y-4"
          >
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-apple-secondary italic leading-relaxed font-medium">
              "The drag-and-drop feedback surveys in DataPulse are a game-changer. We loaded the tablet kiosk inside our flagship store, and our daily response counts surged by almost 200%. The auto-reset inactivity timer works flawlessly."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                SR
              </div>
              <div>
                <p className="text-xs font-extrabold text-apple-text">Sarah Robinson</p>
                <p className="text-[10px] text-apple-secondary font-semibold">Head of Retail CX, ShopFuture</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-100 shadow-[0_12px_35px_rgba(0,0,0,0.02)] rounded-3xl hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-300 p-6 space-y-4"
          >
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-apple-secondary italic leading-relaxed font-medium">
              "As a MERN stack developer, I am amazed at how clean the UI/UX components are. It uses premium Apple-style design aesthetics. Connecting Recharts graphs directly to MongoDB models makes building dashboard canvas views seamless."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                KD
              </div>
              <div>
                <p className="text-xs font-extrabold text-apple-text">Kabir Dhawan</p>
                <p className="text-[10px] text-apple-secondary font-semibold">Lead Software Engineer, CloudPulse</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. BOTTOM CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10"
      >
        <div className="bg-gradient-to-br from-apple-blue to-apple-purple py-16 px-8 text-white text-center relative overflow-hidden rounded-[32px] shadow-[0_20px_50px_rgba(0,113,227,0.15)] border-none">
          {/* Subtle ambient light reflections in the gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0,transparent_60%)] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">Ready to Launch Your Startup Analytics?</h2>
            <p className="text-base sm:text-lg text-white/95 max-w-xl mx-auto font-medium">
              Get instant access to survey builders, statistics parsers, and dashboard creators in under 3 minutes.
            </p>
            <div className="pt-2 flex flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto w-full">
              <button 
                onClick={() => openAuthModal('register')}
                className="flex-1 sm:flex-none justify-center px-4 sm:px-8 py-3 rounded-xl text-xs sm:text-sm md:text-base font-extrabold bg-white text-apple-blue shadow-[0_4px_0_#d2d2d7,0_6px_15px_rgba(0,0,0,0.06)] hover:bg-slate-50 active:translate-y-[2px] active:shadow-[0_1px_0_#d2d2d7] transition-all duration-200 flex items-center justify-center cursor-pointer border-none whitespace-nowrap"
              >
                Sign Up Free
              </button>
              <button 
                onClick={() => openAuthModal('login')}
                className="flex-1 sm:flex-none justify-center px-4 sm:px-8 py-3 rounded-xl text-xs sm:text-sm md:text-base font-extrabold bg-[#0066cc] text-white shadow-[0_4px_0_#004494,0_6px_15px_rgba(0,0,0,0.06)] hover:bg-[#0055b3] active:translate-y-[2px] active:shadow-[0_1px_0_#004494] transition-all duration-200 flex items-center justify-center cursor-pointer border-none whitespace-nowrap"
              >
                Access Member Area
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 10. NEWSLETTER & CATEGORIZED FOOTER */}
      <footer className="bg-white border-t border-apple-border/40 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Top grid: Brand + Categorized Lists + Newsletter */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Column 1: Brand & Desc */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-apple-blue to-apple-purple rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base text-apple-text tracking-tight">DataPulse Analytics</span>
              </div>
              <p className="text-xs text-apple-secondary leading-relaxed">
                Full-stack modern analytics solution enabling product managers, retail operators, and data analysts to capture surveys, parse CSV records, and build dashboard reports with beautiful Apple-style visuals.
              </p>

            </div>

            {/* Column 2 & 3: Lists */}
            <div className="grid grid-cols-2 gap-8 md:col-span-4">
              <div className="space-y-4">
                <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-apple-gray">Product</h5>
                <ul className="space-y-2.5 text-xs text-apple-secondary font-medium">
                  <li><a href="#features" className="hover:text-apple-blue transition-colors">Survey Kiosk Builder</a></li>
                  <li><a href="#features" className="hover:text-apple-blue transition-colors">CSV Summary Parser</a></li>
                  <li><a href="#features" className="hover:text-apple-blue transition-colors">Dashboard Canvas</a></li>
                  <li><a href="#pricing" className="hover:text-apple-blue transition-colors">Workspace Pricing</a></li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-apple-gray">Company</h5>
                <ul className="space-y-2.5 text-xs text-apple-secondary font-medium">
                  <li><Link to="/login" className="hover:text-apple-blue transition-colors">Analyst Portal</Link></li>
                  <li><Link to="/register" className="hover:text-apple-blue transition-colors">Register Hub</Link></li>
                  <li><span className="cursor-not-allowed text-apple-gray/50">Developer API</span></li>
                  <li><span className="cursor-not-allowed text-apple-gray/50">Terms & Privacy</span></li>
                </ul>
              </div>
            </div>

            {/* Column 4: Newsletter */}
            <div className="md:col-span-4 space-y-4">
              <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-apple-gray">Startup Newsletter</h5>
              <p className="text-xs text-apple-secondary">Receive bi-weekly product operational updates, metrics tutorials, and templates.</p>
              
              {!newsletterSubscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="input text-xs py-2 px-3 flex-1"
                  />
                  <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0066cc] text-white border-none shadow-[0_3px_0_#004494,0_6px_15px_rgba(0,113,227,0.12)] hover:bg-[#0055b3] active:translate-y-[2px] active:shadow-[0_1px_0_#004494] transition-all duration-200 cursor-pointer">
                    Join
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 font-semibold"
                >
                  ✓ Thank you! You've joined the newsletter queue.
                </motion.div>
              )}
            </div>

          </div>

          <hr className="border-apple-border/40" />

          {/* Bottom copyright and disclaimer */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-apple-gray font-medium">
            <span>© {new Date().getFullYear()} DataPulse Startup Platform. All rights reserved.</span>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <span className="hover:text-apple-text cursor-pointer">Privacy Guidelines</span>
              <span className="hover:text-apple-text cursor-pointer">SaaS Terms of Service</span>
              <span className="hover:text-apple-text cursor-pointer">Security Audits</span>
            </div>
          </div>

        </div>
      </footer>

      {/* 11. ANTIMATED SIGN IN / SIGN UP MODAL (POPUP SYSTEM) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-apple-text/30 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-white rounded-apple-xl shadow-apple-lg border border-apple-border/50 overflow-hidden z-10"
            >
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-apple-bg hover:bg-apple-border/40 text-apple-secondary hover:text-apple-text transition-all z-20"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-7 space-y-6">
                
                {/* Logo & Headline */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center mx-auto mb-3.5 shadow-md">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-apple-text">DataPulse Workspace</h3>
                  <p className="text-xs text-apple-secondary mt-1">Authenticate into your secure startup panel</p>
                </div>

                {/* Tab Swapper */}
                <div className="flex bg-apple-bg p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      authTab === 'login'
                        ? 'bg-white text-apple-blue shadow-sm'
                        : 'text-apple-secondary hover:text-apple-text'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      authTab === 'register'
                        ? 'bg-white text-apple-blue shadow-sm'
                        : 'text-apple-secondary hover:text-apple-text'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Error Display */}
                {(error || localError) && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold leading-relaxed">
                    🚨 {error || localError}
                  </div>
                )}

                {/* Authentication Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  
                  {/* Name field - only visible on Sign Up */}
                  {authTab === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="label text-xs">Full Name</label>
                      <input
                        type="text"
                        required
                        className="input text-xs py-2 px-3"
                        placeholder="John Doe"
                        value={authForm.name}
                        onChange={(e) => setAuthForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="label text-xs">Email Address</label>
                    <input
                      type="email"
                      required
                      className="input text-xs py-2 px-3"
                      placeholder="you@startup.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="label text-xs flex justify-between">
                      <span>Password</span>
                      {authTab === 'login' && (
                        <span className="text-[10px] text-apple-blue hover:underline cursor-not-allowed">Forgot Password?</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        className="input text-xs py-2 px-3 pr-10"
                        placeholder="••••••••"
                        value={authForm.password}
                        onChange={(e) => setAuthForm(f => ({ ...f, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-apple-gray hover:text-apple-text p-0.5"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Action submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full justify-center py-2.5 rounded-xl text-xs font-bold mt-2 disabled:opacity-50 bg-[#0066cc] text-white border-none shadow-[0_3px_0_#004494,0_6px_15px_rgba(0,113,227,0.12)] hover:bg-[#0055b3] active:translate-y-[2px] active:shadow-[0_1px_0_#004494] transition-all duration-200 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center cursor-pointer"
                  >
                    {loading 
                      ? (authTab === 'login' ? 'Authenticating...' : 'Registering...')
                      : (authTab === 'login' ? 'Sign In to Workspace' : 'Launch Startup Workspace')
                    }
                  </button>
                </form>

                {/* Demo details hint */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-600 leading-relaxed">
                  💡 <strong>Startup Sandbox Hint:</strong> Register a brand new custom account or utilize any existing password to spin up a fresh isolated analytics node.
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
