import contentCollections from "@content-collections/vite";
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig(({ mode }) => {
  const isTest = mode === "test" || process.env.VITEST === "true";

  return {
    plugins: [
      devtools(),
      isTest ? null : cloudflare({ viteEnvironment: { name: "ssr" } }),
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
      isTest ? null : contentCollections(),
    ].filter(Boolean),
  };
});

export default config;
