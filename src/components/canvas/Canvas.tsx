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
import { Settings } from "lucide-react";

import { useCanvasStore } from "@/lib/store";
import ChatNode from "./ChatNode";
import ApiKeyPanel from "@/components/settings/ApiKeyPanel";

const nodeTypes = {
  chatNode: ChatNode,
};

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

      // N — new node (no modifier, like Figma)
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
            addNode(
              screenToFlowPosition({ x: event.clientX, y: event.clientY })
            );
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
          style: { stroke: "#3a2825", strokeWidth: 1.25 },
        }}
        connectionLineStyle={{
          stroke: "#c0341d",
          strokeWidth: 1,
          opacity: 0.5,
        }}
        elevateNodesOnSelect
      >
        {nodes.length === 0 && (
          <Panel position="top-center" className="top-1/2! -translate-y-1/2! pointer-events-none select-none">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-white/20 text-sm font-medium tracking-wide">
                Double-click anywhere to create a node
              </p>
              <p className="text-white/10 text-xs">
                or press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/20 font-mono text-[11px]">N</kbd>
              </p>
            </div>
          </Panel>
        )}

        <Background
          variant={BackgroundVariant.Dots}
          gap={44}
          size={1.5}
          color="#1e1a1c"
        />

        <Controls position="bottom-left" showInteractive={false} />

        <Panel position="top-right">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f0d10] border border-white/7 text-white/35 hover:text-white/65 hover:border-white/13 transition-all text-xs"
          >
            <Settings size={13} />
            API Keys
          </button>
        </Panel>
      </ReactFlow>

      <ApiKeyPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export default function Canvas() {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <CanvasInner />
      </ReactFlowProvider>
    </div>
  );
}
