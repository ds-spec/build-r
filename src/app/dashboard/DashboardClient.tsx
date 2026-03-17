"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Plus, LayoutGrid, LogOut, Loader2, Trash2 } from "lucide-react";

type Canvas = {
  id: string;
  title: string;
  updated_at: string;
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function DashboardClient({
  user,
  canvases: initial,
}: {
  user: User;
  canvases: Canvas[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [canvases, setCanvases] = useState<Canvas[]>(initial);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createCanvas() {
    setCreating(true);
    const { data, error } = await supabase
      .from("canvases")
      .insert({ title: "Untitled Canvas", user_id: user.id })
      .select("id")
      .single();
    setCreating(false);
    if (!error && data) router.push(`/canvas/${data.id}`);
  }

  async function deleteCanvas(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    await supabase.from("canvases").delete().eq("id", id);
    setCanvases((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-canvas text-white">
      {/* Nav */}
      <header className="border-b border-white/[0.06] px-6 py-3.5 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight">buildr</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">
            {user.email}
          </span>
          <button
            onClick={signOut}
            className="text-white/30 hover:text-white/60 transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-white">Your canvases</h1>
            <p className="text-xs text-white/30 mt-0.5">
              {canvases.length === 0
                ? "No canvases yet — create one to get started"
                : `${canvases.length} canvas${canvases.length !== 1 ? "es" : ""}`}
            </p>
          </div>
          <button
            onClick={createCanvas}
            disabled={creating}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-xs font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {creating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            New canvas
          </button>
        </div>

        {canvases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
              <LayoutGrid size={20} className="text-white/20" />
            </div>
            <p className="text-sm text-white/25">Create your first canvas</p>
            <button
              onClick={createCanvas}
              disabled={creating}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              {creating ? "Creating..." : "Get started →"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {canvases.map((canvas) => (
              <button
                key={canvas.id}
                onClick={() => router.push(`/canvas/${canvas.id}`)}
                className="group relative text-left bg-[#111115] border border-white/[0.07] hover:border-white/[0.13] rounded-2xl p-5 transition-all duration-150 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
              >
                {/* Preview area */}
                <div className="w-full h-20 rounded-lg bg-white/[0.03] border border-white/[0.05] mb-4 flex items-center justify-center">
                  <LayoutGrid size={18} className="text-white/10" />
                </div>

                <p className="text-sm font-medium text-white/80 truncate">
                  {canvas.title}
                </p>
                <p className="text-[11px] text-white/25 mt-0.5">
                  {timeAgo(canvas.updated_at)}
                </p>

                {/* Delete */}
                <button
                  onClick={(e) => deleteCanvas(canvas.id, e)}
                  className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 transition-all"
                  title="Delete"
                >
                  {deletingId === canvas.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
