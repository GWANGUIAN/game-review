import Link from "next/link";
import { CircleAlert, Clock3 } from "lucide-react";

import { getViewer } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function PendingPage() {
  const { profile } = await getViewer();
  const rejected = profile?.status === "rejected";

  return (
    <main className="flex flex-1 items-center justify-center p-4 py-16">
      <div className="w-full max-w-sm border border-border p-8 text-center">
        <div
          className={`mx-auto grid h-11 w-11 place-items-center border ${
            rejected ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary"
          }`}
        >
          {rejected ? <CircleAlert size={20} /> : <Clock3 size={20} />}
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Membership status</p>
        <h1 className="mt-2 text-xl font-bold text-foreground">{rejected ? "가입이 거절되었습니다" : "승인 대기 중입니다"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {rejected ? "관리자에게 문의해 주세요." : "관리자가 승인하면 바로 동아리 활동에 참여할 수 있습니다."}
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/">아카이브로 돌아가기</Link>
        </Button>
      </div>
    </main>
  );
}
