"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore, type ChatNode } from "@/lib/store";
import { modelToProvider } from "@/lib/models";
import { getKey } from "@/lib/keys";
import ModelSelector from "./ModelSelector";

export default function ChatNode({ id, data, selected }: NodeProps<ChatNode>) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ref so the transport function always reads the latest model without stale closure.
  // The transport is created once (useMemo []), but headers/body are functions
  // called at request time — they read modelRef.current, which stays current.
  const modelRef = useRef(data.model);
  useEffect(() => {
    modelRef.current = data.model;
  }, [data.model]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        // Functions here are called at request time, not at init time
        headers: () => ({
          "x-api-key": getKey(modelToProvider(modelRef.current)),
        }),
        body: () => ({ model: modelRef.current }),
      }),
    [] // created once per node — modelRef handles the dynamic values
  );

  const { messages, sendMessage, status } = useChat({
    id,
    messages: data.messages, // ChatInit.messages — seeds the hook's initial state
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Sync messages to Zustand only when streaming is complete (status → 'ready')
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      updateNodeData(id, { messages });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Auto-scroll to bottom as messages stream in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  };

  return (
    <div
      className={cn(
        "w-80 rounded-xl border bg-surface flex flex-col shadow-2xl",
        "transition-colors duration-150",
        selected ? "border-accent" : "border-border"
      )}
    >
      <Handle type="target" position={Position.Top} className="-top-1.25!" />

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border nodrag">
        <ModelSelector
          value={data.model}
          onChange={(model) => updateNodeData(id, { model })}
        />
        <span className="text-xs text-subtle truncate max-w-28 ml-2">
          {data.title}
        </span>
      </div>

      {/* ── Messages ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto max-h-72 px-3 py-2 flex flex-col gap-2 nodrag nopan">
        {messages.length === 0 ? (
          <p className="text-xs text-subtle text-center py-6">
            Start a conversation...
          </p>
        ) : (
          messages.map((msg) => {
            // In v6, message content is an array of parts
            const text = msg.parts
              .filter((p) => p.type === "text")
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-2 text-xs leading-relaxed",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                    msg.role === "user" ? "bg-accent-muted" : "bg-surface-2"
                  )}
                >
                  {msg.role === "user" ? (
                    <User size={10} className="text-accent" />
                  ) : (
                    <Bot size={10} className="text-muted" />
                  )}
                </div>
                <p
                  className={cn(
                    "rounded-lg px-2.5 py-1.5 max-w-[85%] whitespace-pre-wrap",
                    msg.role === "user"
                      ? "bg-accent-muted text-text"
                      : "bg-surface-2 text-text"
                  )}
                >
                  {text}
                </p>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center">
              <Loader2 size={10} className="text-muted animate-spin" />
            </div>
            <span className="text-xs text-subtle">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ──────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="px-3 pb-3 pt-2 border-t border-border nodrag nopan"
      >
        <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2 border border-border focus-within:border-border-focus transition-colors">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSubmit(e)
            }
            placeholder={isLoading ? "Waiting..." : "Message..."}
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs text-text placeholder:text-subtle outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="text-accent hover:text-accent-hover transition-colors disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>

      <Handle
        type="source"
        position={Position.Bottom}
        className="-bottom-1.25!"
      />
    </div>
  );
}
