import Link from "next/link";

import { requireApproved } from "@/lib/auth";
import { minutesLabel, kstDate, priceLabel } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function Dashboard() {
  const { supabase, user } = await requireApproved();
  const [{ data: sessions }, { data: reviews }] = await Promise.all([
    supabase
      .from("play_sessions")
      .select("id,memo,total_play_minutes,starts_at,games(name,cover_url,price_krw),session_participants(profile_id)")
      .order("starts_at", { ascending: false })
      .limit(6),
    supabase.from("reviews").select("session_id").eq("profile_id", user.id),
  ]);
  const reviewed = new Set(reviews?.map((x) => x.session_id));

  return (
    <>
      <PageHeader
        eyebrow="Member dashboard"
        title="다음 플레이를 기록해요."
        action={
          <Button asChild>
            <Link href="/session/new">+ 새 세션 만들기</Link>
          </Button>
        }
      />
      {sessions?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => {
            const game = session.games as unknown as { name: string; cover_url: string | null; price_krw: number | null } | null;
            const joined = (session.session_participants ?? []).some((p: { profile_id: string }) => p.profile_id === user.id);
            return (
              <Link href={`/session/${session.id}`} key={session.id}>
                <Card className="h-full p-5 transition-shadow hover:shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {session.starts_at ? kstDate(session.starts_at) : "일정 미정"}
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold text-foreground">{game?.name ?? "알 수 없는 게임"}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {minutesLabel(session.total_play_minutes ?? 0)} · {priceLabel(game?.price_krw)} · {session.memo || "플레이 기록"}
                  </p>
                  {joined && !reviewed.has(session.id) && (
                    <Badge variant="warning" className="mt-3">
                      리뷰를 남겨 주세요
                    </Badge>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="p-10 text-center text-sm text-muted-foreground">아직 세션이 없어요. 첫 플레이를 기록해 보세요.</Card>
      )}
    </>
  );
}
