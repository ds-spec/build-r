"use client";

import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import type { UIMessage } from "ai";

export type ChatNodeData = {
  title: string;
  model: string;
  messages: UIMessage[];
  // How many leading messages are inherited context (hidden from UI, used for LLM history)
  branchDepth?: number;
};

// Extend React Flow's Node type with our data shape
export type ChatNode = Node<ChatNodeData>;

type CanvasStore = {
  nodes: ChatNode[];
  edges: Edge[];

  // React Flow change handlers — called on every drag, resize, delete, etc.
  onNodesChange: (changes: NodeChange<ChatNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Our own actions
  addNode: (position: { x: number; y: number }) => void;
  duplicateNode: (nodeId: string) => void;
  addBranchNode: (
    position: { x: number; y: number },
    sourceNodeId: string,
    messages: UIMessage[],
    model: string
  ) => void;
  updateNodeData: (nodeId: string, data: Partial<ChatNodeData>) => void;
  removeNode: (nodeId: string) => void;
  initCanvas: (nodes: ChatNode[], edges: Edge[]) => void;
};

const DRAG_HANDLE = ".node-drag-handle";

// One starter node so the canvas isn't empty on first load
const initialNode: ChatNode = {
  id: nanoid(),
  type: "chatNode",
  dragHandle: DRAG_HANDLE,
  position: { x: 200, y: 150 },
  data: {
    title: "New Chat",
    model: "gpt-4o",
    messages: [],
  },
};

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
      edges: [...state.edges, { ...connection, id: nanoid(), type: "default" }],
    })),

  addNode: (position) =>
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id: nanoid(),
          type: "chatNode",
          dragHandle: DRAG_HANDLE,
          position,
          data: { title: "New Chat", model: "gpt-4o", messages: [] },
        },
      ],
    })),

  duplicateNode: (nodeId) =>
    set((state) => {
      const source = state.nodes.find((n) => n.id === nodeId);
      if (!source) return state;
      return {
        nodes: [
          ...state.nodes,
          {
            ...source,
            id: nanoid(),
            dragHandle: DRAG_HANDLE,
            selected: false,
            position: { x: source.position.x + 40, y: source.position.y + 40 },
            data: { ...source.data },
          },
        ],
      };
    }),

  addBranchNode: (position, sourceNodeId, messages, model) =>
    set((state) => {
      const newId = nanoid();
      return {
        nodes: [
          ...state.nodes,
          {
            id: newId,
            type: "chatNode",
            dragHandle: DRAG_HANDLE,
            position,
            // Pass full history as context; branchDepth hides it from the UI
            data: { title: "Branch", model, messages, branchDepth: messages.length },
          },
        ],
        edges: [
          ...state.edges,
          { id: nanoid(), source: sourceNodeId, target: newId, type: "default" },
        ],
      };
    }),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
    })),

  initCanvas: (nodes, edges) => set({ nodes, edges }),
}));
