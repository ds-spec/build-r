"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCanvasStore, type ChatNode } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import Canvas from "./Canvas";
import type { Edge } from "@xyflow/react";

type Props = {
  canvas: {
    id: string;
    title: string;
    nodes: ChatNode[];
    edges: Edge[];
  };
};

export default function CanvasWrapper({ canvas }: Props) {
  const { initCanvas, nodes, edges } = useCanvasStore();
  const supabase = createClient();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  const [title, setTitle] = useState(canvas.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const titleSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed the store once with server data
  useEffect(() => {
    if (!initialized.current) {
      initCanvas(
        canvas.nodes?.length ? canvas.nodes : [],
        canvas.edges?.length ? canvas.edges : []
      );
      initialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (editingTitle) titleRef.current?.select();
  }, [editingTitle]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
    titleSaveTimer.current = setTimeout(async () => {
      await supabase
        .from("canvases")
        .update({ title: newTitle })
        .eq("id", canvas.id);
    }, 1000);
  };

  // Debounced auto-save for nodes/edges — 2s after last change
  useEffect(() => {
    if (!initialized.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await supabase
        .from("canvases")
        .update({ nodes, edges })
        .eq("id", canvas.id);
    }, 2000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [nodes, edges]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* Title bar */}
      <div className="flex items-center gap-3 h-11 px-4 shrink-0 border-b border-border bg-surface text-text">
        <Link
          href="/dashboard"
          className="text-subtle hover:text-muted transition-colors"
        >
          <ArrowLeft size={14} />
        </Link>

        <div className="w-px h-4 bg-border" />

        {editingTitle ? (
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
            className="bg-transparent text-sm font-medium text-text outline-none min-w-0 w-64"
          />
        ) : (
          <span
            onClick={() => setEditingTitle(true)}
            className="text-sm font-medium text-muted hover:text-text cursor-pointer transition-colors select-none"
          >
            {title}
          </span>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <Canvas />
      </div>
    </div>
  );
}
