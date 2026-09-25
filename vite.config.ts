import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config.json";

export default defineConfig({
  base: "",
  plugins: [crx({ manifest })],
  build: {
    outDir: "extension",
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("/src/content/") ||
            id.includes("/src/generators/") ||
            id.includes("/src/data/") ||
            id.includes("/src/shared/utils")
          ) {
            return "content-deps";
          }
          return undefined;
        },
      },
    },
  },
});
