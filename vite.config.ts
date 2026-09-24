import contentCollections from "@content-collections/vite";
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import stylex from "@stylexjs/unplugin";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig(({ mode }) => {
  const isTest = mode === "test" || process.env.VITEST === "true";

  return {
    define: {
      // Changes every build; the server entry keys its edge cache on it.
      __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
    },
    plugins: [
      devtools(),
      isTest ? null : cloudflare({ viteEnvironment: { name: "ssr" } }),
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      stylex.vite({ devMode: isTest ? "off" : "full" }),
      tanstackStart(),
      viteReact(),
      isTest ? null : contentCollections(),
    ].filter(Boolean),
  };
});

export default config;
