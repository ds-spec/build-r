"use client";

import { useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useCanvasStore();
  const { screenToFlowPosition } = useReactFlow();
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          type: "smoothstep",
          style: { stroke: "#3d3d52", strokeWidth: 1.5 },
        }}
        connectionLineStyle={{ stroke: "#6366f1", strokeWidth: 1.5, opacity: 0.6 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={40}
          size={2.5}
          color="#2f2f2f"
        />
        <Controls position="bottom-left" />
        <MiniMap
          nodeStrokeWidth={3}
          nodeStrokeColor="#1a1a1a"
          position="bottom-right"
          nodeColor="#1C1C21"
          maskColor="rgba(12,12,15,0.7)"
        />

        {/* Gear button — top-right corner, sits over the canvas */}
        <Panel position="top-right">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-muted hover:text-text hover:border-border-focus transition-all text-xs"
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
