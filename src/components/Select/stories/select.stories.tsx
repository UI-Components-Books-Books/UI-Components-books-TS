import { Select } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Item } from "react-stately";

const meta: Meta<typeof Select> = {
  title: "Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Select** es un selector dropdown personalizado y accesible.

## Características principales

- **Basado en React Aria**: Usa react-stately para gestión de estado
- **Totalmente accesible**: Implementa WAI-ARIA Listbox pattern
- **Navegación por teclado**: Completa con flechas, búsqueda rápida
- **Placeholder**: Texto de ayuda cuando no hay selección
- **Label**: Etiqueta semántica asociada
- **Personalizable**: Estilos modificables
- **Responsive**: Se adapta al tamaño del contenedor

## Navegación por teclado

- **Enter / Space**: Abrir/cerrar el dropdown
- **Flecha arriba/abajo**: Navegar entre opciones
- **Home**: Ir a la primera opción
- **End**: Ir a la última opción
- **Escape**: Cerrar el dropdown
- **Teclear**: Búsqueda rápida de opciones
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
Select básico con opciones definidas usando el componente \`Item\` de react-stately.

**Propiedades importantes:**
- \`label\`: Etiqueta descriptiva del select
- \`name\`: Nombre para formularios
- \`placeholder\`: Texto cuando no hay selección

Cada opción se define con \`<Item>\` que puede contener texto o JSX.
        `,
      },
    },
  },
  args: {
    label: "Select",
    name: "select",
    placeholder: "Select the correct answer",
  },
  render: (args) => (
    <Select {...args}>
      <Item>I Will see the Buckingham palace.</Item>
      <Item>If you miss the bus?</Item>
      <Item>I Will go to the beach.</Item>
      <Item>If you go to France.</Item>
    </Select>
  ),
};
