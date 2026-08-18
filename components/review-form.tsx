"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ReviewForm({
  sessionId,
  existing,
}: {
  sessionId: string;
  existing?: { id: string; rating: number; content: string; recommended: boolean; tags: string[] };
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [content, setContent] = useState(existing?.content ?? "");
  const [recommended, setRecommended] = useState(existing?.recommended ?? true);
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const options = ["재미", "스토리", "멀티", "버그", "명작", "노잼"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || !content.trim()) return toast.error("별점과 리뷰 내용을 입력하세요.");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const image_urls: string[] = [];
    for (const file of files) {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("review-images").upload(path, file);
      if (error) return toast.error(error.message);
      const { data } = supabase.storage.from("review-images").getPublicUrl(path);
      image_urls.push(data.publicUrl);
    }
    const values = { session_id: sessionId, profile_id: user.id, rating, content, recommended, tags, image_urls };
    const { error } = existing
      ? await supabase.from("reviews").update(values).eq("id", existing.id)
      : await supabase.from("reviews").insert(values);
    if (error) toast.error(error.message);
    else {
      toast.success("리뷰를 저장했습니다.");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="border-b border-border pb-3">
        <p className="text-sm font-semibold text-primary">Review editor</p>
        <h2 className="mt-1 text-xl font-bold text-foreground">내 리뷰</h2>
      </div>
      <div>
        <Label>별점</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" aria-label={`${n}점`} onClick={() => setRating(n)} className="p-0.5" key={n}>
              <Star className={`h-7 w-7 transition-colors ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant={recommended ? "default" : "outline"} onClick={() => setRecommended(true)}>
          추천
        </Button>
        <Button type="button" size="sm" variant={!recommended ? "default" : "outline"} onClick={() => setRecommended(false)}>
          비추천
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => (
          <button
            type="button"
            key={tag}
            onClick={() => setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]))}
          >
            <Badge variant={tags.includes(tag) ? "default" : "outline"} className="cursor-pointer transition-colors">
              #{tag}
            </Badge>
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="review-images">스크린샷 (최대 3장)</Label>
        <input
          id="review-images"
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 3))}
        />
      </div>
      <Textarea
        className="min-h-32"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="플레이 경험을 공유해 주세요."
      />
      <Button type="submit" className="w-full">
        리뷰 저장
      </Button>
    </form>
  );
}
