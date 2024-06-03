import type { StoryObj, Meta } from "@storybook/react";

import { NumberInput } from "../src/number-input";

const meta: Meta<typeof NumberInput> = {
  title: "NumberInput",
  component: NumberInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "El componente `NumberInput` es similar a un input básico, pero está equipado con funcionalidades para incrementar o decrementar un número. Dado que está diseñado para su fácil modificación, cada parte fundamental de este está separada en un componente. Para su implementación, solo necesitas importar el componente `<NumberInput />`. Este incluye los componentes `<NumberInput.Field />`, `<NumberInput.Stepper />`, `<NumberInput.IncrementStepper />` y `<NumberInput.DecrementStepper />`, necesarios para su uso. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
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
        story:
          "Utilizando las propiedades `max`, `min` y `defaultValue`, puedes controlar el rango de valores y el valor por defecto que manejará tu componente.",
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
