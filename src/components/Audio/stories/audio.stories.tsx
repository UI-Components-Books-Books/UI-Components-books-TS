import type { Meta, StoryObj } from "@storybook/react";

import { Audio } from "../src/audio";
import "../assets/docs.css";

const meta: Meta<typeof Audio> = {
  title: "Audio",
  component: Audio,
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
          "El componente `Audio` es un reproductor totalmente personalizado que se puede ajustar a tus diferentes necesidades. Cuenta con las funcionalidades básicas de todo reproductor, como pausar/iniciar, medidor de tiempo, una línea de tiempo arrastrable y un controlador de volumen. Además, está construido acorde a los estándares de la WCAG para que sea un elemento accesible para usuarios con diferentes discapacidades. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  argTypes: {
    size: {
      options: ["small"],
      control: { type: "check" },
    },
    type: {
      options: ["bar", "button"],
      control: { type: "radio" },
    },
  },
  args: {
    src: "https://mdn.github.io/learning-area/accessibility/multimedia/viper.mp3",
  },
  render: (args) => <Audio {...args}></Audio>,
};

export const AudioSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "La propiedad `size` nos permite cambiar el tamaño de nuestro reproductor a uno más pequeño. Por el momento, solo está disponible el tamaño `small`.",
      },
    },
  },
  ...Default.argTypes,
  args: {
    ...Default.args,
    size: "small",
  },
  render: (args) => <Audio {...args}></Audio>,
};

export const AudioButtonType: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Por defecto, el reproductor está diseñado como uno tradicional, es decir, un rectángulo. Sin embargo, con la propiedad `type="button"`, podemos convertir nuestro reproductor en un botón. Esto nos brinda una mayor facilidad en momentos en los que necesitemos colocar un reproductor en espacios pequeños de nuestro diseño.',
      },
    },
  },
  ...Default.argTypes,
  args: {
    ...Default.args,
    type: "button",
  },
  render: (args) => <Audio {...args}></Audio>,
};

export const AudioStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Además, también contamos con CSS custom properties, puedes usar `--audio-background-color`, `--audio-slider-color` y `--audio-border-radius`. Puedes especificar estas variables en una clase personalizada de CSS. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  ...Default.argTypes,
  args: {
    ...Default.args,
    addClass: "audio-class-example",
  },
};
