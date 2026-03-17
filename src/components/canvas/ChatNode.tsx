"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { LayoutGrid, Trash2, Copy, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore, type ChatNode } from "@/lib/store";
import { modelToProvider } from "@/lib/models";
import { getKey } from "@/lib/keys";
import ModelSelector from "./ModelSelector";

export default function ChatNode({ id, data, selected }: NodeProps<ChatNode>) {
  const { updateNodeData, removeNode, addNode } = useCanvasStore();

  const [inputValue, setInputValue] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const modelRef = useRef(data.model);
  useEffect(() => { modelRef.current = data.model; }, [data.model]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => ({ "x-api-key": getKey(modelToProvider(modelRef.current)) }),
        body: () => ({ model: modelRef.current }),
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    id,
    messages: data.messages,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" && messages.length > 0) updateNodeData(id, { messages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    if (editingTitle) titleRef.current?.select();
  }, [editingTitle]);

  const handleSubmit = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  };

  return (
    <div
      className={cn(
        "w-125 flex flex-col rounded-xl overflow-hidden",
        "bg-[#131315] transition-all duration-200",
        selected
          ? "border border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.7)]"
          : "border border-white/7 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
      )}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="relative flex items-center gap-2 px-3 py-2.5 border-b border-white/6 nodrag">
        {/* Left handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3.5! h-3.5! rounded-full! bg-[#1e1e22]! border! border-white/12! hover:border-accent/60! hover:bg-accent/10! transition-all! -left-1.75! top-3.5!"
        />

        <div className="w-5 h-5 rounded-md bg-white/6 border border-white/8 flex items-center justify-center shrink-0">
          <LayoutGrid size={10} className="text-white/40" />
        </div>

        {editingTitle ? (
          <input
            ref={titleRef}
            value={data.title}
            onChange={(e) => updateNodeData(id, { title: e.target.value })}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
            className="flex-1 bg-transparent text-sm text-white/80 outline-none min-w-0"
          />
        ) : (
          <span
            onDoubleClick={() => setEditingTitle(true)}
            className="flex-1 text-sm text-white/55 truncate cursor-default select-none"
          >
            {data.title}
          </span>
        )}

        <div className="flex items-center gap-0.5 ml-auto nopan">
          <ActionBtn title="Duplicate" onClick={() => addNode({ x: 100, y: 100 })}>
            <Copy size={12} />
          </ActionBtn>
          <ActionBtn title="Delete" onClick={() => removeNode(id)} danger>
            <Trash2 size={12} />
          </ActionBtn>
        </div>

        {/* Right handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3.5! h-3.5! rounded-full! bg-[#1e1e22]! border! border-white/12! hover:border-accent/60! hover:bg-accent/10! transition-all! -right-1.75! top-3.5!"
        />
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="nodrag nopan flex flex-col">
        {messages.length > 0 && (
          <div className="max-h-70 overflow-y-auto px-4 pt-3 pb-1 flex flex-col gap-2.5 border-b border-white/4">
            {messages.map((msg) => {
              const text = msg.parts
                .filter((p) => p.type === "text")
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
                  {!isUser && (
                    <div className="w-4 h-4 rounded-md bg-white/5 border border-white/7 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={8} className="text-white/35" />
                    </div>
                  )}
                  <p
                    className={cn(
                      "text-[12px] leading-relaxed max-w-[88%] whitespace-pre-wrap",
                      isUser
                        ? "text-white/70 bg-white/6 rounded-xl rounded-tr-sm px-3 py-2"
                        : "text-white/60"
                    )}
                  >
                    {text}
                  </p>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center pb-1">
                <div className="w-4 h-4 rounded-md bg-white/5 border border-white/7 flex items-center justify-center shrink-0">
                  <span className="w-1 h-1 rounded-full bg-white/30 animate-pulse" />
                </div>
                <div className="flex items-center gap-0.75">
                  <span className="w-1 h-1 rounded-full bg-white/25 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 rounded-full bg-white/25 animate-bounce [animation-delay:100ms]" />
                  <span className="w-1 h-1 rounded-full bg-white/25 animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="px-4 py-3.5">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
            placeholder={isLoading ? "Waiting for response..." : "Ask a question..."}
            disabled={isLoading}
            rows={1}
            className="w-full bg-transparent text-sm text-white/70 placeholder:text-white/20 outline-none resize-none disabled:opacity-40 leading-relaxed min-h-6 max-h-50 overflow-y-auto"
          />
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-white/6 nodrag nopan">
        <ModelSelector
          value={data.model}
          onChange={(model) => updateNodeData(id, { model })}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !inputValue.trim()}
          className="flex items-center gap-2 text-xs text-white/35 hover:text-white/65 disabled:opacity-25 disabled:pointer-events-none transition-colors"
        >
          Ask
          <kbd className="text-[10px] font-mono bg-white/6 border border-white/10 rounded px-1.5 py-0.5 leading-none">
            ⌘↵
          </kbd>
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-6 h-6 rounded-md flex items-center justify-center transition-all",
        danger
          ? "text-white/20 hover:text-red-400 hover:bg-red-400/10"
          : "text-white/20 hover:text-white/60 hover:bg-white/6"
      )}
    >
      {children}
    </button>
  );
}
