import { NumberInput } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

const meta: Meta<typeof NumberInput> = {
  title: "NumberInput",
  component: NumberInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **NumberInput** es un input numérico con controles de incremento/decremento integrados.

## Características principales

- **Composable**: Construido con subcomponentes (Field, Stepper, IncrementStepper, DecrementStepper)
- **Validación de rango**: Props \`min\` y \`max\` para limitar valores
- **Valor por defecto**: \`defaultValue\` para estado inicial
- **Keep within range**: Mantiene el valor dentro de límites al perder foco
- **Navegación por teclado**: Flechas arriba/abajo para incrementar/decrementar
- **Precislón**: Soporte para decimales con \`step\`
- **Accesible**: Labels y controles semánticos
- **Disabled**: Soporte para estado deshabilitado

## Composición

\`\`\`tsx
<NumberInput min={0} max={100} defaultValue={50}>
  <NumberInput.Field label="Cantidad" />
  <NumberInput.Stepper>
    <NumberInput.IncrementStepper />
    <NumberInput.DecrementStepper />
  </NumberInput.Stepper>
</NumberInput>
\`\`\`

## Casos de uso

- Cantidades en carrito de compras
- Controles de configuración numérica
- Inputs de edad, calificaciones, puntuaciones
- Cualquier valor numérico con límites
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
NumberInput básico con todos los subcomponentes necesarios.

**Componentes incluidos:**
- \`NumberInput.Field\`: Input con label
- \`NumberInput.Stepper\`: Contenedor de botones
- \`NumberInput.IncrementStepper\`: Botón para aumentar
- \`NumberInput.DecrementStepper\`: Botón para disminuir
        `,
      },
    },
  },
  args: {
    children: (
      <>
        <NumberInput.Field label="Default NumberInput label" />
        <NumberInput.Stepper>
          <NumberInput.IncrementStepper />
          <NumberInput.DecrementStepper />
        </NumberInput.Stepper>
      </>
    ),
  },
  render: (args) => <NumberInput {...args}></NumberInput>,
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Controla el rango de valores permitidos:

- **\`min\`**: Valor mínimo permitido
- **\`max\`**: Valor máximo permitido  
- **\`defaultValue\`**: Valor inicial

En este ejemplo, el valor está limitado entre 5 y 10, iniciando en 5.
        `,
      },
    },
  },
  args: {
    ...Default.args,
    max: 10,
    min: 5,
    defaultValue: 5,
  },
};

export const KeepWithinRange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, el componente puede salirse del rango de valores establecidos en las propiedades `min` y `max`. Sin embargo, utilizando la propiedad `keepWithinRange`, puedes cambiar este comportamiento, haciendo que el valor no pueda superar los límites establecidos.",
      },
    },
  },
  args: {
    ...Default.args,
    ...Controlled.args,
    keepWithinRange: true,
  },
};

export const CustomIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, los componentes `<NumberInput.IncrementStepper/>` y `<NumberInput.DecrementStepper/>` muestra una flecha en formato SVG. Pero puedes pasarle cualquier string, SVG o HTML para ser colocado dentro del botón que incrementa o decremeta el valor. Ten en cuenta que este elemento estará dentro de una etiqueta `Button`, por lo que no debes pasarle otro `Button`.",
      },
    },
  },
  args: {
    max: 20,
    min: 1,
    defaultValue: 1,
    keepWithinRange: true,
    children: (
      <>
        <NumberInput.Field label="Default NumberInput label" />
        <NumberInput.Stepper>
          <NumberInput.IncrementStepper>🙌</NumberInput.IncrementStepper>
          <NumberInput.DecrementStepper>😥</NumberInput.DecrementStepper>
        </NumberInput.Stepper>
      </>
    ),
  },
};
