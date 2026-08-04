import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/dota2-replay-anonymizer/" : "/",
  plugins: [react(), tailwindcss()],
  worker: {
    format: "es",
  },
}));
