"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Plus, LogOut, Loader2, Trash2 } from "lucide-react";

type Canvas = { id: string; title: string; updated_at: string };

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function firstName(user: User) {
  const name = user.user_metadata?.full_name as string | undefined;
  return name ? name.split(" ")[0] : (user.email?.split("@")[0] ?? "there");
}

function UserAvatar({ user }: { user: User }) {
  const src = user.user_metadata?.avatar_url as string | undefined;
  if (src)
    return (
      <img
        src={src}
        alt=""
        className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
      />
    );
  const initials = firstName(user).slice(0, 2).toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-[11px] font-semibold text-accent/80">
      {initials}
    </div>
  );
}

function CanvasPreview() {
  return (
    <div
      className="w-full h-30 relative overflow-hidden"
      style={{
        background: "#080609",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* Bottom fade into card footer */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-surface to-transparent" />
      {/* Mini nodes illustration — fades in on card hover */}
      <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="w-14 h-6 rounded-md bg-white/[0.07] border border-white/10 flex items-center justify-center">
          <div className="w-5 h-0.5 rounded bg-white/25" />
        </div>
        <div className="flex items-center gap-0.5">
          <div className="w-2 h-px bg-accent/50" />
          <div className="w-1 h-px bg-accent/25" />
        </div>
        <div className="w-14 h-6 rounded-md bg-white/4 border border-white/7 flex items-center justify-center">
          <div className="w-4 h-0.5 rounded bg-white/15" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  onCreate,
  creating,
}: {
  onCreate: () => void;
  creating: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-5">
      <div
        className="w-20 h-20 rounded-2xl border border-white/8 relative overflow-hidden"
        style={{
          background: "#0a0809",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-1.5">
          <div className="w-7 h-5 rounded bg-white/7 border border-white/10" />
          <div className="w-4 h-px bg-white/20" />
          <div className="w-7 h-5 rounded bg-white/4 border border-white/7" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-[#0a0809] to-transparent" />
      </div>

      <div className="text-center">
        <p className="text-[15px] font-medium text-white/55">No canvases yet</p>
        <p className="text-xs text-white/25 mt-1">
          Create a canvas to start building
        </p>
      </div>

      <button
        onClick={onCreate}
        disabled={creating}
        className="flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded-xl border border-accent/30 text-accent/80 hover:text-accent hover:border-accent/50 hover:bg-accent/5 transition-all duration-150 disabled:opacity-50 active:scale-[0.97]"
      >
        {creating ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Plus size={13} />
        )}
        Create first canvas
      </button>
    </div>
  );
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
      {/* Ambient top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-150 h-px bg-accent/20 blur-[60px] pointer-events-none" />

      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-canvas/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold tracking-tight">buildr</span>
          <div className="w-1 h-1 rounded-full bg-accent" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:block text-[11px] text-white/25 tabular-nums">
            {user.email}
          </span>
          <div className="h-3.5 w-px bg-white/10" />
          <UserAvatar user={user} />
          <button
            onClick={signOut}
            className="p-1.5 rounded-md text-white/25 hover:text-white/60 hover:bg-white/5 transition-all duration-150"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 pt-14 pb-20">
        {/* Page header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/25 mb-1.5 font-medium">
              {getGreeting()}
            </p>
            <h1 className="text-[26px] font-semibold text-white/90 tracking-tight leading-none">
              {firstName(user)}
            </h1>
            <p className="text-sm text-white/30 mt-2">
              {canvases.length === 0
                ? "Start by creating your first canvas"
                : `${canvases.length} canvas${canvases.length !== 1 ? "es" : ""}`}
            </p>
          </div>

          <button
            onClick={createCanvas}
            disabled={creating}
            className="group flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-medium px-4 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 shadow-[0_4px_14px_rgba(192,52,29,0.25)] hover:shadow-[0_4px_22px_rgba(192,52,29,0.4)] active:scale-[0.97]"
          >
            {creating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus
                size={13}
                className="transition-transform duration-200 group-hover:rotate-90"
              />
            )}
            New canvas
          </button>
        </div>

        {/* Grid */}
        {canvases.length === 0 ? (
          <EmptyState onCreate={createCanvas} creating={creating} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {canvases.map((canvas) => (
              <button
                key={canvas.id}
                onClick={() => router.push(`/canvas/${canvas.id}`)}
                className="group relative text-left bg-surface border border-white/7 hover:border-accent/20 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(192,52,29,0.07)] active:scale-[0.99] active:translate-y-0"
              >
                {/* Accent top line */}
                <div className="h-px bg-linear-to-r from-transparent via-accent/25 to-transparent group-hover:via-accent/50 transition-all duration-300" />

                <CanvasPreview />

                {/* Footer */}
                <div className="px-4 py-3.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-white/75 group-hover:text-white/95 transition-colors duration-150 truncate">
                      {canvas.title}
                    </p>
                    <p className="text-[11px] text-white/25 mt-0.5 tabular-nums">
                      {timeAgo(canvas.updated_at)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => deleteCanvas(canvas.id, e)}
                    className="shrink-0 mt-0.5 p-1.5 rounded-md text-white/0 group-hover:text-white/25 hover:text-red-400! hover:bg-red-400/10 transition-all duration-150"
                    title="Delete"
                  >
                    {deletingId === canvas.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
