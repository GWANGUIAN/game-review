"use client";
import { useTheme } from "next-themes";
export function ThemeToggle() { const { resolvedTheme, setTheme } = useTheme(); return <button aria-label="테마 전환" className="pixel-icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? "LT" : "DK"}</button>; }
