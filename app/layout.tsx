import type { Metadata } from "next"; import "./globals.css"; import { ThemeProvider } from "@/components/theme-provider"; import { Toaster } from "sonner";
export const metadata: Metadata = { title: "Party Clear", description: "우리 모임의 게임 플레이와 리뷰" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko" suppressHydrationWarning><body><ThemeProvider>{children}<Toaster richColors position="top-center" /></ThemeProvider></body></html>; }
