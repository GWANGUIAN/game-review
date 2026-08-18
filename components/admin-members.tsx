"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Member = { id: string; display_name: string; avatar_url: string | null; status: "pending" | "approved" | "rejected"; role: string };

const statusLabel: Record<Member["status"], string> = { pending: "대기", approved: "승인", rejected: "거절" };
const statusVariant: Record<Member["status"], "warning" | "success" | "destructive"> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

function MemberRow({ member, onStatusChange }: { member: Member; onStatusChange: (id: string, status: Member["status"]) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3 transition-colors hover:bg-accent/40">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={member.avatar_url ?? undefined} alt="" />
          <AvatarFallback>{member.display_name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{member.display_name}</p>
          <p className="text-xs text-muted-foreground">{member.role}</p>
        </div>
        <Badge variant={statusVariant[member.status]}>{statusLabel[member.status]}</Badge>
      </div>
      <div className="flex gap-2">
        {member.status !== "approved" && (
          <Button size="sm" onClick={() => onStatusChange(member.id, "approved")}>
            승인
          </Button>
        )}
        {member.status !== "rejected" && (
          <Button size="sm" variant="outline" onClick={() => onStatusChange(member.id, "rejected")}>
            거절
          </Button>
        )}
      </div>
    </div>
  );
}

export function AdminMembers({ initial }: { initial: Member[] }) {
  const router = useRouter();

  async function setStatus(id: string, status: Member["status"]) {
    const response = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) toast.error("멤버 상태를 변경하지 못했습니다.");
    else {
      toast.success("멤버 상태를 변경했습니다.");
      router.refresh();
    }
  }

  const pending = initial.filter((m) => m.status === "pending");

  return (
    <div>
      <p className="text-sm font-semibold text-primary">Member directory</p>
      <h2 className="mt-1 text-xl font-bold text-foreground">멤버 관리</h2>

      <Tabs defaultValue={pending.length ? "pending" : "all"} className="mt-4">
        <TabsList>
          <TabsTrigger value="pending">대기 중{pending.length > 0 ? ` (${pending.length})` : ""}</TabsTrigger>
          <TabsTrigger value="all">전체 멤버 ({initial.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <div className="divide-y divide-border border-t border-border">
            {pending.length ? (
              pending.map((member) => <MemberRow key={member.id} member={member} onStatusChange={setStatus} />)
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">대기 중인 멤버가 없습니다.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="all">
          <div className="divide-y divide-border border-t border-border">
            {initial.map((member) => (
              <MemberRow key={member.id} member={member} onStatusChange={setStatus} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
