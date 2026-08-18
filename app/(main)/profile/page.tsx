"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const client = createClient();
    client.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: profile } = await client
        .from("profiles")
        .select("display_name,avatar_url,xp,level")
        .eq("id", data.user.id)
        .single();
      if (profile) {
        setName(profile.display_name);
        setAvatar(profile.avatar_url ?? "");
        setXp(profile.xp);
        setLevel(profile.level);
      }
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const client = createClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) return;
    let avatarUrl = avatar || null;
    if (file) {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await client.storage.from("avatars").upload(path, file);
      if (error) return toast.error(error.message);
      avatarUrl = client.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await client.from("profiles").update({ display_name: name, avatar_url: avatarUrl }).eq("id", user.id);
    error ? toast.error(error.message) : toast.success("프로필을 저장했습니다.");
  }

  return (
    <>
      <PageHeader eyebrow="Member profile" title="내 프로필" />
      <div className="grid gap-8 md:grid-cols-2">
        <form onSubmit={save} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar || undefined} alt="" />
              <AvatarFallback>{name.slice(0, 2) || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="display-name">닉네임</Label>
              <Input id="display-name" minLength={2} maxLength={24} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatar-file">아바타 업로드</Label>
            <Input id="avatar-file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatar-url">또는 아바타 이미지 URL</Label>
            <Input id="avatar-url" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="Supabase Storage URL" />
          </div>
          <Button type="submit" className="w-full">
            저장
          </Button>
        </form>
        <div>
          <p className="text-sm font-semibold text-primary">Level {level}</p>
          <h2 className="mt-1 text-3xl font-bold tabular-nums text-foreground">{xp} XP</h2>
          <Progress value={xp % 100} className="mt-4" />
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="font-bold text-foreground">트로피 케이스</h3>
            <div className="mt-3 flex gap-3 text-4xl">
              <span title="첫 발자국">🏅</span>
              <span className={xp >= 250 ? "" : "opacity-25 grayscale"}>🏆</span>
              <span className={xp >= 500 ? "" : "opacity-25 grayscale"}>👑</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
