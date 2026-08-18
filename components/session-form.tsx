"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { GameSearch, type GameChoice } from "./game-search";
import { PlayBlocksEditor, type PlayBlock } from "./play-blocks-editor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Member = { id: string; display_name: string };
type Existing = {
  id: string;
  memo: string | null;
  cover_url: string | null;
  game: { id: string; name: string; cover_url: string | null; source: "rawg" | "steam" | "custom"; external_id: string | null; price_krw: number | null };
  blocks: { started_at: string; ended_at: string }[];
  participantIds: string[];
};
type PriceStatus = "free" | "paid";

export function SessionForm({ members, session }: { members: Member[]; session?: Existing }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [game, setGame] = useState<GameChoice | null>(
    session
      ? {
          id: session.game.id,
          name: session.game.name,
          coverUrl: session.game.cover_url,
          source: session.game.source,
          externalId: session.game.external_id ?? undefined,
        }
      : null
  );
  const [priceStatus, setPriceStatus] = useState<PriceStatus>(session?.game.price_krw && session.game.price_krw > 0 ? "paid" : "free");
  const [price, setPrice] = useState(session?.game.price_krw && session.game.price_krw > 0 ? String(session.game.price_krw) : "");
  const [memo, setMemo] = useState(session?.memo ?? "");
  const [cover, setCover] = useState(session?.cover_url ?? "");
  const [blocks, setBlocks] = useState<PlayBlock[]>(
    session?.blocks.map((b) => ({ startedAt: b.started_at.slice(0, 16), endedAt: b.ended_at.slice(0, 16) })) ?? [
      { startedAt: new Date().toISOString().slice(0, 10) + "T19:00", endedAt: new Date().toISOString().slice(0, 10) + "T22:00" },
    ]
  );
  const [participants, setParticipants] = useState<string[]>(session?.participantIds ?? []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!game?.name) return toast.error("게임을 선택하거나 입력하세요.");
    const priceKrw = priceStatus === "free" ? 0 : Number(price);
    if (priceStatus === "paid" && (!Number.isInteger(priceKrw) || priceKrw <= 0)) return toast.error("유료 게임의 가격을 원 단위로 입력하세요.");
    if (blocks.some((b) => new Date(b.endedAt) <= new Date(b.startedAt))) return toast.error("모든 종료 시간은 시작 시간 뒤여야 합니다.");
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    let gameId = game.id;
    if (!gameId) {
      const { data, error } = await supabase
        .from("games")
        .upsert(
          { name: game.name, cover_url: game.coverUrl, source: game.source, external_id: game.externalId ?? null, price_krw: priceKrw },
          { onConflict: "source,external_id", ignoreDuplicates: false }
        )
        .select("id")
        .single();
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      gameId = data.id;
    } else {
      const { error } = await supabase.from("games").update({ price_krw: priceKrw }).eq("id", gameId);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    }

    const payload = { game_id: gameId, memo: memo || null, cover_url: cover || game.coverUrl || null, created_by: user.id };
    const result = session
      ? await supabase.from("play_sessions").update(payload).eq("id", session.id).select("id").single()
      : await supabase.from("play_sessions").insert(payload).select("id").single();
    if (result.error || !result.data) {
      toast.error(result.error?.message ?? "저장하지 못했습니다.");
      setSaving(false);
      return;
    }
    const id = result.data.id;

    if (session) await Promise.all([supabase.from("session_play_blocks").delete().eq("session_id", id), supabase.from("session_participants").delete().eq("session_id", id)]);
    const { error } = await supabase
      .from("session_play_blocks")
      .insert(blocks.map((b, sort_order) => ({ session_id: id, started_at: new Date(b.startedAt).toISOString(), ended_at: new Date(b.endedAt).toISOString(), sort_order })));
    if (!error) await supabase.from("session_participants").insert([...new Set([...participants, user.id])].map((profile_id) => ({ session_id: id, profile_id })));
    if (error) toast.error(error.message);
    else {
      toast.success("세션을 저장했습니다.");
      router.push(`/session/${id}`);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-2xl">
      <Card className="space-y-6 p-6">
        <div className="border-b border-border pb-4">
          <p className="text-sm font-semibold text-primary">Session editor</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">{session ? "세션 수정" : "새 플레이 세션"}</h1>
        </div>

        <GameSearch
          value={game}
          onChange={(next) => {
            setGame(next);
            if (!next.id) {
              setPriceStatus("free");
              setPrice("");
            }
          }}
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">게임 가격</legend>
          <div className="grid grid-cols-2 gap-2">
            {([["free", "무료"], ["paid", "유료"]] as const).map(([value, label]) => (
              <Button type="button" key={value} variant={priceStatus === value ? "default" : "outline"} onClick={() => setPriceStatus(value)}>
                {label}
              </Button>
            ))}
          </div>
          {priceStatus === "paid" && (
            <div className="space-y-1.5">
              <Label htmlFor="price">정가 (원)</Label>
              <Input
                id="price"
                inputMode="numeric"
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="예: 59000"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">가격은 게임 정보로 저장되며, 할인가는 별도로 관리하지 않습니다.</p>
        </fieldset>

        <PlayBlocksEditor value={blocks} onChange={setBlocks} />

        <div className="space-y-1.5">
          <Label htmlFor="cover">커버 이미지 URL</Label>
          <Input id="cover" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="게임 이미지 URL 또는 Storage URL" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="memo">메모</Label>
          <Textarea id="memo" className="min-h-24" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="이번 플레이는 어땠나요?" />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">참가자</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {members.map((member) => (
              <label
                className="flex items-center gap-2 rounded-lg border border-input p-2 text-sm text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                key={member.id}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-primary"
                  checked={participants.includes(member.id)}
                  onChange={() => setParticipants((x) => (x.includes(member.id) ? x.filter((id) => id !== member.id) : [...x, member.id]))}
                />
                {member.display_name}
              </label>
            ))}
          </div>
        </fieldset>

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? "저장 중..." : "세션 저장"}
        </Button>
      </Card>
    </form>
  );
}
