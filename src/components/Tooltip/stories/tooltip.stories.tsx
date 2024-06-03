import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../Button";
import { Tooltip } from "../src/tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Tooltip",
  component: Tooltip,
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
          "El componente `Tooltip` es una pequeña burbuja de información que aclara el propósito de controles o herramientas que de otro modo serían ambiguos. Utilizando el motor de posicionamiento `popper.js`, permite colocarlo en cualquiera de los 4 ejes cardinales. Además, está diseñado con todos los criterios de accesibilidad necesarios para el manejo de este tipo de elementos. Para su implementación, solo necesitas importar el componente `<Tooltip />`. Haz clic en Show code en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  args: {
    label: "Default",
    children: <Button label="default" />,
  },
  render: (args) => <Tooltip {...args}></Tooltip>,
};

export const HasArrow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad `hasArrow` podemos agregar una flecha a nuestro componente.",
      },
    },
  },
  args: {
    ...Default.args,
    hasArrow: true,
  },
};

export const Placement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, el componente se ubica automáticamente en la posición que permita visualizar correctamente su contenido. Sin embargo, si necesitas que esté en una posición específica, puedes usar la propiedad `placement`.",
      },
    },
  },
  args: {
    ...Default.args,
    placement: "top-start",
  },
};

export const Distance: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `distance`, podemos modificar la distancia entre nuestro `Button` y el `<Tooltip/>`.",
      },
    },
  },
  args: {
    ...Default.args,
    distance: 50,
  },
};
