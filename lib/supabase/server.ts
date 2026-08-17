import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createClient() {
  const store = await cookies();
  type CookieToSet = { name: string; value: string; options?: Parameters<typeof store.set>[2] };
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookieEncoding: "base64url", cookies: { getAll: () => store.getAll(), setAll: (items: CookieToSet[]) => { try { items.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {} } } });
}
