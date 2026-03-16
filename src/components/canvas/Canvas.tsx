"use client";

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCanvasStore } from "@/lib/store";
import ChatNode from "./ChatNode";
import { useRef } from "react";

const nodeTypes = {
  chatNode: ChatNode,
};

// CanvasInner is split out so it can call useReactFlow().
// useReactFlow() requires being inside a ReactFlowProvider context —
// the component that *renders* <ReactFlow> is outside that context,
// so it can't call the hook directly. CanvasInner renders *inside* the provider.

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useCanvasStore();

  const { screenToFlowPosition } = useReactFlow();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      zoomOnDoubleClick={false}
      // onDoubleClick={handleDoubleClick}
      // onClick
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
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={40}
        size={2.5}
        color="#2f2f2f"
      />
      <Controls position="bottom-left" />
      <MiniMap
        position="bottom-right"
        nodeColor="#1C1C21"
        maskColor="rgba(12,12,15,0.7)"
      />
    </ReactFlow>
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
