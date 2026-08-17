import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;
  if (!code) return NextResponse.redirect(`${origin}/login`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("OAuth session exchange failed", {
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const email = data.user.email?.toLowerCase();
  if (email && email === process.env.ADMIN_EMAIL?.toLowerCase() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: { ...data.user.app_metadata, role: "admin" },
    });
    await admin.from("profiles").update({ status: "approved", role: "admin" }).eq("id", data.user.id);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
