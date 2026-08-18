import Link from "next/link";
import { Gamepad2, Clock, MessageSquare, Users, Star, Trophy } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { kstDate, minutesLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Game = { name: string; cover_url: string | null } | null;
type Session = {
  id: string;
  starts_at: string | null;
  total_play_minutes: number | null;
  memo: string | null;
  games: Game;
};
type Profile = { display_name: string; avatar_url: string | null } | null;
type Review = {
  id: string;
  rating: number;
  content: string;
  session_id: string;
  games: Game;
  profiles: Profile;
};
type ReviewRow = Omit<Review, "games" | "profiles"> & {
  profiles: Profile | Profile[] | null;
  play_sessions: { games: Game | Game[] } | { games: Game | Game[] }[] | null;
};
type RankingRow = {
  profile_id: string;
  profiles: Profile | Profile[] | null;
  play_sessions: { total_play_minutes: number | null } | { total_play_minutes: number | null }[] | null;
};
type RankedMember = { profileId: string; displayName: string; avatarUrl: string | null; totalMinutes: number };

const one = <T,>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? value[0] ?? null : value ?? null;

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: sessions },
    { data: reviews },
    { count: gameCount },
    { count: reviewCount },
    { count: memberCount },
    { data: playMinutesRows },
    { data: participantRows },
  ] = await Promise.all([
    supabase
      .from("play_sessions")
      .select("id,starts_at,total_play_minutes,memo,games(name,cover_url)")
      .order("starts_at", { ascending: false })
      .limit(10),
    supabase
      .from("reviews")
      .select("id,rating,content,session_id,profiles!profile_id(display_name,avatar_url),play_sessions!inner(games(name,cover_url))")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("games").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("play_sessions").select("total_play_minutes"),
    supabase.from("session_participants").select("profile_id,profiles(display_name,avatar_url),play_sessions(total_play_minutes)"),
  ]);

  const latestSessions = (sessions ?? []).map((session) => ({
    ...session,
    games: one(session.games),
  })) as unknown as Session[];

  const latestReviews = ((reviews ?? []) as unknown as ReviewRow[]).map((review) => {
    const session = one(review.play_sessions);
    return {
      ...review,
      profiles: one(review.profiles),
      games: one(session?.games ?? null),
    };
  }) as Review[];

  const totalMinutes = (playMinutesRows ?? []).reduce((sum, row) => sum + (row.total_play_minutes ?? 0), 0);

  const rankingMap = new Map<string, RankedMember>();
  for (const row of (participantRows ?? []) as unknown as RankingRow[]) {
    const profile = one(row.profiles);
    const session = one(row.play_sessions);
    if (!profile) continue;
    const existing = rankingMap.get(row.profile_id);
    const minutes = session?.total_play_minutes ?? 0;
    if (existing) {
      existing.totalMinutes += minutes;
    } else {
      rankingMap.set(row.profile_id, {
        profileId: row.profile_id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        totalMinutes: minutes,
      });
    }
  }
  const ranking = Array.from(rankingMap.values())
    .filter((member) => member.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 5);
  const topMinutes = ranking[0]?.totalMinutes ?? 1;

  const heroSession = latestSessions[0];
  const rankColors = ["bg-amber-400 text-amber-950", "bg-zinc-300 text-zinc-800", "bg-orange-400 text-orange-950"];

  const stats = [
    { label: "등록 게임", value: `${gameCount ?? 0}종`, icon: Gamepad2 },
    { label: "총 플레이 시간", value: minutesLabel(totalMinutes), icon: Clock },
    { label: "누적 리뷰", value: `${reviewCount ?? 0}개`, icon: MessageSquare },
    { label: "활동 멤버", value: `${memberCount ?? 0}명`, icon: Users },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      {/* 히어로 */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative flex aspect-[4/3] flex-col justify-end overflow-hidden border border-border p-8">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/brand/banner.webp)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
          <div className="relative z-10">
            <p className="text-sm font-semibold text-white/90">Game Club Archive</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">모임에 참여하기</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                <Link href="/sessions">세션 둘러보기</Link>
              </Button>
            </div>
          </div>
        </div>

        <Link
          href={heroSession ? `/session/${heroSession.id}` : "/sessions"}
          className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden border border-border p-5"
        >
          <div
            className="absolute inset-0 bg-muted bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={heroSession?.games?.cover_url ? { backgroundImage: `url(${heroSession.games.cover_url})` } : undefined}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="relative z-10">
            <p className="text-xs font-medium uppercase tracking-wide text-white/70">최신 세션</p>
            <p className="mt-1 text-lg font-bold text-white transition-transform group-hover:translate-x-0.5">
              {heroSession?.games?.name ?? "아직 세션이 없어요"}
            </p>
          </div>
        </Link>
      </section>

      {/* 요약 통계 칩 */}
      <div className="mt-6 flex flex-wrap gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="inline-flex items-center gap-2 border border-border px-3.5 py-1.5 text-sm">
            <stat.icon className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold tabular-nums text-foreground">{stat.value}</span>
            <span className="text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* 하단: 좌 세션 리스트 / 우 랭킹·리뷰 */}
      <section className="mt-16 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-foreground">최근 세션</h2>
          <div className="mt-5 divide-y divide-border border-t border-border">
            {latestSessions.length ? (
              latestSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/session/${session.id}`}
                  className="flex items-center gap-4 py-4 transition-colors hover:bg-accent/40"
                >
                  <div
                    className="h-14 w-20 shrink-0 border border-border bg-muted bg-cover bg-center"
                    style={session.games?.cover_url ? { backgroundImage: `url(${session.games.cover_url})` } : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{session.games?.name ?? "알 수 없는 게임"}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {session.starts_at ? kstDate(session.starts_at) : "날짜 미정"} · {minutesLabel(session.total_play_minutes ?? 0)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">아직 공개된 플레이 세션이 없습니다.</p>
            )}
          </div>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/sessions">더보기</Link>
          </Button>
        </div>

        <div className="space-y-10 lg:col-span-1">
          {/* 플레이 시간 랭킹 */}
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-foreground">플레이 시간 랭킹</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">TOP 5</p>
            <div className="mt-4 divide-y divide-border border-t border-border">
              {ranking.length ? (
                ranking.map((member, index) => (
                  <div key={member.profileId} className="flex items-center gap-3 py-3.5 transition-colors hover:bg-accent/40">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        rankColors[index] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={member.avatarUrl ?? undefined} alt="" />
                      <AvatarFallback>{member.displayName.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{member.displayName}</p>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-500"
                          style={{ width: `${Math.max(6, (member.totalMinutes / topMinutes) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                      {minutesLabel(member.totalMinutes)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">아직 집계된 플레이 기록이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 최근 리뷰 */}
          <div>
            <h2 className="text-lg font-bold text-foreground">최근 리뷰</h2>
            <div className="mt-4 divide-y divide-border border-t border-border">
              {latestReviews.length ? (
                latestReviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/session/${review.session_id}`}
                    className="block py-4 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={review.profiles?.avatar_url ?? undefined} alt="" />
                        <AvatarFallback>{review.profiles?.display_name?.slice(0, 2) ?? "?"}</AvatarFallback>
                      </Avatar>
                      <p className="truncate text-sm font-semibold text-foreground">
                        {review.profiles?.display_name ?? "익명"}
                      </p>
                      <span className="ml-auto flex shrink-0 items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{review.content}</p>
                  </Link>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">아직 작성된 리뷰가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
