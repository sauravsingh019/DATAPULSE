import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Zap } from 'lucide-react'

export default function PublicSurveyPage() {
  const { token } = useParams()
  const [survey, setSurvey] = useState(null)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('welcome')
  const [answers, setAnswers] = useState({})
  const [sessionId] = useState(() => `pub_${Date.now()}`)
  const [startTime] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    api.get(`/surveys/public/${token}`)
      .then(r => setSurvey(r.data.survey))
      .catch(() => setError('This survey is not available.'))
  }, [token])

  const submit = async () => {
    const missing = survey.questions.find(q => q.required && isEmptyAnswer(answers[q.id], q.type))
    if (missing) {
      setValidationError(`Please answer "${missing.label}" before submitting.`)
      return
    }

    setValidationError('')
    setSubmitting(true)

    const answersList = survey.questions.map(q => ({
      questionId: q.id,
      questionLabel: q.label,
      questionType: q.type,
      response: answers[q.id] ?? null,
      skipped: isEmptyAnswer(answers[q.id], q.type),
    }))

    try {
      await api.post('/responses/submit', {
        surveyId: survey._id,
        sessionId,
        answers: answersList,
        duration: Math.floor((Date.now() - startTime) / 1000),
      })
      setPhase('thankyou')
    } catch {
      setSubmitting(false)
    }
  }

  if (error) return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center">
      <div className="card p-10 text-center max-w-sm">
        <p className="text-4xl mb-4">Unavailable</p>
        <h2 className="font-semibold text-apple-text mb-2">Survey Unavailable</h2>
        <p className="text-apple-secondary text-sm">{error}</p>
      </div>
    </div>
  )

  if (!survey) return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center">
      <div className="text-apple-secondary text-sm">Loading survey...</div>
    </div>
  )

  const answeredCount = survey.questions.filter(q => !isEmptyAnswer(answers[q.id], q.type)).length
  const progress = survey.questions.length > 0 ? (answeredCount / survey.questions.length) * 100 : 0

  return (
    <div className="min-h-screen bg-apple-bg flex flex-col">
      <div className="px-6 py-4 bg-white border-b border-apple-border/50 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-apple-blue to-purple-600 flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-medium text-apple-secondary">DataPulse Survey</span>
      </div>

      <div className="flex-1 flex items-start justify-center p-6">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {phase === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} className="card-lg p-10 text-center">
                <h1 className="text-3xl font-semibold text-apple-text mb-3">{survey.title}</h1>
                {survey.description && <p className="text-apple-secondary mb-6">{survey.description}</p>}
                <p className="text-sm text-apple-gray mb-8">
                  {survey.questions.length} questions in one form
                </p>
                <button onClick={() => setPhase('survey')} className="btn-primary px-8 py-3 text-base">
                  Open Form <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {phase === 'survey' && (
              <motion.div key="survey" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="card-lg p-8">
                  <h1 className="text-3xl font-semibold text-apple-text">{survey.title}</h1>
                  {survey.description && <p className="mt-3 text-apple-secondary">{survey.description}</p>}

                  {survey.settings?.showProgressBar !== false && (
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-apple-secondary mb-2">
                        <span>{answeredCount} answered</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-apple-bg rounded-full">
                        <motion.div
                          className="h-1.5 rounded-full"
                          style={{ background: survey.theme?.primaryColor || '#0071e3' }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {survey.questions.map((question, index) => (
                  <div key={question.id} className="card-lg p-8">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-apple-bg text-sm font-semibold text-apple-text flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">
                          {question.required && <span className="text-xs text-apple-red font-medium">Required</span>}
                        </div>
                        <h2 className="text-xl font-semibold text-apple-text">{question.label}</h2>
                        {question.description && <p className="text-apple-secondary text-sm mt-2">{question.description}</p>}

                        <div className="mt-5">
                          <QuestionInput
                            q={question}
                            value={answers[question.id]}
                            onChange={v => {
                              setValidationError('')
                              setAnswers(current => ({ ...current, [question.id]: v }))
                            }}
                            primaryColor={survey.theme?.primaryColor}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {validationError && (
                  <div className="rounded-apple border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {validationError}
                  </div>
                )}

                <div className="card-lg p-6 flex justify-end">
                  <button onClick={submit} className="btn-primary" disabled={submitting}>
                    <Check className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Form'}
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'thankyou' && (
              <motion.div key="ty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="card-lg p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-apple-green" />
                </div>
                <h2 className="text-2xl font-semibold text-apple-text mb-2">
                  {survey.settings?.thankYouMessage || 'Thank you!'}
                </h2>
                <p className="text-apple-secondary">Your response has been recorded.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function isEmptyAnswer(value, type) {
  if (type === 'checkbox') return !Array.isArray(value) || value.length === 0
  return value === undefined || value === null || value === ''
}

function QuestionInput({ q, value, onChange, primaryColor = '#0071e3' }) {
  if (q.type === 'rating') {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i).map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`w-11 h-11 rounded-apple font-semibold transition-all ${value === n ? 'text-white shadow-apple' : 'bg-apple-bg text-apple-text hover:bg-blue-50'}`}
            style={value === n ? { background: primaryColor } : {}}>
            {n}
          </button>
        ))}
      </div>
    )
  }

  if (q.type === 'scale') {
    return (
      <div>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i).map(n => (
            <button key={n} type="button" onClick={() => onChange(n)}
              className={`w-9 h-9 rounded-apple text-sm font-medium transition-all ${value === n ? 'text-white' : 'bg-apple-bg text-apple-text hover:bg-blue-50'}`}
              style={value === n ? { background: primaryColor } : {}}>
              {n}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (q.type === 'yes_no') {
    return (
      <div className="flex gap-3">
        {[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }].map(opt => (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className={`flex-1 py-3 rounded-apple-lg font-medium transition-all border-2 ${value === opt.value ? 'border-apple-blue bg-blue-50 text-apple-blue' : 'border-apple-border hover:border-blue-300'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  if (q.type === 'multiple_choice') {
    return (
      <div className="space-y-2">
        {q.options.map(opt => (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className={`w-full text-left p-3.5 rounded-apple-lg border-2 transition-all ${value === opt.value ? 'border-apple-blue bg-blue-50 text-apple-blue' : 'border-apple-border hover:border-apple-blue/40'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  if (q.type === 'dropdown') {
    return (
      <select className="input" value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">Select an option</option>
        {q.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    )
  }

  if (q.type === 'checkbox') {
    const vals = Array.isArray(value) ? value : []
    const toggle = v => onChange(vals.includes(v) ? vals.filter(x => x !== v) : [...vals, v])
    return (
      <div className="space-y-2">
        {q.options.map(opt => (
          <button key={opt.value} type="button" onClick={() => toggle(opt.value)}
            className={`w-full text-left p-3.5 rounded-apple-lg border-2 transition-all flex items-center gap-3 ${vals.includes(opt.value) ? 'border-apple-blue bg-blue-50' : 'border-apple-border hover:border-apple-blue/40'}`}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${vals.includes(opt.value) ? 'border-apple-blue bg-apple-blue' : 'border-apple-border'}`}>
              {vals.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
            </div>
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  if (q.type === 'date') {
    return <input type="date" className="input" value={value || ''} onChange={e => onChange(e.target.value)} />
  }

  if (q.type === 'email') {
    return <input type="email" className="input" value={value || ''} placeholder={q.placeholder || 'you@example.com'} onChange={e => onChange(e.target.value)} />
  }

  if (q.type === 'number') {
    return <input type="number" className="input" value={value || ''} placeholder={q.placeholder || 'Enter a number'} onChange={e => onChange(e.target.value)} />
  }

  return (
    <textarea value={value || ''} onChange={e => onChange(e.target.value)}
      rows={4} className="input resize-none"
      placeholder={q.placeholder || 'Type your answer here...'} />
  )
}
