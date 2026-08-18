"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type GameChoice = { id?: string; name: string; coverUrl: string | null; source: "rawg" | "steam" | "custom"; externalId?: string };

export function GameSearch({ value, onChange }: { value: GameChoice | null; onChange: (game: GameChoice) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GameChoice[]>([]);

  async function search() {
    const result = await fetch(`/api/games/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
    setResults(result.games);
  }

  return (
    <div className="space-y-2">
      <Label>게임</Label>
      {value ? (
        <button
          type="button"
          onClick={() => onChange({ name: "", coverUrl: null, source: "custom" })}
          className="flex w-full items-center gap-3 rounded-lg border border-input bg-background p-2 text-left text-sm transition-colors hover:bg-accent"
        >
          <span
            className="h-10 w-16 shrink-0 rounded-md bg-muted bg-cover bg-center"
            style={value.coverUrl ? { backgroundImage: `url(${value.coverUrl})` } : undefined}
          />
          <span className="font-medium text-foreground">{value.name}</span>
        </button>
      ) : (
        <>
          <div className="flex gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), search())}
              placeholder="게임 이름 검색"
            />
            <Button type="button" size="icon" onClick={search} aria-label="검색">
              <Search size={17} />
            </Button>
          </div>
          {results.length > 0 && (
            <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-border p-1">
              {results.map((game) => (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors hover:bg-accent"
                  key={`${game.source}-${game.externalId}`}
                  onClick={() => onChange(game)}
                >
                  <span
                    className="h-8 w-12 shrink-0 rounded bg-muted bg-cover bg-center"
                    style={game.coverUrl ? { backgroundImage: `url(${game.coverUrl})` } : undefined}
                  />
                  <span className="text-foreground">{game.name}</span>
                </button>
              ))}
            </div>
          )}
          <Input
            placeholder="또는 직접 게임 이름 입력"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={() => q && !results.length && onChange({ name: q, coverUrl: null, source: "custom" })}
          />
        </>
      )}
    </div>
  );
}
