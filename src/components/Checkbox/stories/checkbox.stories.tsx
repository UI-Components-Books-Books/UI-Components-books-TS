import { CheckBox } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

import "../assets/docs.css";

const meta: Meta<typeof CheckBox> = {
  title: "CheckBox",
  component: CheckBox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **CheckBox** es un input personalizado para selección múltiple.

## Características principales

- **Estados visuales**: Normal, correcto (right), incorrecto (wrong)
- **Iconos integrados**: Feedback visual con iconos SVG
- **Label flexible**: Soporta HTML para formateo rico
- **Accesible**: Atributos ARIA y asociación label-input correcta
- **Controlado/No controlado**: Funciona en ambos modos
- **Customizable**: Estilos modificables mediante clases

## Uso en formularios

Ideal para:
- Selección múltiple de opciones
- Aceptación de términos y condiciones
- Filtros y preferencias
- Validación con feedback visual
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
Checkbox básico con label que soporta HTML.

El label puede incluir formato como \`<strong>\`, \`<em>\`, enlaces, etc., para mejorar la presentación del texto.
        `,
      },
    },
  },
  argTypes: {
    state: {
      options: ["normal", "right", "wrong"],
      control: { type: "radio" },
    },
  },
  args: {
    label: "Default <strong>checkbox</strong> label",
  },
  render: (args) => <CheckBox {...args}></CheckBox>,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story: `
El checkbox soporta tres estados visuales:

- **normal**: Estado estándar sin validación
- **right**: Muestra un icono de éxito/correcto (✓)
- **wrong**: Muestra un icono de error/incorrecto (✗)

Los estados \`right\` y \`wrong\` son útiles para validación en tiempo real o feedback de formularios.
        `,
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
    label: "Default checked",
    defaultChecked: true,
  },
};

export const CheckStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Además, también contamos con CSS custom properties, que puedes usar: `--input-check-bg`, `--input-check-clr`, `--input-check-border-clr` y `--input-check-border-radius`. Puedes especificar estas variables en una clase personalizada de CSS. Por otra parte, para manejar los estilos dependiendo de los diferentes estados, puedes utilizar el atributo `data-state` presente en el componente. Haz clic en Show code en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    ...Default.args,
    label: "Change styles",
    addClass: "checkbox-example",
    state: "wrong",
    defaultChecked: true,
  },
};
