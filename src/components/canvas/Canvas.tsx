'use client'

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from '@/lib/store'
import ChatNode from './ChatNode'

// MUST be defined outside the component — React Flow uses referential equality
// to decide whether to remount node components. Defining inside = constant remounts.
const nodeTypes = {
  chatNode: ChatNode,
}

export default function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useCanvasStore()

  // Double-click on the canvas background creates a new node at that position
  const handlePaneDoubleClick: NodeMouseHandler = (event) => {
    const target = event.target as HTMLElement
    // Only fire when clicking the background pane, not a node
    if (!target.classList.contains('react-flow__pane')) return

    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
    addNode({
      x: (event as unknown as MouseEvent).clientX - bounds.left - 160, // center the 320px node
      y: (event as unknown as MouseEvent).clientY - bounds.top - 50,
    })
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={(e) => {
          // single click: could deselect, React Flow handles this natively
        }}
        onDoubleClick={handlePaneDoubleClick as unknown as React.MouseEventHandler}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode="Backspace"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#2A2A38"
        />
        <Controls position="bottom-left" />
        <MiniMap
          position="bottom-right"
          nodeColor="#1C1C21"
          maskColor="rgba(12,12,15,0.7)"
        />
      </ReactFlow>
    </div>
  )
}
