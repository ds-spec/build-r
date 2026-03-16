import Canvas from '@/components/canvas/Canvas'

// This page is the full-screen canvas workspace.
// The [id] param will map to a canvas document in Supabase (Week 2).
export default function CanvasPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-canvas">
      <Canvas />
    </main>
  )
}
