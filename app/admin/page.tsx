import { requireAdmin } from "@/lib/auth";
import { AdminMembers } from "@/components/admin-members";
import { PageHeader } from "@/components/page-header";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const { data: members } = await supabase.from("profiles").select("id,display_name,avatar_url,status,role").order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <PageHeader eyebrow="Club operations" title="관리자 패널" />
      <AdminMembers initial={members ?? []} />
    </main>
  );
}
