import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CanvasWrapper from "@/components/canvas/CanvasWrapper";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: canvas, error } = await supabase
    .from("canvases")
    .select("id, title, nodes, edges")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !canvas) redirect("/dashboard");

  return (
    <main className="w-screen h-screen overflow-hidden bg-canvas">
      <CanvasWrapper canvas={canvas} />
    </main>
  );
}
