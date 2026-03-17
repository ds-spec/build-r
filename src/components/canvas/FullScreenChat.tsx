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
      {/* Subtle backdrop — canvas still visible behind */}
      <div
        className="fixed inset-0 z-9990 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Focused panel — centered, not full-screen */}
      <div className="fixed inset-0 z-9991 flex items-center justify-center pointer-events-none">
        <div
          className="pointer-events-auto w-170 h-[78vh] flex flex-col rounded-2xl bg-[#0c0a0d] border border-white/9 shadow-[0_48px_140px_rgba(0,0,0,0.9),0_0_0_1px_rgba(192,52,29,0.06)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Accent line */}
          <div className="h-px shrink-0 bg-linear-to-r from-accent/0 via-accent/50 to-accent/0 rounded-t-2xl" />

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/6 shrink-0">
            <span className="flex-1 text-sm font-medium text-white/55 truncate">{title}</span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
            >
              <X size={13} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="chat-scroll flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6 min-h-0"
          >
            {messages.length === 0 && (
              <p className="text-white/15 text-sm text-center mt-14 select-none">
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
                    <p className="text-[13px] text-white/35 leading-relaxed italic">{text}</p>
                  ) : (
                    <div className="text-[13.5px] text-white/78 leading-[1.8]">
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
          <div className="border-t border-white/6 px-6 pt-4 pb-3 shrink-0">
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
              className="w-full bg-transparent text-sm text-white/65 placeholder:text-white/18 outline-none resize-none disabled:opacity-40 leading-relaxed min-h-6 max-h-44 overflow-y-auto"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 pb-4 shrink-0">
            <ModelSelector value={model} onChange={onModelChange} />
            <button
              onClick={onSubmit}
              disabled={isLoading || !inputValue.trim()}
              className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 disabled:opacity-20 disabled:pointer-events-none transition-colors"
            >
              Ask
              <kbd className="font-mono bg-white/5 border border-white/8 rounded px-1.5 py-0.5 leading-none text-[10px]">
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

// ── Markdown renderer (same as ChatNode, slightly larger) ─────────────────────
function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-white/92">{children}</strong>
        ),
        em: ({ children }) => <em className="italic text-white/60">{children}</em>,
        pre: ({ children }) => (
          <pre className="bg-white/4 border border-white/6 rounded-lg px-4 py-3 overflow-x-auto my-3 text-[12px] font-mono text-white/65">
            {children}
          </pre>
        ),
        code: ({ className, children }) =>
          className ? (
            <code>{children}</code>
          ) : (
            <code className="font-mono text-[12px] bg-white/8 text-accent px-1.5 py-0.5 rounded-sm">
              {children}
            </code>
          ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 my-2 pl-1 text-white/70">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 my-2 pl-1 text-white/70">
            {children}
          </ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => (
          <h1 className="text-base font-semibold text-white/90 mt-4 mb-1.5">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-[14px] font-semibold text-white/85 mt-3 mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-[13.5px] font-semibold text-white/80 mt-2.5 mb-1">{children}</h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent/40 pl-4 my-2.5 text-white/50 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent/80 hover:text-accent underline underline-offset-2 decoration-accent/30"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-white/8 my-4" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
