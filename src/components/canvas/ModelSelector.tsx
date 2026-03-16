'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODELS } from '@/lib/models'

type Props = {
  value: string
  onChange: (model: string) => void
}

export default function ModelSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = MODELS.find((m) => m.id === value)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
      >
        <Cpu size={12} className="text-accent" />
        <span className="font-medium tracking-wide uppercase">
          {current?.label ?? value}
        </span>
        <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-44 rounded-lg border border-border bg-surface shadow-xl z-50 overflow-hidden">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onChange(m.id); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-2 text-xs transition-colors',
                m.id === value
                  ? 'text-accent bg-accent-muted'
                  : 'text-muted hover:text-text hover:bg-surface-2'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
