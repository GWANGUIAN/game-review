import { SiteHeader } from "@/components/site-header"; import { requireApproved } from "@/lib/auth";
export default async function MainLayout({ children }: { children: React.ReactNode }) { await requireApproved(); return <><SiteHeader/><main className="mx-auto max-w-6xl px-4 py-8">{children}</main></>; }
