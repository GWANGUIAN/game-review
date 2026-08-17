import type { Config } from "tailwindcss";
export default { darkMode: ["class"], content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { steam: { ink: "#0a0c10", navy: "#121720", card: "#171d27", blue: "#76e0ff", mist: "#c3cad6" } }, boxShadow: { steam: "0 18px 45px rgba(0,0,0,.32)" } } }, plugins: [] } satisfies Config;
