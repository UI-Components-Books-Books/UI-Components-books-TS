import { Switch } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

const meta: Meta<typeof Switch> = {
  title: "Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Switch** es un toggle estilizado para activar/desactivar opciones.

## Características principales

- **Tamaños**: Small, normal y big
- **Label configurable**: Visible u oculto visualmente
- **Estados**: On/Off con animación suave
- **Accesible**: Basado en checkbox semántico con ARIA
- **Controlado/No controlado**: Flexible para cualquier caso de uso
- **Clase adicional**: Personalización de estilos

## Uso ideal

- Activar/desactivar funcionalidades
- Configuración de preferencias
- Modos (claro/oscuro, público/privado)
- Toggles en formularios

## Accesibilidad

Aunque visualmente es un switch, semánticamente es un checkbox, lo que garantiza compatibilidad con lectores de pantalla y navegación por teclado.
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
Switch básico con label oculto visualmente (pero accesible para lectores de pantalla).

El label por defecto está oculto para mantener un diseño limpio, pero sigue siendo accesible para tecnologías de asistencia.
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
    id: "switch",
    label: "Default switch label",
  },
  render: (args) => <Switch {...args}></Switch>,
};

export const HasLabelVisible: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Usa \`isLabelVisible={true}\` para mostrar el label visualmente junto al switch.

Esto es útil cuando necesitas proporcionar contexto visual claro sobre qué controla el switch.
        `,
      },
    },
  },
  args: {
    ...Default.args,
    isLabelVisible: true,
  },
};

export const Size: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Para cambiar el tamaño del componente, puedes utilizar la propiedad `size`, que incluye 3 diferentes tamaños: `small`, `normal` y `big`. Sin embargo, si estos valores no se ajustan a tus requerimientos, puedes utilizar las propiedades CSS personalizadas `--switch-width`, `--switch-height` y `--switch-thumb`, que modifican tanto el alto como el ancho de tu componente.",
      },
    },
  },
  args: {
    ...Default.args,
    size: "big",
  },
};
export const Checked: Story = {
  parameters: {
    docs: {
      description: {
        Story:
          "Al igual que en el estándar de HTML, podemos utilizar la propiedad nativa `defaultChecked` para que nuestro switch esté 'seleccionado' por defecto.",
      },
    },
  },
  args: {
    ...Default.args,
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad `disabled` podemos deshabilitar el funcionamiento de nuestro componente.",
      },
    },
  },
  args: {
    ...Default.args,
    disabled: true,
  },
};
