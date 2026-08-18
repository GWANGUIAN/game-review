import Link from "next/link";

import { requireApproved } from "@/lib/auth";
import { kstDate, minutesLabel, priceLabel } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function SessionsPage() {
  const { supabase } = await requireApproved();
  const { data } = await supabase
    .from("play_sessions")
    .select("id,starts_at,total_play_minutes,memo,games(name,cover_url,price_krw)")
    .order("starts_at", { ascending: false });

  return (
    <>
      <PageHeader
        eyebrow="Session log"
        title="플레이 세션"
        action={
          <Button asChild>
            <Link href="/session/new">새 세션</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((s) => {
          const game = s.games as unknown as { name: string; cover_url: string | null; price_krw: number | null } | null;
          return (
            <Link href={`/session/${s.id}`} key={s.id} className="group">
              <Card className="h-full overflow-hidden p-0 transition-colors hover:border-foreground/30">
                <div className="relative h-32 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-muted bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={game?.cover_url ? { backgroundImage: `url(${game.cover_url})` } : undefined}
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-foreground">{game?.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.starts_at && kstDate(s.starts_at)} · {minutesLabel(s.total_play_minutes ?? 0)} · {priceLabel(game?.price_krw)}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      {!data?.length && <Card className="p-10 text-center text-sm text-muted-foreground">아직 등록된 세션이 없습니다.</Card>}
    </>
  );
}
