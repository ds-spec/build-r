'use client'

import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import type { Node, Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react'
import { nanoid } from 'nanoid'

// The data payload inside each chat node
export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ChatNodeData = {
  title: string
  model: string
  messages: Message[]
}

// Extend React Flow's Node type with our data shape
export type ChatNode = Node<ChatNodeData>

type CanvasStore = {
  nodes: ChatNode[]
  edges: Edge[]

  // React Flow change handlers — called on every drag, resize, delete, etc.
  onNodesChange: (changes: NodeChange<ChatNode>[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  // Our own actions
  addNode: (position: { x: number; y: number }) => void
  updateNodeData: (nodeId: string, data: Partial<ChatNodeData>) => void
}

// One starter node so the canvas isn't empty on first load
const initialNode: ChatNode = {
  id: nanoid(),
  type: 'chatNode',
  position: { x: 200, y: 150 },
  data: {
    title: 'New Chat',
    model: 'gpt-4o',
    messages: [],
  },
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  nodes: [initialNode],
  edges: [],

  // applyNodeChanges is a React Flow utility that handles the delta updates
  // (position changes, selection, deletion) and returns the new nodes array
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) =>
    set((state) => ({
      edges: [
        ...state.edges,
        { ...connection, id: nanoid(), animated: true },
      ],
    })),

  addNode: (position) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: nanoid(),
          type: 'chatNode',
          position,
          data: { title: 'New Chat', model: 'gpt-4o', messages: [] },
        },
      ],
    })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),
}))
