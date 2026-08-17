import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = { id: string; display_name: string; avatar_url: string | null; status: "pending" | "approved" | "rejected"; role: "admin" | "member"; xp: number; level: number };
export async function getViewer() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null as Profile | null, supabase };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { user, profile: profile as Profile | null, supabase };
}
export async function requireApproved() { const viewer = await getViewer(); if (!viewer.user) redirect("/login"); if (viewer.profile?.status !== "approved") redirect("/pending"); return viewer as typeof viewer & { user: NonNullable<typeof viewer.user>; profile: Profile }; }
export async function requireAdmin() { const viewer = await requireApproved(); if (viewer.profile.role !== "admin") redirect("/dashboard"); return viewer; }
