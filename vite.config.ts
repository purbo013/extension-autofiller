import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config.json";

export default defineConfig({
  base: "",
  plugins: [crx({ manifest })],
  build: {
    outDir: "extension",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
    },
  },
});
