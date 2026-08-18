"use client";

import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <Gamepad2 size={20} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Game club access</p>
            <h1 className="mt-0.5 text-xl font-bold text-foreground">종합 게임 동아리</h1>
          </div>
        </div>
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          Google 계정으로 로그인하세요. 신규 멤버는 관리자 승인 후 동아리 활동에 참여할 수 있습니다.
        </p>
        <Button onClick={signIn} disabled={loading} className="mt-7 w-full" size="lg">
          {loading ? "연결 중..." : "Google로 계속하기"}
        </Button>
      </div>
    </main>
  );
}
