"use client";

import { useState, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Settings, Sun, Moon } from "lucide-react";

import { useCanvasStore } from "@/lib/store";
import { useTheme } from "@/lib/useTheme";
import ChatNode from "./ChatNode";
import ApiKeyPanel from "@/components/settings/ApiKeyPanel";

const nodeTypes = { chatNode: ChatNode };

// ── Theme toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        color: "var(--color-muted)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border-focus)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-muted)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
      }}
    >
      {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
    </button>
  );
}

// ── Canvas inner ──────────────────────────────────────────────────────────────
function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, duplicateNode } =
    useCanvasStore();
  const { screenToFlowPosition } = useReactFlow();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const editing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // N — new node
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !editing) {
        e.preventDefault();
        addNode(screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
        return;
      }

      // Cmd/Ctrl+D — duplicate selected node
      if (e.key === "d" && (e.metaKey || e.ctrlKey) && !editing) {
        const selected = nodes.find((n) => n.selected);
        if (!selected) return;
        e.preventDefault();
        duplicateNode(selected.id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nodes, addNode, duplicateNode, screenToFlowPosition]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        zoomOnDoubleClick={false}
        onPaneClick={(event) => {
          if (event.detail === 2) {
            addNode(screenToFlowPosition({ x: event.clientX, y: event.clientY }));
          }
        }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode="Backspace"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "default",
        }}
        connectionLineStyle={{ stroke: "#c0341d", strokeWidth: 1, opacity: 0.5 }}
        elevateNodesOnSelect
      >
        {/* Empty canvas hint */}
        {nodes.length === 0 && (
          <Panel
            position="top-center"
            className="top-1/2! -translate-y-1/2! pointer-events-none select-none"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm font-medium tracking-wide" style={{ color: "var(--color-subtle)" }}>
                Double-click anywhere to create a node
              </p>
              <p className="text-xs" style={{ color: "var(--color-subtle)", opacity: 0.6 }}>
                or press{" "}
                <kbd
                  className="px-1.5 py-0.5 rounded font-mono text-[11px]"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-subtle)",
                  }}
                >
                  N
                </kbd>
              </p>
            </div>
          </Panel>
        )}

        <Background variant={BackgroundVariant.Dots} gap={44} size={1.5} color="#1e1a1c" />
        <Controls position="bottom-left" showInteractive={false} />

        {/* Top-right panel — API Keys + Theme toggle */}
        <Panel position="top-right">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border-focus)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-muted)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
              }}
            >
              <Settings size={13} />
              API Keys
            </button>

            <ThemeToggle />
          </div>
        </Panel>
      </ReactFlow>

      <ApiKeyPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

// ── Canvas root ───────────────────────────────────────────────────────────────
export default function Canvas() {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
