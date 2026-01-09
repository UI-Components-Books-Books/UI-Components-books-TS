import { Audio } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

import "../assets/docs.css";

const meta: Meta<typeof Audio> = {
  title: "Audio",
  component: Audio,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Audio** es un reproductor de audio personalizado y completamente accesible.

## Características principales

- **Controles completos**: Play, pause, línea de tiempo, volumen
- **Dos modos de visualización**: Bar (completo) y Button (compacto)
- **Tamaños**: Normal y small para diferentes contextos
- **Línea de tiempo arrastrable**: Navegación precisa por el audio
- **Control de volumen**: Ajuste fino del nivel de audio
- **Indicador de tiempo**: Muestra tiempo actual y duración total
- **Accesible**: Cumple estándares WCAG con controles por teclado
- **Responsive**: Se adapta al contenedor

## Modos de visualización

- **bar** (default): Reproductor completo con todos los controles visibles
- **button**: Versión compacta, ideal para espacios reducidos

## Navegación por teclado

- **Space**: Play/Pause
- **Flecha derecha**: Avanzar en la línea de tiempo
- **Flecha izquierda**: Retroceder en la línea de tiempo
- **Flecha arriba/abajo**: Ajustar volumen
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Reproductor de audio en modo **bar** (completo) con todos los controles visibles.

**Incluye:**
- Botón play/pause
- Línea de tiempo interactiva
- Indicadores de tiempo (actual/total)
- Control de volumen con slider
- Diseño accesible para todos los usuarios
        `,
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
        story: `
Reproductor en tamaño **small** para interfaces compactas.

Ideal para:
- Sidebars
- Cards pequeñas
- Reproducciones secundarias
- Interfaces móviles
        `,
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
