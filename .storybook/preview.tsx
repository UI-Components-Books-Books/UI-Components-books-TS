import type { Preview } from "@storybook/react";
import type { Decorator } from "@storybook/react";
import "../src/styles/index.css";

/**
 * Decorator global que envuelve todas las historias en un div con id="root"
 * para simular el comportamiento de una aplicación React real.
 * Esto es necesario para componentes que dependen de #root (como Modal con inert).
 */
const withRootDiv: Decorator = (Story) => (
  <div id="root">
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withRootDiv],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
