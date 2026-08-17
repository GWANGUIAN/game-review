import type { Metadata } from "next"; import "./globals.css"; import { ThemeProvider } from "@/components/theme-provider"; import { Toaster } from "sonner";
export const metadata: Metadata = { title: "Party Clear | Game Session Archive", description: "게임 모임의 플레이 기록과 리뷰 아카이브" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko" suppressHydrationWarning><body><ThemeProvider>{children}<Toaster richColors position="top-center" /></ThemeProvider></body></html>; }
