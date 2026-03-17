"use client";

import { useState } from "react";
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
        <Background
          variant={BackgroundVariant.Dots}
          gap={44}
          size={1.5}
          color="#1e1a1c"
        />

        <Controls
          position="bottom-left"
          showInteractive={false}
        />

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
