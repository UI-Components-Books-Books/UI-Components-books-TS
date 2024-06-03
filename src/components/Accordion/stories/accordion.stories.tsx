import type { Meta, StoryObj } from "@storybook/react";

import { Accordion } from "../src/accordion";
import "../assets/docs.css";

const meta: Meta<typeof Accordion> = {
  title: "Accordion",
  component: Accordion,
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
          "El componente `Accordion` está equipado con diversas propiedades que permiten su completa personalización. Además, incorpora diferentes atributos `aria` para garantizar su correcto funcionamiento con lectores de pantalla. Para su implementación, solo necesitas importar el componente `<Accordion/>`. Este incluye los componentes `<Accordion.Button/>` y `<Accordion.Panel/>`, necesarios para su uso. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  args: {
    children: (
      <>
        <Accordion.Item>
          <Accordion.Button>Accordion 1 title</Accordion.Button>
          <Accordion.Panel>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
              ducimus praesentium quae assumenda cum similique vero? Deserunt
              quos libero veritatis ab commodi. Aspernatur, dignissimos.
              Doloribus minima tenetur quos iste porro?
            </p>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Button>Accordion 2 title</Accordion.Button>
          <Accordion.Panel>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
              ducimus praesentium quae assumenda cum similique vero? Deserunt
              quos libero veritatis ab commodi. Aspernatur, dignissimos.
              Doloribus minima tenetur quos iste porro?
            </p>
          </Accordion.Panel>
        </Accordion.Item>
      </>
    ),
  },
  render: (args) => <Accordion {...args}></Accordion>,
};

export const MultipleAccordionsOpen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `allowMultiple`, puedes cambiar el comportamiento por defecto del acordeón y permitir que se mantengan dos o más acordeones abiertos al mismo tiempo.",
      },
    },
  },
  args: {
    allowMultiple: true,
    ...Default.args,
  },
};

export const WithADefaultIndex: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad `defaultIndex`, podemos decidir qué acordeón debe aparecer abierto al momento de mostrarse en un grupo de acordeones. Ten en cuenta que esta propiedad se maneja igual que las posiciones de un `Array`, por lo que el número `0` corresponderá al primer acordeón del grupo, y así sucesivamente.",
      },
    },
  },
  args: {
    defaultIndex: 1,
    ...Default.args,
  },
};

export const WithCustomButtonIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, el `<Accordion.Button/>` muestra una flecha en formato SVG. Con las propiedades `closedIcon` y `expandedIcon`, puedes pasarle cualquier string, SVG o HTML para ser colocado dentro del botón que abre el acordeón. Ten en cuenta que este elemento estará dentro de una etiqueta `Button`, por lo que no debes pasarle otro `Button`.",
      },
    },
  },
  args: {
    children: (
      <Accordion.Item>
        <Accordion.Button expandedIcon={"👇"} closedIcon={"👆"}>
          Accordion 1 title
        </Accordion.Button>
        <Accordion.Panel>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
            ducimus praesentium quae assumenda cum similique vero? Deserunt quos
            libero veritatis ab commodi. Aspernatur, dignissimos. Doloribus
            minima tenetur quos iste porro?
          </p>
        </Accordion.Panel>
      </Accordion.Item>
    ),
  },
  render: (args) => <Accordion {...args}></Accordion>,
};

export const ButtonStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Ambos componentes, `<Accordion.Button/>` y `<Accordion.Panel/>`, la aceptan. Además, puedes apoyarte en las propiedades aria para modificar el estilo del acordeón dependiendo de su comportamiento. Por ejemplo, utilizando la propiedad `aria-expanded="true"`, podemos cambiar los estilos del `<Accordion.Button/>` cuando esté abierto.',
      },
    },
  },
  args: {
    children: (
      <Accordion.Item>
        <Accordion.Button addClass="accordion__button--active">
          Accordion 1 title
        </Accordion.Button>
        <Accordion.Panel>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione
            ducimus praesentium quae assumenda cum similique vero? Deserunt quos
            libero veritatis ab commodi. Aspernatur, dignissimos. Doloribus
            minima tenetur quos iste porro?
          </p>
        </Accordion.Panel>
      </Accordion.Item>
    ),
  },
  render: (args) => <Accordion {...args}></Accordion>,
};
