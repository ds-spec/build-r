import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: canvases } = await supabase
    .from("canvases")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });

  return <DashboardClient user={user} canvases={canvases ?? []} />;
}
