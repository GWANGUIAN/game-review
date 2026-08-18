import { Star } from "lucide-react";

import { requireApproved } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function StatsPage() {
  const { supabase } = await requireApproved();
  const { data: reviews } = await supabase.from("reviews").select("rating,tags,profiles(display_name)");
  const average = reviews?.length ? (reviews.reduce((n, r) => n + r.rating, 0) / reviews.length).toFixed(1) : "–";
  const counts = new Map<string, number>();
  reviews?.forEach((r) => r.tags?.forEach((tag: string) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
  const sortedTags = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader eyebrow="Club records" title="모임 통계" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">평균 별점</p>
          <p className="mt-2 flex items-center gap-2 text-5xl font-bold tabular-nums text-foreground">
            {average}
            <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground">리뷰 수</p>
          <p className="mt-2 text-5xl font-bold tabular-nums text-foreground">{reviews?.length ?? 0}</p>
        </Card>
      </div>
      <Card className="mt-4 p-6">
        <p className="text-sm font-semibold text-primary">Popular tags</p>
        <h2 className="mt-1 font-bold text-foreground">인기 태그</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {sortedTags.length ? (
            sortedTags.map(([tag, count]) => (
              <Badge key={tag} variant="secondary">
                #{tag} {count}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">아직 태그가 없어요.</p>
          )}
        </div>
      </Card>
    </>
  );
}
