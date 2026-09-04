import { defineConfig, mergeConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import base from "./vite.config";

// Self-contained preview build: one HTML file with all JS/CSS inlined,
// openable straight from disk. `bun run build:single` → dist-single/index.html
export default mergeConfig(
  defineConfig({ ...base, build: { ...(base as { build?: object }).build, rollupOptions: {} } }),
  defineConfig({
    base: "./",
    plugins: [viteSingleFile({ removeViteModuleLoader: true })],
    build: { outDir: "dist-single", emptyOutDir: true, assetsInlineLimit: 100000000, cssCodeSplit: false, sourcemap: false },
  }),
);
