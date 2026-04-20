import { Button,  Tooltip } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Tooltip> = {
  title: "Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Tooltip** muestra información contextual al pasar el mouse (hover).

## Características principales

- **Activación por hover**: Aparece al pasar el mouse
- **Posicionamiento inteligente**: Powered by Popper.js
- **12 posiciones disponibles**: Control completo de ubicación
- **Flecha opcional**: Indicador visual con \`hasArrow\`
- **Delay configurable**: Control del tiempo de aparición
- **Solo informativo**: No debe contener elementos interactivos
- **Accesible**: Atributos ARIA para lectores de pantalla
- **Responsive**: Se adapta al espacio disponible

## Cuándo usar cada componente

**Tooltip (este):**
- Información breve al hacer hover
- Solo texto, sin interacción
- Ayuda contextual rápida

**Toggletip:**
- Requiere click intencional
- Puede contener enlaces simples
- Información que necesita permanecer visible

**Popover:**
- Contenido interactivo complejo
- Formularios, menús, acciones
- Requiere interacción del usuario

## Posiciones disponibles

\`top\`, \`top-start\`, \`top-end\`, \`bottom\`, \`bottom-start\`, \`bottom-end\`, \`left\`, \`left-start\`, \`left-end\`, \`right\`, \`right-start\`, \`right-end\`, \`auto\` (automático)

## Buenas prácticas

- Usa texto breve y conciso
- No pongas elementos clickeables dentro
- No uses tooltips en dispositivos táctiles exclusivamente
- Proporciona la misma información de forma alternativa
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
Tooltip básico que aparece al hacer hover.

**Características:**
- Se activa automáticamente al pasar el mouse
- Posicionamiento automático inteligente
- Desaparece al quitar el mouse
- Ideal para ayuda contextual rápida
        `,
      },
    },
  },
  args: {
    label: "<i>Default</i> tooltip",
    children: <Button label="default" />,
  },
  render: (args) => <Tooltip {...args}></Tooltip>,
};

export const HasArrow: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Tooltip con flecha apuntando al elemento.

La prop \`hasArrow\` agrega un indicador visual que conecta claramente el tooltip con el elemento que describe.
        `,
      },
    },
  },
  args: {
    ...Default.args,
    hasArrow: true,
  },
};

export const Placement: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Control preciso de la posición del tooltip.

**Opciones disponibles:**
- \`top\`, \`top-start\`, \`top-end\`
- \`bottom\`, \`bottom-start\`, \`bottom-end\`
- \`left\`, \`left-start\`, \`left-end\`
- \`right\`, \`right-start\`, \`right-end\`
- \`auto\` (default): Se posiciona automáticamente

En este ejemplo, \`placement="top-start"\` alinea el tooltip arriba e inicia desde el borde izquierdo.
        `,
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
          "Utilizando la propiedad `distance`, podemos modificar la distancia entre nuestro `Button` y el `<Tooltip/>`.",
      },
    },
  },
  args: {
    ...Default.args,
    distance: 50,
  },
};
