"use client";

import { useEffect, useRef } from "react";
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

  // Debounced auto-save — 2s after last change
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

  return <Canvas />;
}
