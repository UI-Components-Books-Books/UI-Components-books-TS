import { Icon } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";


const meta: Meta<typeof Icon> = {
  title: "Icon",
  component: Icon,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Icon** facilita el manejo y estilizado de iconos SVG.

## Características principales

- **Tamaños predefinidos**: Small, normal y big
- **Tamaño personalizado**: Variable CSS \`--icon-size\` para control fino
- **Estilos consistentes**: Normaliza el comportamiento de SVGs
- **Herencia de color**: Los iconos heredan el color del texto por defecto
- **Flexible**: Acepta cualquier SVG como hijo
- **Responsive**: Se adapta al contexto

## Personalización avanzada

Usa la variable CSS \`--icon-size\` para tamaños específicos:

\`\`\`tsx
<Icon>
  <svg style={{ "--icon-size": "3rem" }}>
    {/* tu SVG */}
  </svg>
</Icon>
\`\`\`

## Integración con librerías

Compatible con:
- Material Icons
- Font Awesome (versión SVG)
- Heroicons
- Cualquier SVG personalizado
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
Icono básico con tamaño y estilos normalizados.

El componente proporciona estilos consistentes para cualquier SVG, simplificando su uso en toda la aplicación.
        `,
      },
    },
  },
  argTypes: {
    size: {
      options: ["small", "normal", "big"],
      control: { type: "radio" },
    },
  },
  args: {
    children: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 -960 960 960"
        width="24"
      >
        <path d="M480-260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260ZM312-520l44-42 42 42 42-42-84-86-86 86 42 42Zm250 0 42-42 44 42 42-42-86-86-84 86 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z" />
      </svg>
    ),
  },
  render: (args) => <Icon {...args}></Icon>,
};

export const CustomSizeIcon: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Personaliza el tamaño del icono con dos opciones:

**1. Prop \`size\`:** small, normal, big

**2. Variable CSS \`--icon-size\`:** Control preciso para cualquier dimensión

\`\`\`tsx
<svg style={{ "--icon-size": "4rem" }}>
\`\`\`

La variable CSS modifica tanto ancho como alto simultáneamente.
        `,
      },
    },
  },
  args: {
    children: (
      <svg
        style={{ "--icon-size": "4rem" } as React.CSSProperties}
        xmlns="http://www.w3.org/2000/svg"
        height="24"
        viewBox="0 -960 960 960"
        width="24"
      >
        <path d="M480-260q68 0 123.5-38.5T684-400H276q25 63 80.5 101.5T480-260ZM312-520l44-42 42 42 42-42-84-86-86 86 42 42Zm250 0 42-42 44 42 42-42-86-86-84 86 42 42ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z" />
      </svg>
    ),
  },
};
