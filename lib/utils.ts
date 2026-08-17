import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const minutesLabel = (minutes: number) => `${Math.floor(minutes / 60)}시간 ${minutes % 60 ? `${minutes % 60}분` : ""}`.trim();
export const priceLabel = (price: number | null | undefined) => price === null || price === undefined ? "가격 미정" : price === 0 ? "무료" : `₩${new Intl.NumberFormat("ko-KR").format(price)}`;
export const kstDate = (value: string) => new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(value));
