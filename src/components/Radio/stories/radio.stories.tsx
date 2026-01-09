import { Radio } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

import "../assets/docs.css";

const meta: Meta<typeof Radio> = {
  title: "Radio",
  component: Radio,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Radio** es un input de selección única personalizado con estados visuales.

## Características principales

- **Selección única**: Solo una opción del grupo puede estar seleccionada
- **Estados visuales**: Normal, right (correcto), wrong (incorrecto)
- **Label flexible**: Soporta HTML para formateo
- **Checked programable**: Control del estado seleccionado
- **Agrupación**: Usa el mismo \`name\` para agrupar opciones
- **Accesible**: Input radio semántico con labels asociados
- **Validación visual**: Iconos de feedback integrados

## Agrupación

Para crear un grupo de opciones mutuamente excluyentes:

\`\`\`tsx
<Radio name="pregunta1" label="Opción A" />
<Radio name="pregunta1" label="Opción B" />
<Radio name="pregunta1" label="Opción C" />
\`\`\`

## Estados de validación

- **right**: Muestra ✓ para respuestas correctas
- **wrong**: Muestra ✗ para respuestas incorrectas
- **normal**: Estado estándar sin validación

## Casos de uso

- Preguntas de selección única
- Opciones mutuamente excluyentes
- Quizzes y exámenes
- Formularios con opciones limitadas
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
Radio button básico con label que soporta HTML.

El label puede incluir formato como \`<strong>\`, \`<em>\`, enlaces, etc. Solo una opción puede estar seleccionada en un grupo.
        `,
      },
    },
  },
  argTypes: {
    state: {
      options: ["right", "wrong"],
      control: { type: "radio" },
    },
  },
  args: {
    label: "Default radio <strong>label</strong>",
  },
  render: (args) => <Radio {...args}></Radio>,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Radio button con estados de validación visual.

**Estados disponibles:**
- **right**: Muestra icono de éxito (✓)
- **wrong**: Muestra icono de error (✗)

Útil para quizzes, exámenes o formularios con validación inmediata.
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
    defaultChecked: true,
  },
};

export const RadioStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Además, también contamos con CSS custom properties, que puedes usar: `--input-radio-bg`, `--input-radio-clr`, `--input-radio-border-clr` y `--input-radio-border-radius`. Puedes especificar estas variables en una clase personalizada de CSS. Por otra parte, para manejar los estilos dependiendo de los diferentes estados, puedes utilizar el atributo `data-state` presente en el componente. Haz clic en Show code en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    ...Default.args,
    label: "Change styles",
    addClass: "radio-example",
    state: "wrong",
    defaultChecked: true,
  },
};
