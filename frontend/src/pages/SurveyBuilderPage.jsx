import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import { Plus, Trash2, Save, Settings, ArrowLeft, ArrowUp, ArrowDown, CopyPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const QUESTION_TYPES = [
  { value: 'rating', label: 'Rating', emoji: '⭐' },
  { value: 'scale', label: 'Scale (NPS)', emoji: '📊' },
  { value: 'text', label: 'Text', emoji: '✍️' },
  { value: 'multiple_choice', label: 'Multiple Choice', emoji: '🔘' },
  { value: 'checkbox', label: 'Checkboxes', emoji: '☑️' },
  { value: 'dropdown', label: 'Dropdown', emoji: '▼' },
  { value: 'yes_no', label: 'Yes / No', emoji: '✅' },
  { value: 'number', label: 'Number', emoji: '🔢' },
  { value: 'email', label: 'Email', emoji: '📧' },
  { value: 'date', label: 'Date', emoji: '📅' },
]

const defaultQuestion = () => ({
  id: `q_${Date.now()}`, type: 'rating', label: 'New Question', description: '',
  required: false, min: 1, max: 5, options: [], placeholder: '', order: 0,
})

const makeQuestionId = () => `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

function getDefaultOptions(type) {
  if (type === 'yes_no') return [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]
  if (type === 'multiple_choice' || type === 'checkbox' || type === 'dropdown') {
    return [
      { label: 'Option 1', value: 'option_1' },
      { label: 'Option 2', value: 'option_2' },
    ]
  }
  return []
}

function normalizeQuestion(question) {
  const next = { ...question }
  if (next.type === 'yes_no') {
    next.options = getDefaultOptions('yes_no')
  } else if (['multiple_choice', 'checkbox', 'dropdown'].includes(next.type)) {
    if (!next.options?.length) next.options = getDefaultOptions(next.type)
  } else {
    next.options = []
  }
  return next
}

export default function SurveyBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [activeQ, setActiveQ] = useState(null)
  const [tab, setTab] = useState('questions') // questions | settings

  const [survey, setSurvey] = useState({
    title: 'New Survey',
    description: '',
    status: 'draft',
    questions: [],
    settings: {
      allowAnonymous: true,
      showProgressBar: true,
      autoResetSeconds: 60,
      thankYouMessage: 'Thank you for your response!',
    },
    theme: { primaryColor: '#0071e3' },
    tags: [],
  })

  useEffect(() => {
    if (id) {
      api.get(`/surveys/${id}`).then(r => {
        setSurvey(r.data.survey)
        setActiveQ(r.data.survey.questions?.[0]?.id || null)
        setLoading(false)
      })
    }
  }, [id])

  const addQuestion = (type = 'rating') => {
    const q = normalizeQuestion({ ...defaultQuestion(), id: makeQuestionId(), type, order: survey.questions.length })
    setSurvey(s => ({ ...s, questions: [...s.questions, q] }))
    setActiveQ(q.id)
  }

  const updateQuestion = (qId, updates) => {
    setSurvey(s => ({
      ...s,
      questions: s.questions.map(q => q.id === qId ? normalizeQuestion({ ...q, ...updates }) : q),
    }))
  }

  const duplicateQuestion = (qId) => {
    const source = survey.questions.find(q => q.id === qId)
    if (!source) return
    const copy = {
      ...JSON.parse(JSON.stringify(source)),
      id: makeQuestionId(),
      label: `${source.label} Copy`,
      order: survey.questions.length,
    }
    setSurvey(s => ({ ...s, questions: [...s.questions, copy] }))
    setActiveQ(copy.id)
  }

  const moveQuestion = (qId, direction) => {
    setSurvey(s => {
      const index = s.questions.findIndex(q => q.id === qId)
      if (index < 0) return s
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= s.questions.length) return s
      const questions = [...s.questions]
      const [item] = questions.splice(index, 1)
      questions.splice(target, 0, item)
      return {
        ...s,
        questions: questions.map((q, idx) => ({ ...q, order: idx })),
      }
    })
  }

  const deleteQuestion = (qId) => {
    setSurvey(s => ({ ...s, questions: s.questions.filter(q => q.id !== qId) }))
    if (activeQ === qId) setActiveQ(null)
  }

  const addOption = (qId) => {
    updateQuestion(qId, {
      options: [...(survey.questions.find(q => q.id === qId)?.options || []),
        { label: `Option ${Date.now()}`, value: `opt_${Date.now()}` }],
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      if (id) {
        await api.put(`/surveys/${id}`, survey)
      } else {
        const { data } = await api.post('/surveys', survey)
        navigate(`/surveys/${data.survey._id}/edit`, { replace: true })
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-apple-secondary text-sm">Loading…</div>

  const activeQuestion = survey.questions.find(q => q.id === activeQ)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/surveys')} className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <input value={survey.title} onChange={e => setSurvey(s => ({ ...s, title: e.target.value }))}
            className="text-2xl font-semibold text-apple-text bg-transparent border-none outline-none w-full" />
          <input value={survey.description} onChange={e => setSurvey(s => ({ ...s, description: e.target.value }))}
            className="text-sm text-apple-secondary bg-transparent border-none outline-none w-full mt-0.5"
            placeholder="Add a description…" />
        </div>
        <div className="flex items-center gap-2">
          <select value={survey.status} onChange={e => setSurvey(s => ({ ...s, status: e.target.value }))}
            className="input py-1.5 text-sm w-auto">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
          <button onClick={save} className="btn-primary" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-apple-bg p-1 rounded-apple w-fit">
        {['questions','settings'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-apple text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white text-apple-text shadow-sm' : 'text-apple-secondary hover:text-apple-text'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Question */}
          <div className="lg:col-span-1 space-y-3">
            <div className="card p-3">
              <p className="text-xs font-medium text-apple-secondary mb-2">Add Question</p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUESTION_TYPES.map(t => (
                  <button key={t.value} onClick={() => addQuestion(t.value)}
                    className="flex items-center gap-1.5 p-2 rounded-apple text-xs hover:bg-apple-bg transition-colors text-left">
                    <span>{t.emoji}</span>
                    <span className="text-apple-text">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <p className="text-sm font-medium text-apple-text">{survey.questions.length} questions</p>
              <p className="text-xs text-apple-secondary mt-1">
                Build one full form with many questions and options, like Google Forms.
              </p>
            </div>
          </div>

          {/* Question Editor */}
          <div className="lg:col-span-2">
            {survey.questions.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {survey.questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={() => setActiveQ(question.id)}
                      className={`transition-all ${activeQ === question.id ? 'ring-2 ring-apple-blue rounded-apple-lg' : ''}`}
                    >
                      <QuestionEditor
                        q={question}
                        index={index}
                        isActive={activeQ === question.id}
                        canMoveUp={index > 0}
                        canMoveDown={index < survey.questions.length - 1}
                        onChange={updates => updateQuestion(question.id, updates)}
                        onAddOption={() => addOption(question.id)}
                        onDelete={() => deleteQuestion(question.id)}
                        onDuplicate={() => duplicateQuestion(question.id)}
                        onMoveUp={() => moveQuestion(question.id, 'up')}
                        onMoveDown={() => moveQuestion(question.id, 'down')}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center h-64 text-center p-8">
                <Settings className="w-10 h-10 text-apple-border mb-3" />
                <p className="font-medium text-apple-text">Start your form</p>
                <p className="text-sm text-apple-secondary mt-1">Add your first question from the left panel</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-xl space-y-4">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-apple-text">Survey Settings</h3>
            {[
              ['showProgressBar', 'Show Progress Bar'],
              ['allowAnonymous', 'Allow Anonymous Responses'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="text-sm text-apple-text">{label}</span>
                <Toggle
                  checked={survey.settings[key]}
                  onChange={v => setSurvey(s => ({ ...s, settings: { ...s.settings, [key]: v } }))}
                />
              </label>
            ))}
            <div>
              <label className="label">Auto-reset (seconds)</label>
              <input type="number" className="input" value={survey.settings.autoResetSeconds}
                onChange={e => setSurvey(s => ({ ...s, settings: { ...s.settings, autoResetSeconds: +e.target.value } }))} />
            </div>
            <div>
              <label className="label">Thank You Message</label>
              <textarea className="input resize-none" rows={2} value={survey.settings.thankYouMessage}
                onChange={e => setSurvey(s => ({ ...s, settings: { ...s.settings, thankYouMessage: e.target.value } }))} />
            </div>
            <div>
              <label className="label">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-10 h-9 rounded border border-apple-border cursor-pointer"
                  value={survey.theme.primaryColor}
                  onChange={e => setSurvey(s => ({ ...s, theme: { ...s.theme, primaryColor: e.target.value } }))} />
                <input className="input flex-1" value={survey.theme.primaryColor}
                  onChange={e => setSurvey(s => ({ ...s, theme: { ...s.theme, primaryColor: e.target.value } }))} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QuestionEditor({
  q, index, isActive, canMoveUp, canMoveDown, onChange, onAddOption,
  onDelete, onDuplicate, onMoveUp, onMoveDown,
}) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl">{QUESTION_TYPES.find(t => t.value === q.type)?.emoji}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-apple-text">Question {index + 1}</h3>
          <p className="text-xs text-apple-secondary mt-1">
            {QUESTION_TYPES.find(t => t.value === q.type)?.label}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={!canMoveUp} className="btn-ghost p-1.5 disabled:opacity-40">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button onClick={onMoveDown} disabled={!canMoveDown} className="btn-ghost p-1.5 disabled:opacity-40">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button onClick={onDuplicate} className="btn-ghost p-1.5">
            <CopyPlus className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="btn-ghost p-1.5 hover:text-apple-red">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="label">Type</label>
        <select className="input" value={q.type} onChange={e => onChange({ type: e.target.value })}>
          {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Question Label</label>
        <input className="input" value={q.label} onChange={e => onChange({ label: e.target.value })} />
      </div>
      <div>
        <label className="label">Description (optional)</label>
        <input className="input" value={q.description} placeholder="Add helper text…"
          onChange={e => onChange({ description: e.target.value })} />
      </div>

      {(q.type === 'rating' || q.type === 'scale' || q.type === 'number') && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Min</label>
            <input type="number" className="input" value={q.min} onChange={e => onChange({ min: +e.target.value })} />
          </div>
          <div>
            <label className="label">Max</label>
            <input type="number" className="input" value={q.max} onChange={e => onChange({ max: +e.target.value })} />
          </div>
        </div>
      )}

      {(q.type === 'text' || q.type === 'email' || q.type === 'number') && (
        <div>
          <label className="label">Placeholder</label>
          <input className="input" value={q.placeholder} onChange={e => onChange({ placeholder: e.target.value })} />
        </div>
      )}

      {(q.type === 'multiple_choice' || q.type === 'checkbox' || q.type === 'dropdown') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label m-0">Options</label>
            <button onClick={onAddOption} className="text-sm text-apple-blue hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" />Add
            </button>
          </div>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1 py-2" value={opt.label}
                  onChange={e => {
                    const opts = [...q.options]
                    opts[i] = { ...opts[i], label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }
                    onChange({ options: opts })
                  }} />
                <button onClick={() => onChange({ options: q.options.filter((_, j) => j !== i) })}
                  className="text-apple-gray hover:text-apple-red p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <Toggle checked={q.required} onChange={v => onChange({ required: v })} />
        <span className="text-sm text-apple-text">Required question</span>
      </label>

      <div className={`rounded-apple border ${isActive ? 'border-blue-200 bg-blue-50/50' : 'border-apple-border bg-apple-bg/50'} p-4`}>
        <p className="text-xs font-medium text-apple-secondary mb-2">Preview</p>
        <p className="text-sm font-medium text-apple-text">{q.label || 'Untitled question'}</p>
        {q.description && <p className="text-xs text-apple-secondary mt-1">{q.description}</p>}
        {['multiple_choice', 'checkbox', 'dropdown', 'yes_no'].includes(q.type) && q.options?.length > 0 && (
          <div className="mt-3 space-y-2">
            {q.options.map((opt, i) => (
              <div key={`${opt.value}_${i}`} className="rounded-apple bg-white border border-apple-border px-3 py-2 text-sm text-apple-text">
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${checked ? 'bg-apple-blue' : 'bg-apple-border'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}
