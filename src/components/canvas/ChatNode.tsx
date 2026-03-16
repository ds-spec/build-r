'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Bot, User, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatNode } from '@/lib/store'

const MODEL_LABELS: Record<string, string> = {
  'gpt-4o':        'GPT-4o',
  'claude-opus-4': 'Claude Opus',
  'gemini-2.0-flash': 'Gemini 2.0',
  'llama-3.3-70b':    'Llama 3.3 (Groq)',
}

export default function ChatNode({ id, data, selected }: NodeProps<ChatNode>) {
  return (
    <div
      className={cn(
        'w-80 rounded-xl border bg-surface flex flex-col shadow-2xl',
        'transition-colors duration-150',
        selected ? 'border-accent' : 'border-border'
      )}
    >
      {/* Incoming connection handle — top center */}
      <Handle
        type="target"
        position={Position.Top}
        className="!top-[-5px]"
      />

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-accent" />
          <span className="text-xs font-medium text-muted tracking-wide uppercase">
            {MODEL_LABELS[data.model] ?? data.model}
          </span>
        </div>
        <span className="text-xs text-subtle truncate max-w-28">{data.title}</span>
      </div>

      {/* ── Messages ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto max-h-72 px-3 py-2 flex flex-col gap-2 nodrag">
        {data.messages.length === 0 ? (
          <p className="text-xs text-subtle text-center py-6">
            Start a conversation...
          </p>
        ) : (
          data.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex items-start gap-2 text-xs leading-relaxed',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={cn(
                'shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                msg.role === 'user' ? 'bg-accent-muted' : 'bg-surface-2'
              )}>
                {msg.role === 'user'
                  ? <User size={10} className="text-accent" />
                  : <Bot size={10} className="text-muted" />
                }
              </div>
              <p className={cn(
                'rounded-lg px-2.5 py-1.5 max-w-[85%]',
                msg.role === 'user'
                  ? 'bg-accent-muted text-text'
                  : 'bg-surface-2 text-text'
              )}>
                {msg.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ── Input ──────────────────────────────── */}
      <div className="px-3 pb-3 pt-2 border-t border-border nodrag">
        <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2 border border-border focus-within:border-border-focus transition-colors">
          <input
            type="text"
            placeholder="Message..."
            className="flex-1 bg-transparent text-xs text-text placeholder:text-subtle outline-none"
            // AI wiring comes in the next step — API route + store action
          />
          <button className="text-accent hover:text-accent-hover transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Outgoing connection handle — bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bottom-[-5px]"
      />
    </div>
  )
}
