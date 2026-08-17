import type { Config } from "tailwindcss";
export default { darkMode: ["class"], content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { steam: { ink: "#10051f", navy: "#21113a", card: "#2c1748", blue: "#4ff6ff", mist: "#f4eaff" } }, boxShadow: { steam: "5px 5px 0 #07020d, 0 0 0 2px rgba(255,87,230,.45)" } } }, plugins: [] } satisfies Config;
