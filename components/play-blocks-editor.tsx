"use client";

import { Plus, Trash2 } from "lucide-react";

import { minutesLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PlayBlock = { startedAt: string; endedAt: string };

const initial = () => {
  const day = new Date().toISOString().slice(0, 10);
  return { startedAt: `${day}T19:00`, endedAt: `${day}T22:00` };
};

export function PlayBlocksEditor({ value, onChange }: { value: PlayBlock[]; onChange: (blocks: PlayBlock[]) => void }) {
  const minutes = value.reduce(
    (total, b) => total + Math.max(0, (new Date(b.endedAt).getTime() - new Date(b.startedAt).getTime()) / 60000),
    0
  );

  function update(index: number, key: keyof PlayBlock, text: string) {
    const next = [...value];
    next[index] = { ...next[index], [key]: text };
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>플레이 일정</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, initial()])}>
          <Plus size={14} /> 블록 추가
        </Button>
      </div>
      {value.map((block, index) => {
        const duration = new Date(block.endedAt).getTime() - new Date(block.startedAt).getTime();
        return (
          <div className="rounded-lg border border-border p-3" key={index}>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input type="datetime-local" value={block.startedAt} onChange={(e) => update(index, "startedAt", e.target.value)} />
              <Input type="datetime-local" value={block.endedAt} onChange={(e) => update(index, "endedAt", e.target.value)} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className={duration <= 0 ? "text-destructive" : ""}>
                {duration > 0 ? minutesLabel(Math.round(duration / 60000)) : "종료 시간이 시작 시간보다 빨라야 합니다"}
              </span>
              {value.length > 1 && (
                <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label="블록 삭제">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        );
      })}
      <p className="rounded-lg bg-primary/10 p-3 text-sm font-bold text-primary">
        총 {minutesLabel(Math.round(minutes))} · {value.length}일
      </p>
    </div>
  );
}
