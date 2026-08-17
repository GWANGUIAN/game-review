import type { Config } from "tailwindcss";
export default { darkMode: ["class"], content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { steam: { ink: "#171a21", navy: "#1b2838", card: "#2a475e", blue: "#66c0f4", mist: "#c7d5e0" } }, boxShadow: { steam: "0 12px 30px rgba(0,0,0,.28)" } } }, plugins: [] } satisfies Config;
