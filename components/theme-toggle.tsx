"use client";
import { Moon, Sun } from "lucide-react"; import { useTheme } from "next-themes";
export function ThemeToggle() { const { resolvedTheme, setTheme } = useTheme(); return <button aria-label="테마 전환" className="border border-white/15 p-2 transition hover:border-steam-blue" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? <Sun size={17}/> : <Moon size={17}/>}</button>; }
