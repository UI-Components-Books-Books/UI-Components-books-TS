import { Kbd } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

import "../assets/docs.css";

const meta: Meta<typeof Kbd> = {
  title: "Kbd",
  component: Kbd,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Kbd** representa teclas o combinaciones de teclado de forma visual.

## Características principales

- **Semántico**: Usa el elemento HTML \`<kbd>\` nativo
- **Estilizado**: Apariencia de tecla física realista
- **Personalizable**: Variables CSS para customización
- **Composable**: Se puede combinar para mostrar atajos
- **Accesible**: Claramente identificable para todos los usuarios

## Variables CSS disponibles

- \`--kbd-bg-color\`: Color de fondo
- \`--kbd-border-radius\`: Radio del borde
- \`--kbd-color\`: Color del texto

## Uso típico

Documentación de:
- Atajos de teclado
- Comandos del sistema
- Combinaciones de teclas
- Tutoriales e instrucciones

## Ejemplos de combinaciones

\`\`\`tsx
<><Kbd>Ctrl</Kbd> + <Kbd>C</Kbd></> // Copiar
<><Kbd>Cmd</Kbd> + <Kbd>V</Kbd></> // Pegar (Mac)
\`\`\`
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
Representación visual de una tecla individual.

Úsalo para documentar teclas únicas o combínalos para mostrar atajos de teclado complejos.
        `,
      },
    },
  },
  args: {
    children: ["Ctrl"],
  },
  render: (args) => <Kbd {...args} />,
};

export const KbdStyling: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Personaliza la apariencia del componente con:

**1. Prop \`addClass\`:** Clases CSS personalizadas

**2. Variables CSS:**
- \`--kbd-bg-color\`: Color de fondo
- \`--kbd-border-radius\`: Radio del borde
- \`--kbd-color\`: Color del texto

Define estas variables en tu clase CSS personalizada para un control completo del diseño.
        `,
      },
    },
  },
  args: {
    children: ["Shift"],
    addClass: "kbd-story",
  },
};
