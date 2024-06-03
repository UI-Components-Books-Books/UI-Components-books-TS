import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../Button";
import { Popover } from "../src/popover";

const meta: Meta<typeof Popover> = {
  title: "Popover",
  component: Popover,
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
          "El componente `Popover` nos permite utilizar un elemento emergente de forma muy sencilla. Utilizando el motor de posicionamiento `popper.js`, permite colocarlo en cualquiera de los 4 ejes cardinales. Además, está diseñado con todos los criterios de accesibilidad necesarios para el manejo de este tipo de elementos. Para su implementación, solo necesitas importar el componente `<Popover />`. Este incluye los componentes `<Popover.Button />` y `<Popover.Content />`, necesarios para su uso. Haz clic en Show code en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
  render: (args) => <Popover {...args}></Popover>,
};

export const DisabledInteractionOutside: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `disabledInteractOutside` presente en el componente `<Popover.Content/>`, podemos deshabilitar la funcionalidad que cierra este si se interactúa afuera del contenido del componente.",
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content disabledInteractOutside>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
};

export const HasArrow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad hasArrow presente en el `<Popover.Content/>`, podemos agregar una flecha a nuestro popover.",
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content hasArrow>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
};

export const Placement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, el componente se ubica automáticamente en la posición que permita visualizar correctamente su contenido. Sin embargo, si necesitas que esté en una posición específica, puedes usar la propiedad `placement` del `<Popover.Content/>`.",
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content placement="left-start" hasArrow isDisabled>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
};

export const Distance: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `distance` presente en el `<Popover.Content />`, podemos modificar la distancia entre nuestro `<Popover.Button />` y el `<Popover.Content />`.",
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content placement="top-start" hasArrow distance={90}>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
};
