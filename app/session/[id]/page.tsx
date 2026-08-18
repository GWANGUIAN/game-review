import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, LockKeyhole, Star } from "lucide-react";

import { getViewer } from "@/lib/auth";
import { kstDate, minutesLabel, priceLabel } from "@/lib/utils";
import { ReviewForm } from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getViewer();
  const { data: session, error } = await supabase
    .from("play_sessions")
    .select(
      "*,games(name,cover_url,price_krw),session_play_blocks(*),session_participants(profile_id,profiles(display_name,avatar_url)),reviews(*,profiles(display_name,avatar_url))"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("Session lookup failed", { id, message: error.message });
  if (!session) notFound();

  const approved = profile?.status === "approved";
  const participants = session.session_participants ?? [];
  const joined = !!user && participants.some((p: { profile_id: string }) => p.profile_id === user.id);
  const ownReview = user ? session.reviews?.find((r: { profile_id: string }) => r.profile_id === user.id) : undefined;
  const canEdit = !!user && approved && (session.created_by === user.id || profile.role === "admin");
  const game = session.games as unknown as { name: string; cover_url: string | null; price_krw: number | null };

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft size={16} /> 아카이브
      </Link>

      <div>
        <div
          className="h-52 border border-border bg-muted bg-cover bg-center"
          style={
            session.cover_url || game.cover_url
              ? { backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.6), transparent), url(${session.cover_url || game.cover_url})` }
              : undefined
          }
        />
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {minutesLabel(session.total_play_minutes ?? 0)} · {priceLabel(game.price_krw)}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-foreground">{game.name}</h1>
          </div>
          {canEdit && (
            <Button asChild variant="outline">
              <Link href={`/session/${id}/edit`}>수정</Link>
            </Button>
          )}
        </div>
        <p className="mt-3 leading-7 text-muted-foreground">{session.memo}</p>
      </div>

      <div className="border-t border-border pt-6">
        <p className="text-sm font-semibold text-primary">Session timeline</p>
        <h2 className="mt-1 font-bold text-foreground">플레이 타임라인</h2>
        <div className="mt-4 space-y-2">
          {session.session_play_blocks
            ?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
            .map((b: { id: string; started_at: string; ended_at: string }) => (
              <p key={b.id} className="border-l-2 border-primary bg-muted/50 p-3 text-sm text-foreground">
                {kstDate(b.started_at)} — {kstDate(b.ended_at)}
              </p>
            ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          참가자: {participants.map((p: { profiles: { display_name: string } | null }) => p.profiles?.display_name).join(", ")}
        </p>
      </div>

      {joined && approved ? (
        <div className="border-t border-border pt-6">
          <ReviewForm sessionId={id} existing={ownReview} />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 border-t border-border py-6 text-center text-sm text-muted-foreground">
          <LockKeyhole className="text-primary" size={16} />
          리뷰 작성은 승인된 참가자만 할 수 있습니다.
        </div>
      )}

      <section className="border-t border-border pt-6">
        <p className="text-sm font-semibold text-primary">Player notes</p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">모두의 리뷰</h2>
        <div className="mt-4 divide-y divide-border">
          {session.reviews?.map(
            (review: {
              id: string;
              rating: number;
              content: string;
              recommended: boolean;
              tags: string[];
              profiles: { display_name: string; avatar_url: string | null } | null;
            }) => (
              <div className="py-5" key={review.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={review.profiles?.avatar_url ?? undefined} alt="" />
                      <AvatarFallback>{review.profiles?.display_name?.slice(0, 2) ?? "?"}</AvatarFallback>
                    </Avatar>
                    <strong className="text-foreground">{review.profiles?.display_name}</strong>
                  </div>
                  <span className="flex shrink-0 items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                  </span>
                </div>
                <p className="mt-3 leading-7 text-foreground">{review.content}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {review.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
