"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Handle, Position, type NodeProps, useReactFlow } from "@xyflow/react";
import { Trash2, Copy, Maximize2, GitBranch, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore, type ChatNode } from "@/lib/store";
import { modelToProvider } from "@/lib/models";
import { getKey } from "@/lib/keys";
import ModelSelector from "./ModelSelector";
import FullScreenChat from "./FullScreenChat";

type ContextMenu = { x: number; y: number; idx: number } | null;
type SelectionTip = {
  x: number;
  y: number;
  text: string;
  msgIdx: number;
} | null;

export default function ChatNode({ id, data, selected }: NodeProps<ChatNode>) {
  const { updateNodeData, removeNode, addNode, addBranchNode } =
    useCanvasStore();
  const { getNode } = useReactFlow();

  const [inputValue, setInputValue] = useState(data.initialInput ?? "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [selectionTip, setSelectionTip] = useState<SelectionTip>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectionTipRef = useRef<HTMLDivElement>(null);

  // Keep model ref in sync for the memoized transport
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

  const branchDepth = data.branchDepth ?? 0;
  const visibleMessages = messages.slice(branchDepth);
  const isBranched = branchDepth > 0;

  // ── Side effects ────────────────────────────────────────────────────────────

  // Persist messages when a streaming turn finishes
  useEffect(() => {
    if (status === "ready" && messages.length > 0)
      updateNodeData(id, { messages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-size textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (editingTitle) titleRef.current?.select();
  }, [editingTitle]);

  // Close context menu on next click
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  // Close selection tip on outside mousedown (but not on the tip itself)
  useEffect(() => {
    if (!selectionTip) return;
    const dismiss = (e: MouseEvent) => {
      if (selectionTipRef.current?.contains(e.target as Node)) return;
      setSelectionTip(null);
    };
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, [selectionTip]);

  // If this node was created from a text selection, consume the pre-filled input
  useEffect(() => {
    if (data.initialInput) {
      updateNodeData(id, { initialInput: undefined });
      // Brief delay so the node finishes mounting before focus
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!inputValue.trim() || isLoading) return;

    // Auto-title: set a meaningful node title from the first message
    // Avoids "New Chat" / "Branch" persisting once conversation starts
    const isGenericTitle = data.title === "New Chat" || data.title === "Branch";
    if (isGenericTitle && visibleMessages.length === 0) {
      const words = inputValue.trim().split(/\s+/).slice(0, 4).join(" ");
      updateNodeData(id, {
        title: words.length > 28 ? words.slice(0, 28) + "…" : words,
      });
    }

    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  };

  const handleBranch = (visibleIdx: number) => {
    const node = getNode(id);
    if (!node) return;
    const absoluteIdx = branchDepth + visibleIdx;
    addBranchNode(
      { x: node.position.x + 560, y: node.position.y + 80 },
      id,
      messages.slice(0, absoluteIdx + 1),
      data.model
    );
    setContextMenu(null);
  };

  // Detect text selection inside the messages area → show floating branch tip
  const handleTextMouseUp = useCallback(() => {
    requestAnimationFrame(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelectionTip(null);
        return;
      }

      const text = sel.toString().trim();
      if (!text) {
        setSelectionTip(null);
        return;
      }

      // Walk up from selection anchor to find the [data-msg-idx] element
      let el: Node | null = sel.anchorNode;
      let msgIdx: number | null = null;
      while (el) {
        if (el instanceof HTMLElement && el.dataset.msgIdx !== undefined) {
          msgIdx = parseInt(el.dataset.msgIdx);
          break;
        }
        el = el.parentNode;
      }
      if (msgIdx === null) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect.width) return;

      setSelectionTip({
        x: rect.left + rect.width / 2,
        y: rect.top,
        text,
        msgIdx,
      });
    });
  }, []);

  const handleBranchFromSelection = () => {
    if (!selectionTip) return;
    const node = getNode(id);
    if (!node) return;
    const absoluteIdx = branchDepth + selectionTip.msgIdx;
    // Blockquote prefix makes it clear to the LLM what the user is referencing
    const initialInput = `> ${selectionTip.text}\n\n`;
    addBranchNode(
      { x: node.position.x + 560, y: node.position.y + 80 },
      id,
      messages.slice(0, absoluteIdx + 1),
      data.model,
      initialInput
    );
    setSelectionTip(null);
    window.getSelection()?.removeAllRanges();
  };

  console.log(visibleMessages);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className={cn(
          "cn-node w-125 flex flex-col rounded-xl",
          selected && "cn-node-sel"
        )}
      >
        {/* Accent top bar */}
        <div className="cn-bar h-px shrink-0" />

        {/* ── Header ─────────────────────────────────────────── */}
        {/*
          Entire header = React Flow drag zone (node-drag-handle).
          cursor-grab on the zone, individual elements override where needed.
        */}
        <div className="node-drag-handle relative flex items-center gap-1.5 px-3 py-2.5 cursor-grab active:cursor-grabbing">
          {/* Left handle — incoming connections */}
          <Handle
            type="target"
            position={Position.Left}
            className="w-2.5! h-2.5! rounded-full! border-0! opacity-100! -left-1.25! top-1/2! -translate-y-1/2!"
            style={{
              background: "#c0341d",
              boxShadow: "0 0 6px rgba(192,52,29,0.6)",
            }}
          />

          {/* Drag affordance — visual signal, no pointer events */}
          <GripVertical
            size={12}
            className="cn-grip-icon shrink-0 pointer-events-none select-none"
          />

          {/* Title */}
          {editingTitle ? (
            <input
              ref={titleRef}
              value={data.title}
              onChange={(e) => updateNodeData(id, { title: e.target.value })}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              className="cn-title-input nodrag flex-1 bg-transparent text-[13px] font-medium outline-none min-w-0 "
            />
          ) : (
            <span
              onDoubleClick={() => setEditingTitle(true)}
              className="cn-title-text flex-1 text-[13px] font-medium w-fit truncate select-none cursor-text"
            >
              {data.title}
            </span>
          )}

          {/*
            Context indicator — shows when this node has inherited context.
            Design principle: NO raw counts, NO internal jargon in the chat body.
            A subtle icon in the header; tooltip on hover reveals human-readable info.
          */}
          {isBranched && (
            <div className="nodrag nopan relative group shrink-0 cursor-default">
              <div className="w-5 h-5 flex items-center justify-center rounded-md">
                <GitBranch
                  size={9}
                  className="transition-colors duration-150"
                  style={{ color: "var(--cn-grip)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "rgba(192,52,29,0.50)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--cn-grip)")
                  }
                />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                <div className="cn-tip-box rounded-lg px-2.5 py-1.5 shadow-2xl whitespace-nowrap">
                  <p className="cn-tip-text text-[10.5px] leading-none">
                    Using prior context
                  </p>
                </div>
                <div className="cn-tip-arrow-down" />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="nodrag nopan flex items-center gap-0.5 ml-auto">
            <HeaderBtn title="Full screen" onClick={() => setFullScreen(true)}>
              <Maximize2 size={11} />
            </HeaderBtn>
            <HeaderBtn
              title="Duplicate"
              onClick={() => addNode({ x: 100, y: 100 })}
            >
              <Copy size={11} />
            </HeaderBtn>
            <HeaderBtn title="Delete" onClick={() => removeNode(id)} danger>
              <Trash2 size={11} />
            </HeaderBtn>
          </div>

          {/* Right handle — outgoing connections */}
          <Handle
            type="source"
            position={Position.Right}
            className="w-2.5! h-2.5! rounded-full! border! border-white/15! opacity-100! bg-[#1e1618]! hover:bg-accent! hover:border-accent/0! hover:shadow-[0_0_6px_rgba(192,52,29,0.6)]! transition-all! -right-1.25! top-1/2! -translate-y-1/2!"
          />
        </div>

        {/* Divider */}
        <div className="cn-divider h-px mx-3" />

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="nodrag nopan flex flex-col">
          {/* Messages */}
          {visibleMessages.length > 0 && (
            <div
              /*
                cn-messages applies: user-select: text !important; cursor: text !important;
                This is the canonical override for React Flow's user-select: none.
                Also add inline style as belt-and-suspenders for specificity.
              */
              className="cn-messages nowheel nodrag nopan chat-scroll max-h-150 overflow-y-auto px-4 py-2 flex flex-col"
              style={
                {
                  userSelect: "text",
                  WebkitUserSelect: "text",
                } as React.CSSProperties
              }
              onWheel={(e) => e.stopPropagation()}
              onMouseUp={handleTextMouseUp}
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
                    data-msg-idx={idx}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectionTip(null);
                      setContextMenu({ x: e.clientX, y: e.clientY, idx });
                    }}
                  >
                    {isUser ? (
                      <p className="cn-msg-user text-[12px] leading-relaxed italic">
                        {text}
                      </p>
                    ) : (
                      <MarkdownMessage content={text} />
                    )}
                  </div>
                );
              })}

              {isLoading && <LoadingDots />}

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
                isLoading ? "Waiting for response…" : "Ask anything…"
              }
              disabled={isLoading}
              rows={1}
              className="cn-input-area w-full bg-transparent text-sm outline-none resize-none disabled:opacity-40 leading-relaxed min-h-6 max-h-50 overflow-y-auto cursor-text"
            />
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3.5 pb-3 nodrag nopan">
          <ModelSelector
            value={data.model}
            onChange={(model) => updateNodeData(id, { model })}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputValue.trim()}
            className="cn-btn flex items-center gap-1.5 text-[11px] disabled:opacity-20 disabled:pointer-events-none"
          >
            Send
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

      {/* ── Right-click context menu ──────────────────────── */}
      {contextMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="cn-ctx-menu fixed z-9998 rounded-lg shadow-2xl py-1 min-w-42"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleBranch(contextMenu.idx)}
              className="cn-ctx-item w-full px-3 py-2 text-left text-[12px] flex items-center gap-2"
            >
              <GitBranch size={11} className="text-accent shrink-0" />
              Branch from here
            </button>
          </div>,
          document.body
        )}

      {/* ── Text-selection branch tip ─────────────────────── */}
      {selectionTip &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={selectionTipRef}
            className="fixed z-9999 -translate-x-1/2 -translate-y-full pointer-events-auto"
            style={{ left: selectionTip.x, top: selectionTip.y - 10 }}
          >
            <button
              onMouseDown={(e) => e.preventDefault()} // prevent selection clearing
              onClick={handleBranchFromSelection}
              className="cn-sel-tip flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-2xl text-[11px] whitespace-nowrap"
            >
              <GitBranch size={10} className="text-accent shrink-0" />
              Branch from selection
            </button>
            <div className="cn-sel-tip-arrow" />
          </div>,
          document.body
        )}
    </>
  );
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
// Uses .cn-md CSS class for all color theming — no hardcoded colors here.
function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="cn-msg-ai cn-md text-[12.5px] leading-[1.75]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
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
    </div>
  );
}

// ── Loading dots ──────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="w-1 h-1 rounded-full bg-accent/60 animate-bounce [animation-delay:0ms]" />
      <span className="w-1 h-1 rounded-full bg-accent/60 animate-bounce [animation-delay:120ms]" />
      <span className="w-1 h-1 rounded-full bg-accent/60 animate-bounce [animation-delay:240ms]" />
    </div>
  );
}

// ── Header action button ──────────────────────────────────────────────────────
function HeaderBtn({
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
        "cn-btn w-6 h-6 rounded-md flex items-center justify-center",
        danger && "cn-btn-danger"
      )}
    >
      {children}
    </button>
  );
}
