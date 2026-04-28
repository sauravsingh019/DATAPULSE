import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, SkipForward, Check, Zap } from 'lucide-react'

export default function SurveyKioskPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState(null)
  const [phase, setPhase] = useState('welcome') // welcome | survey | thankyou
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [sessionId] = useState(() => `sess_${Date.now()}`)
  const [startTime] = useState(Date.now())
  const [idle, setIdle] = useState(survey?.settings?.autoResetSeconds || 60)

  useEffect(() => {
    api.get(`/surveys/${id}`).then(r => setSurvey(r.data.survey))
  }, [id])

  useEffect(() => {
    if (phase !== 'survey') return
    let t = survey?.settings?.autoResetSeconds || 60
    setIdle(t)
    const int = setInterval(() => { t -= 1; setIdle(t); if (t <= 0) { setPhase('welcome'); setCurrentIdx(0); setAnswers({}) } }, 1000)
    const reset = () => { t = survey?.settings?.autoResetSeconds || 60; setIdle(t) }
    const events = ['click','mousemove','keydown','touchstart']
    events.forEach(e => window.addEventListener(e, reset))
    return () => { clearInterval(int); events.forEach(e => window.removeEventListener(e, reset)) }
  }, [phase, survey])

  const submit = async () => {
    if (!window.confirm('Submit your responses?')) return
    const answersList = survey.questions.map(q => ({
      questionId: q.id, questionLabel: q.label, questionType: q.type,
      response: answers[q.id] ?? null,
      skipped: answers[q.id] === undefined || answers[q.id] === null,
    }))
    await api.post('/responses/submit', {
      surveyId: id, sessionId, answers: answersList,
      duration: Math.floor((Date.now() - startTime) / 1000),
    })
    setPhase('thankyou')
    setTimeout(() => { setPhase('welcome'); setCurrentIdx(0); setAnswers({}) }, 5001)
  }

  if (!survey) return <div className="flex items-center justify-center h-screen text-apple-secondary">Loading…</div>

  const question = survey.questions[currentIdx]
  const progress = survey.questions.length > 0 ? ((currentIdx + 1) / survey.questions.length) * 100 : 0

  return (
    <div className="fixed inset-0 bg-apple-bg flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-apple-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-apple-blue to-purple-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-apple-text text-sm">{survey.title}</span>
        </div>
        <button onClick={() => navigate('/surveys')} className="btn-ghost py-1 px-3 text-sm">
          <ArrowLeft className="w-3.5 h-3.5" /> Exit Kiosk
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {phase === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }} className="card-lg p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-apple-blue to-purple-600 flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-semibold text-apple-text mb-3">{survey.title}</h2>
                <p className="text-apple-secondary text-lg mb-2">{survey.description || 'Share your feedback with us.'}</p>
                <p className="text-apple-gray text-sm mb-8">{survey.questions.length} questions · ~{Math.ceil(survey.questions.length * 0.5)} min</p>
                <button onClick={() => setPhase('survey')} className="btn-primary px-8 py-3 text-base">
                  Start Survey <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {phase === 'survey' && question && (
              <motion.div key={question.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }} className="card-lg p-8">
                {/* Progress */}
                {survey.settings?.showProgressBar !== false && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-apple-secondary mb-2">
                      <span>Question {currentIdx + 1} of {survey.questions.length}</span>
                      <span className="text-apple-gray">Auto-reset in {idle}s</span>
                    </div>
                    <div className="h-1.5 bg-apple-bg rounded-full">
                      <motion.div className="h-1.5 bg-gradient-to-r from-apple-blue to-purple-500 rounded-full"
                        animate={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <h3 className="text-2xl font-semibold text-apple-text mb-2">{question.label}</h3>
                {question.description && <p className="text-apple-secondary mb-6">{question.description}</p>}

                <div className="mt-6">
                  <QuestionInput q={question} value={answers[question.id]}
                    onChange={v => setAnswers(a => ({ ...a, [question.id]: v }))} />
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => currentIdx > 0 && setCurrentIdx(i => i - 1)}
                    disabled={currentIdx === 0} className="btn-secondary disabled:opacity-40">
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      if (currentIdx < survey.questions.length - 1) setCurrentIdx(i => i + 1)
                      else submit()
                    }} className="btn-ghost">
                      <SkipForward className="w-4 h-4" /> Skip
                    </button>
                    {currentIdx < survey.questions.length - 1 ? (
                      <button onClick={() => setCurrentIdx(i => i + 1)} className="btn-primary">
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button onClick={submit} className="btn-primary">
                        <Check className="w-4 h-4" /> Submit
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'thankyou' && (
              <motion.div key="thankyou" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }} className="card-lg p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-apple-green/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-apple-green" />
                </div>
                <h2 className="text-3xl font-semibold text-apple-text mb-2">
                  {survey.settings?.thankYouMessage || 'Thank you!'}
                </h2>
                <p className="text-apple-secondary">Your response has been recorded. Returning in 5 seconds…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function QuestionInput({ q, value, onChange }) {
  if (q.type === 'rating') {
    return (
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i).map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`w-12 h-12 rounded-apple font-semibold text-lg transition-all ${value === n ? 'bg-apple-blue text-white shadow-apple-md' : 'bg-apple-bg text-apple-text hover:bg-blue-50'}`}>
            {n}
          </button>
        ))}
      </div>
    )
  }

  if (q.type === 'scale') {
    return (
      <div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i).map(n => (
            <button key={n} onClick={() => onChange(n)}
              className={`w-10 h-10 rounded-apple text-sm font-medium transition-all ${value === n ? 'bg-apple-blue text-white' : 'bg-apple-bg text-apple-text hover:bg-blue-50'}`}>
              {n}
            </button>
          ))}
        </div>
        {(q.minLabel || q.maxLabel) && (
          <div className="flex justify-between mt-2 text-xs text-apple-secondary">
            <span>{q.minLabel || 'Not likely'}</span>
            <span>{q.maxLabel || 'Very likely'}</span>
          </div>
        )}
      </div>
    )
  }

  if (q.type === 'yes_no') {
    return (
      <div className="flex gap-4">
        {['Yes', 'No'].map(opt => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`flex-1 py-4 rounded-apple-lg font-semibold text-lg transition-all ${value === opt ? (opt === 'Yes' ? 'bg-apple-green text-white' : 'bg-apple-red text-white') : 'bg-apple-bg text-apple-text hover:bg-blue-50'}`}>
            {opt === 'Yes' ? '✅' : '❌'} {opt}
          </button>
        ))}
      </div>
    )
  }

  if (q.type === 'multiple_choice' || q.type === 'dropdown') {
    return (
      <div className="space-y-2">
        {q.options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`w-full text-left p-4 rounded-apple-lg border-2 transition-all ${value === opt.value ? 'border-apple-blue bg-blue-50 text-apple-blue' : 'border-apple-border hover:border-apple-blue/30'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  if (q.type === 'checkbox') {
    const vals = Array.isArray(value) ? value : []
    const toggle = (v) => onChange(vals.includes(v) ? vals.filter(x => x !== v) : [...vals, v])
    return (
      <div className="space-y-2">
        {q.options.map(opt => (
          <button key={opt.value} onClick={() => toggle(opt.value)}
            className={`w-full text-left p-4 rounded-apple-lg border-2 transition-all flex items-center gap-3 ${vals.includes(opt.value) ? 'border-apple-blue bg-blue-50' : 'border-apple-border hover:border-apple-blue/30'}`}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${vals.includes(opt.value) ? 'border-apple-blue bg-apple-blue' : 'border-apple-border'}`}>
              {vals.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
            </div>
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <textarea value={value || ''} onChange={e => onChange(e.target.value)}
      className="input resize-none text-lg py-4 min-h-[120px]"
      placeholder={q.placeholder || 'Type your answer…'} />
  )
}
