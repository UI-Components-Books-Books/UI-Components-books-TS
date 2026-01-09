import { Button,  Toggletip } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Toggletip> = {
  title: "Toggletip",
  component: Toggletip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Toggletip** muestra información contextual al hacer click, ideal para aclaraciones breves.

## Características principales

- **Activación por click**: A diferencia del tooltip (hover)
- **Posicionamiento inteligente**: Powered by Popper.js
- **12 posiciones disponibles**: top, bottom, left, right y variantes
- **Flecha opcional**: Indicador visual con \`hasArrow\`
- **Click outside**: Cierra al interactuar fuera (configurable)
- **ESC para cerrar**: Navegación por teclado
- **Accesible**: Role y atributos ARIA apropiados
- **Contenido dinámico**: Soporta texto y JSX

## Diferencias clave

| Característica | Tooltip | Toggletip | Popover |
|----------------|---------|-----------|----------|
| Activación | Hover | Click | Click |
| Contenido | Solo texto | Texto/HTML simple | Contenido interactivo |
| Interacción | No | Sí (links) | Sí (completa) |
| Uso | Ayuda rápida | Aclaraciones | Menús/Formularios |

## Posicionamiento

Disponibles: \`top\`, \`top-start\`, \`top-end\`, \`bottom\`, \`bottom-start\`, \`bottom-end\`, \`left\`, \`left-start\`, \`left-end\`, \`right\`, \`right-start\`, \`right-end\`, \`auto\`

## Casos de uso

- Aclarar terminología técnica
- Ayuda contextual clickeable
- Definiciones que requieren click intencional
- Información que puede contener enlaces
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
Toggletip básico que se activa con click.

**Características:**
- Click para abrir/cerrar
- Posicionamiento automático
- Cierra con ESC o click fuera
- Ideal para información que requiere acción intencional
        `,
      },
    },
  },
  args: {
    label: "Default",
    children: <Button label="default" />,
  },
  render: (args) => <Toggletip {...args}></Toggletip>,
};

export const HasArrow: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Toggletip con flecha apuntando al elemento disparador.

La prop \`hasArrow\` agrega un indicador visual que mejora la conexión entre el toggletip y su elemento asociado.
        `,
      },
    },
  },
  args: {
    ...Default.args,
    hasArrow: true,
  },
};

export const DisabledInteractionOutside: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Toggletip que NO se cierra al hacer click fuera.

Usa \`disabledInteractOutside\` cuando necesites que el usuario cierre el toggletip explícitamente. Útil para información crítica.
        `,
      },
    },
  },
  args: {
    ...Default.args,
    disabledInteractOutside: true,
  },
};

export const Placement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, el componente se ubica automáticamente en la posición que permita visualizar correctamente su contenido. Sin embargo, si necesitas que esté en una posición específica, puedes usar la propiedad `placement`.",
      },
    },
  },
  args: {
    ...Default.args,
    placement: "top-start",
  },
};

export const Distance: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `distance`, podemos modificar la distancia entre nuestro `Button` y el `<Toggletip/>`.",
      },
    },
  },
  args: {
    ...Default.args,
    distance: 50,
  },
};
