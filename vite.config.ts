import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/d2-replay-anonymizer/" : "/",
  plugins: [react()],
  worker: {
    format: "es",
  },
}));
