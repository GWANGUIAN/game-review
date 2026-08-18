import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const flowId = request.nextUrl.searchParams.get("sb_flow_id");
  const origin = request.nextUrl.origin;
  if (!code) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (error || !data.user) {
    console.error("OAuth session exchange failed", {
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const email = data.user.email?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (email && adminEmail && email === adminEmail) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Admin promotion skipped: SUPABASE_SERVICE_ROLE_KEY is not set");
    } else {
      const admin = createAdminClient();
      await admin.auth.admin.updateUserById(data.user.id, {
        app_metadata: { ...data.user.app_metadata, role: "admin" },
      });
      await admin.from("profiles").update({ status: "approved", role: "admin" }).eq("id", data.user.id);
    }
  } else if (email && adminEmail) {
    console.error("Admin promotion skipped: email mismatch", { loginEmail: email, adminEmailLength: adminEmail.length });
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
