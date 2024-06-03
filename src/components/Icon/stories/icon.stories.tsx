import type { Meta, StoryObj } from "@storybook/react";

import { Icon } from "../src/icon";

const meta: Meta<typeof Icon> = {
  title: "Icon",
  component: Icon,
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
          "El componente `Icon` agrega una serie de estilos CSS por defecto que te ayudarán a manejar todos esos iconos en formato SVG de una forma más sencilla. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
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
        story:
          "Para cambiar el tamaño del ícono, puedes utilizar la propiedad `size`, que incluye 3 diferentes tamaños: `small`, `normal` y `big`. Pero si estos valores no se ajustan a tus requerimientos, puedes utilizar la CSS custom property `--icon-size`, que modificará tanto el alto como el ancho de tu SVG.",
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
