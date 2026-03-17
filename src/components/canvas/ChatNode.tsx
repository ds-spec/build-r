"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import { Trash2, Copy, Maximize2, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore, type ChatNode } from "@/lib/store";
import { modelToProvider } from "@/lib/models";
import { getKey } from "@/lib/keys";
import ModelSelector from "./ModelSelector";
import FullScreenChat from "./FullScreenChat";

type ContextMenu = { x: number; y: number; idx: number } | null;

export default function ChatNode({ id, data, selected }: NodeProps<ChatNode>) {
  const { updateNodeData, removeNode, addNode, addBranchNode } =
    useCanvasStore();
  const { getNode } = useReactFlow();

  const [inputValue, setInputValue] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const modelRef = useRef(data.model);
  useEffect(() => {
    modelRef.current = data.model;
  }, [data.model]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => ({
          "x-api-key": getKey(modelToProvider(modelRef.current)),
        }),
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

  // branchDepth = number of leading messages that are hidden context (inherited from parent)
  const branchDepth = data.branchDepth ?? 0;
  // What the user sees: only messages after the inherited context
  const visibleMessages = messages.slice(branchDepth);

  useEffect(() => {
    if (status === "ready" && messages.length > 0)
      updateNodeData(id, { messages });
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

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  const handleSubmit = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  };

  const handleBranch = (visibleIdx: number) => {
    const node = getNode(id);
    if (!node) return;
    // Branch includes the context + everything up to the right-clicked message
    const absoluteIdx = branchDepth + visibleIdx;
    addBranchNode(
      { x: node.position.x + 560, y: node.position.y + 80 },
      id,
      messages.slice(0, absoluteIdx + 1),
      data.model
    );
    setContextMenu(null);
  };

  return (
    <>
      <div
        className={cn(
          "w-125 flex flex-col rounded-xl",
          "bg-[#0f0d0e] transition-shadow duration-200",
          selected
            ? "border border-accent/25 shadow-[0_0_0_1px_rgba(192,52,29,0.08),0_12px_48px_rgba(0,0,0,0.8)]"
            : "border border-white/6 shadow-[0_4px_32px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.03)_inset]"
        )}
      >
        {/* Accent top line */}
        <div className="h-px shrink-0 bg-linear-to-r from-accent/0 via-accent/40 to-accent/0" />

        {/* ── Header — drag handle ─────────────────────────── */}
        <div className="node-drag-handle relative flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing">
          <Handle
            type="target"
            position={Position.Left}
            className="w-2.5! h-2.5! rounded-full! border-0! opacity-100! -left-1.25! top-1/2! -translate-y-1/2!"
            style={{
              background: "#c0341d",
              boxShadow: "0 0 6px rgba(192,52,29,0.6)",
            }}
          />

          {editingTitle ? (
            <input
              ref={titleRef}
              value={data.title}
              onChange={(e) => updateNodeData(id, { title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              className="nodrag flex-1 bg-transparent text-[13px] font-medium text-white/80 outline-none min-w-0 cursor-text"
            />
          ) : (
            <span
              onDoubleClick={() => setEditingTitle(true)}
              className="flex-1 text-[13px] font-medium text-white/50 truncate select-none"
            >
              {data.title}
            </span>
          )}

          <div className="nodrag nopan flex items-center gap-0.5 ml-auto">
            <ActionBtn title="Full screen" onClick={() => setFullScreen(true)}>
              <Maximize2 size={11} />
            </ActionBtn>
            <ActionBtn
              title="Duplicate"
              onClick={() => addNode({ x: 100, y: 100 })}
            >
              <Copy size={11} />
            </ActionBtn>
            <ActionBtn title="Delete" onClick={() => removeNode(id)} danger>
              <Trash2 size={11} />
            </ActionBtn>
          </div>

          <Handle
            type="source"
            position={Position.Right}
            className="w-2.5! h-2.5! rounded-full! border! border-white/15! opacity-100! bg-[#1e1618]! hover:bg-accent! hover:border-accent/0! hover:shadow-[0_0_6px_rgba(192,52,29,0.6)]! transition-all! -right-1.25! top-1/2! -translate-y-1/2!"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mx-3" />

        {/* ── Body ─────────────────────────────────────────── */}
        <div className="nodrag nopan flex flex-col">
          {/* Branch context indicator */}
          {branchDepth > 0 && (
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
              <GitBranch size={9} className="text-accent/50 shrink-0" />
              <span className="text-[10.5px] text-white/25">
                {branchDepth} message{branchDepth !== 1 ? "s" : ""} of context
                inherited
              </span>
            </div>
          )}

          {/* Messages */}
          {visibleMessages.length > 0 && (
            <div
              className="nowheel nodrag nopan chat-scroll max-h-150 overflow-y-auto px-4 py-4 flex flex-col gap-5"
              onWheel={(e) => e.stopPropagation()}
            >
              {visibleMessages.map((msg, idx) => {
                const text = msg.parts
                  .filter((p) => p.type === "text")
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("");
                const isUser = msg.role === "user";

                return (
                  <div
                    key={msg.id}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, idx });
                    }}
                  >
                    {isUser ? (
                      <p className="text-[12px] text-white/35 leading-relaxed italic">
                        {text}
                      </p>
                    ) : (
                      <div className="text-[12.5px] text-white/75 leading-[1.75]">
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
          )}

          {/* Input */}
          <div className="px-4 py-4">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  handleSubmit();
              }}
              placeholder={
                isLoading ? "Waiting for response..." : "Ask a question..."
              }
              disabled={isLoading}
              rows={1}
              className="w-full bg-transparent text-sm text-white/65 placeholder:text-white/18 outline-none resize-none disabled:opacity-40 leading-relaxed min-h-6 max-h-50 overflow-y-auto"
            />
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3.5 pb-3 nodrag nopan">
          <ModelSelector
            value={data.model}
            onChange={(model) => updateNodeData(id, { model })}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputValue.trim()}
            className="flex items-center gap-1.5 text-[11px] text-white/80 hover:text-white/60 disabled:opacity-20 disabled:pointer-events-none transition-colors"
          >
            Ask
            <kbd className="font-mono bg-white/5 border border-white/8 rounded px-1.5 py-0.5 leading-none text-[10px]">
              ⌘↵
            </kbd>
          </button>
        </div>
      </div>

      {/* ── Full-screen panel ─────────────────────────────── */}
      <FullScreenChat
        open={fullScreen}
        onClose={() => setFullScreen(false)}
        title={data.title}
        model={data.model}
        onModelChange={(model) => updateNodeData(id, { model })}
        messages={visibleMessages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* ── Branch context menu ───────────────────────────── */}
      {contextMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-9998 bg-surface border border-white/10 rounded-lg shadow-2xl py-1 min-w-42"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleBranch(contextMenu.idx)}
              className="w-full px-3 py-2 text-left text-[12px] text-white/55 hover:text-white/90 hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <GitBranch size={11} className="text-accent" />
              Branch from here
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-white/92">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-white/60">{children}</em>
        ),
        pre: ({ children }) => (
          <pre className="bg-white/4 border border-white/6 rounded-lg px-3 py-2.5 overflow-x-auto my-2.5 text-[11px] font-mono text-white/65">
            {children}
          </pre>
        ),
        code: ({ className, children }) =>
          className ? (
            <code>{children}</code>
          ) : (
            <code className="font-mono text-[11px] bg-white/8 text-accent px-1.5 py-0.5 rounded-sm">
              {children}
            </code>
          ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-0.5 my-1.5 pl-1 text-white/70">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-0.5 my-1.5 pl-1 text-white/70">
            {children}
          </ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => (
          <h1 className="text-[13.5px] font-semibold text-white/90 mt-3 mb-1">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-[13px] font-semibold text-white/85 mt-2.5 mb-1">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-[12.5px] font-semibold text-white/80 mt-2 mb-0.5">
            {children}
          </h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent/40 pl-3 my-2 text-white/50 italic">
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
        hr: () => <hr className="border-white/8 my-3" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────
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
          ? "text-white/18 hover:text-red-400 hover:bg-red-400/8"
          : "text-white/18 hover:text-white/55 hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}
