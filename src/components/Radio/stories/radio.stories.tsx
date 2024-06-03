import type { Meta, StoryObj } from "@storybook/react";

import { Radio } from "../src/radio";
import "../assets/docs.css";

const meta: Meta<typeof Radio> = {
  title: "Radio",
  component: Radio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "El componente `Radio` es un elemento personalizado que permite manejar diferentes estados en su interior. Es especialmente útil en formularios cuando el usuario necesita seleccionar un valor de distintas opciones disponibles. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  argTypes: {
    state: {
      options: ["right", "wrong"],
      control: { type: "radio" },
    },
  },
  args: {
    label: "Default radio label",
  },
  render: (args) => <Radio {...args}></Radio>,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `state`, se pueden manejar los múltiples estados del componente, tales como: `right`, y `wrong`. Estos dos muestran un ícono SVG dentro del componente.",
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    label: "Right state ✔",
    state: "right",
  },
};

export const Checked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Al igual que en el estándar de HTML, podemos utilizar la propiedad nativa `defaultChecked` para que nuestro checkbox esté 'seleccionado' por defecto.",
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    ...Default.args,
    defaultChecked: true,
  },
};

export const RadioStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Además, también contamos con CSS custom properties, que puedes usar: `--input-radio-bg`, `--input-radio-clr`, `--input-radio-border-clr` y `--input-radio-border-radius`. Puedes especificar estas variables en una clase personalizada de CSS. Por otra parte, para manejar los estilos dependiendo de los diferentes estados, puedes utilizar el atributo `data-state` presente en el componente. Haz clic en Show code en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    ...Default.args,
    label: "Change styles",
    addClass: "radio-example",
    state: "wrong",
    defaultChecked: true,
  },
};
