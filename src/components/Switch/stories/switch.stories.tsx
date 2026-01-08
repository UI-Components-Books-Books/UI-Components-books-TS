import { Switch } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

const meta: Meta<typeof Switch> = {
  title: "Switch",
  component: Switch,
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
          "El componente `Switch` es un input de tipo checkbox personalizado. Su funcionamiento base es el mismo, pero el cambio radica en su diseño. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
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
        story:
          "Por defecto, el label del componente se encuentra oculto, pero puedes cambiar este comportamiento usando la propiedad `isLabelVisible`.",
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
