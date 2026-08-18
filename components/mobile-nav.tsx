"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  isAdmin,
  authHref,
  authLabel,
}: {
  links: NavLink[];
  isAdmin: boolean;
  authHref: string;
  authLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="메뉴 열기">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              관리자
            </Link>
          )}
          <Link
            href={authHref}
            onClick={() => setOpen(false)}
            className="mt-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {authLabel}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
