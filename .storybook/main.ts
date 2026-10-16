import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

/**
 * Storybook reutiliza la configuración de Vite de la librería, que incluye el plugin que genera
 * los tipos (`vite:dts`). En `storybook build` ese plugin se ejecuta y deja un `index.d.ts` suelto
 * dentro de `storybook-static/`, además de tardar. Las historias no lo necesitan, así que se quita
 * (los plugins pueden venir anidados en arreglos).
 */
const withoutDtsPlugin = (plugins: PluginOption[] = []): PluginOption[] =>
  plugins
    .map((plugin) => (Array.isArray(plugin) ? withoutDtsPlugin(plugin) : plugin))
    .filter((plugin) => !(plugin && typeof plugin === "object" && "name" in plugin && plugin.name === "vite:dts"));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-onboarding",
    "storybook/preview-api",
    "@chromatic-com/storybook",
    "@storybook/addon-docs"
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript"
  },

  viteFinal: async (viteConfig) => ({
    ...viteConfig,
    plugins: withoutDtsPlugin(viteConfig.plugins),
  }),
};
export default config;
