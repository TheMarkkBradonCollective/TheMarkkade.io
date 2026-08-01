import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        founder: resolve(__dirname, "founder/index.html"),
        markkdbills: resolve(__dirname, "games/markkdbills/index.html"),
      },
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
