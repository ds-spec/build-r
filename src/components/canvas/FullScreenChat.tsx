"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X } from "lucide-react";
import type { UIMessage } from "ai";
import ModelSelector from "./ModelSelector";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  model: string;
  onModelChange: (model: string) => void;
  messages: UIMessage[];
  inputValue: string;
  setInputValue: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function FullScreenChat({
  open,
  onClose,
  title,
  model,
  onModelChange,
  messages,
  inputValue,
  setInputValue,
  onSubmit,
  isLoading,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [inputValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-9990 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-9991 flex items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto w-170 h-[78vh] flex flex-col rounded-2xl bg-surface border border-border shadow-[0_4px_48px_rgba(0,0,0,0.2),0_0_0_1px_rgba(192,52,29,0.06)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Accent line */}
          <div className="h-px shrink-0 bg-linear-to-r from-accent/0 via-accent/50 to-accent/0 rounded-t-2xl" />

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
            <span className="flex-1 text-sm font-medium text-muted truncate">{title}</span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-subtle hover:text-muted hover:bg-surface-2 transition-all"
            >
              <X size={13} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-scroll flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6 min-h-0">
            {messages.length === 0 && (
              <p className="text-subtle text-sm text-center mt-14 select-none">
                Start typing below to begin.
              </p>
            )}
            {messages.map((msg) => {
              const text = msg.parts
                .filter((p) => p.type === "text")
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = msg.role === "user";
              return (
                <div key={msg.id}>
                  {isUser ? (
                    <p className="cn-msg-user text-[13px] leading-relaxed italic">{text}</p>
                  ) : (
                    <div className="cn-msg-ai cn-md text-[13.5px] leading-[1.8]">
                      <MarkdownMessage content={text} />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1 h-1 rounded-full bg-accent/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 rounded-full bg-accent/60 animate-bounce [animation-delay:120ms]" />
                <span className="w-1 h-1 rounded-full bg-accent/60 animate-bounce [animation-delay:240ms]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border px-6 pt-4 pb-3 shrink-0">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
              }}
              placeholder={isLoading ? "Waiting for response..." : "Ask a question..."}
              disabled={isLoading}
              rows={1}
              className="cn-input-area w-full bg-transparent text-sm outline-none resize-none disabled:opacity-40 leading-relaxed min-h-6 max-h-44 overflow-y-auto"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 pb-4 shrink-0">
            <ModelSelector value={model} onChange={onModelChange} />
            <button
              onClick={onSubmit}
              disabled={isLoading || !inputValue.trim()}
              className="cn-btn flex items-center gap-1.5 text-[11px] disabled:opacity-20 disabled:pointer-events-none"
            >
              Ask
              <kbd
                className="font-mono rounded px-1.5 py-0.5 leading-none text-[10px]"
                style={{
                  background: "var(--cn-icon-bg)",
                  border: "1px solid var(--cn-border)",
                }}
              >
                ⌘↵
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ── Markdown renderer — uses .cn-md CSS class for all color theming ───────────
function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong>{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        pre: ({ children }) => <pre>{children}</pre>,
        code: ({ className, children }) =>
          className ? <code>{children}</code> : <code>{children}</code>,
        ul: ({ children }) => (
          <ul className="space-y-0.5 my-1.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-0.5 my-1.5">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => <h1>{children}</h1>,
        h2: ({ children }) => <h2>{children}</h2>,
        h3: ({ children }) => <h3>{children}</h3>,
        blockquote: ({ children }) => <blockquote>{children}</blockquote>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        hr: () => <hr />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
