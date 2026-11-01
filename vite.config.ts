import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 5180,
    watch: {
      // docs and editor temp dirs change while the dev server runs; don't watch them
      ignored: ["**/*.md", "**/.*", "**/.*/**", "**/dist/**", "**/.tmp/**"],
    },
  },
});
