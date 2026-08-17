"use client";
import { Moon, Sun } from "lucide-react"; import { useTheme } from "next-themes";
export function ThemeToggle() { const { resolvedTheme, setTheme } = useTheme(); return <button aria-label="테마 전환" className="btn-quiet p-2" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? <Sun size={17}/> : <Moon size={17}/>}</button>; }
