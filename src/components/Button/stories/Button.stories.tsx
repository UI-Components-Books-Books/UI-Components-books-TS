import { Icon, Button } from "@components"
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Button** es un botón versátil, accesible y completamente personalizable.

## Características principales

- **Variantes**: Estilos primary, secondary y no-line
- **Tamaños**: Small, normal y big para diferentes contextos
- **Accesible**: Soporte completo para aria-label y lectores de pantalla
- **Estados**: Maneja disabled, focus, hover y active
- **Composable**: Acepta iconos y contenido personalizado
- **Semántico**: Genera elementos \`<button>\` nativos para mejor accesibilidad

## Accesibilidad

Cuando uses iconos sin texto visible, activa \`hasAriaLabel\` y proporciona un \`label\` descriptivo para lectores de pantalla.
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
        story: "Botón básico con configuración por defecto. Usa los controles interactivos para explorar las diferentes opciones disponibles.",
      },
    },
  },
  argTypes: {
    size: {
      options: ["small", "normal", "big"],
      control: { type: "radio" },
    },
    variant: {
      options: ["primary", "secondary", "no-line"],
      control: { type: "radio" },
    },
    hasAriaLabel: {
      options: [true, false],
      control: { type: "boolean" },
    },
    disabled: {
      options: [true, false],
      control: { type: "boolean" },
    },
  },
  args: {
    children: ["button"],
  },
  render: (args) => <Button {...args}></Button>,
};

export const DifferentSize: Story = {
  parameters: {
    docs: {
      description: {
        story: `
El botón está disponible en tres tamaños:

- **small**: Para interfaces compactas o acciones secundarias
- **normal** (default): Tamaño estándar para la mayoría de casos
- **big**: Para llamadas a la acción principales o interfaces con más espacio
        `,
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    label: "small, normal and big",
    size: "big",
  },
};

export const Variant: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Tres variantes visuales disponibles:

- **primary**: Estilo principal, alto contraste, para acciones primarias
- **secondary**: Estilo alternativo para acciones secundarias
- **no-line**: Estilo minimalista sin borde, ideal para acciones terciarias
        `,
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    label: "variant",
    variant: "secondary",
  },
};

export const WithAriaLabel: Story = {
  parameters: {
    docs: {
      description: {
        story: `
**Importante para accesibilidad:** Cuando un botón contiene solo un icono sin texto visible, es esencial proporcionar un label descriptivo.

\`\`\`tsx
<Button hasAriaLabel label="Cerrar ventana">
  <Icon><CloseIcon /></Icon>
</Button>
\`\`\`

Activando \`hasAriaLabel\`, el contenido de \`label\` se usará como \`aria-label\`, permitiendo que los lectores de pantalla describan correctamente la función del botón.
        `,
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    hasAriaLabel: true,
    label: "Destacar información",
    children: [
      <Icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="80"
          viewBox="0 -960 960 960"
          width="80"
        >
          <path d="m354-247 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-80l65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Zm247-350Z" />
        </svg>
      </Icon>,
    ],
  },
  render: (args) => <Button {...args}></Button>,
};
