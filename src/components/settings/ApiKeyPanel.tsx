/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getKey, setKey, type Provider } from '@/lib/keys'

const PROVIDERS: { id: Provider; label: string; placeholder: string; docsUrl: string }[] = [
  { id: 'openai',    label: 'OpenAI',    placeholder: 'sk-...',       docsUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...',   docsUrl: 'https://console.anthropic.com/keys' },
  { id: 'google',    label: 'Google',    placeholder: 'AIza...',      docsUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'groq',      label: 'Groq',      placeholder: 'gsk_...',      docsUrl: 'https://console.groq.com/keys' },
]

type Props = {
  open: boolean
  onClose: () => void
}

export default function ApiKeyPanel({ open, onClose }: Props) {
  // Local state for inputs — only written to localStorage on Save
  const [values, setValues] = useState<Record<Provider, string>>({
    openai: '', anthropic: '', google: '', groq: '',
  })
  const [visible, setVisible] = useState<Record<Provider, boolean>>({
    openai: false, anthropic: false, google: false, groq: false,
  })
  const [saved, setSaved] = useState(false)

  // Load existing keys from localStorage when panel opens
  useEffect(() => {
    if (open) {
      setValues({
        openai:    getKey('openai'),
        anthropic: getKey('anthropic'),
        google:    getKey('google'),
        groq:      getKey('groq'),
      })
      setSaved(false)
    }
  }, [open])

  const handleSave = () => {
    PROVIDERS.forEach(({ id }) => setKey(id, values[id]))
    setSaved(true)
    // Brief confirmation, then close
    setTimeout(onClose, 800)
  }

  const toggleVisibility = (id: Provider) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 z-50 bg-surface border-l border-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-text">API Keys</h2>
            <p className="text-xs text-muted mt-0.5">Stored locally — never sent to our servers</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Key inputs */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {PROVIDERS.map(({ id, label, placeholder, docsUrl }) => (
            <div key={id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted uppercase tracking-wide">
                  {label}
                </label>
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:text-accent-hover transition-colors"
                >
                  Get key →
                </a>
              </div>

              <div className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 border',
                'bg-surface-2 border-border focus-within:border-border-focus transition-colors'
              )}>
                <input
                  type={visible[id] ? 'text' : 'password'}
                  value={values[id]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [id]: e.target.value }))}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent text-xs text-text placeholder:text-subtle outline-none font-mono"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility(id)}
                  className="text-subtle hover:text-muted transition-colors"
                >
                  {visible[id] ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>

              {/* Show masked confirmation if a key exists */}
              {values[id] && (
                <p className="text-xs text-muted">
                  {values[id].slice(0, 8)}{'•'.repeat(12)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={handleSave}
            className={cn(
              'w-full py-2 rounded-lg text-sm font-medium transition-all duration-150',
              saved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-accent hover:bg-accent-hover text-white'
            )}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={14} /> Saved
              </span>
            ) : (
              'Save Keys'
            )}
          </button>
          <p className="text-xs text-subtle text-center mt-2">
            Keys are encrypted in your browser only
          </p>
        </div>
      </div>
    </>
  )
}
