import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { getViewer } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";

export async function SiteHeader() {
  const { user, profile } = await getViewer();

  const navLinks =
    profile?.status === "approved"
      ? [
          { href: "/dashboard", label: "대시보드" },
          { href: "/sessions", label: "세션" },
          { href: "/stats", label: "통계" },
        ]
      : [];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link className="flex items-center gap-2.5 font-semibold text-foreground" href="/">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-primary/10">
            <Image src="/brand/gamepad-48.png" alt="" width={22} height={22} priority />
          </span>
          <span className="text-sm sm:text-base">종합 게임 동아리</span>
        </Link>

        <div className="flex items-center gap-1">
          <div className="mr-2 hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            {profile?.role === "admin" && (
              <Link href="/admin">
                <Badge variant="outline" className="ml-1 cursor-pointer">
                  관리자
                </Badge>
              </Link>
            )}
          </div>

          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              <Button asChild variant="secondary" size="sm">
                <Link href="/profile">{profile?.display_name ?? "프로필"}</Link>
              </Button>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="ghost" size="icon" aria-label="로그아웃">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ) : (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/login">로그인</Link>
            </Button>
          )}

          <ThemeToggle />

          <MobileNav
            links={navLinks}
            isAdmin={profile?.role === "admin"}
            authHref={user ? "/profile" : "/login"}
            authLabel={user ? (profile?.display_name ?? "프로필") : "로그인"}
            signedIn={!!user}
          />
        </div>
      </nav>
    </header>
  );
}
