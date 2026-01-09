import { Accordion } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

import "../assets/docs.css";

const meta: Meta<typeof Accordion> = {
  title: "Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Accordion** permite mostrar y ocultar secciones de contenido de forma interactiva.

## Características principales

- **Composable**: Construido con subcomponentes (\`Accordion.Item\`, \`Accordion.Button\`, \`Accordion.Panel\`)
- **Modo exclusivo**: Por defecto, solo un panel abierto a la vez
- **Modo múltiple**: Permite múltiples paneles abiertos simultáneamente
- **Animaciones suaves**: Transiciones fluidas al expandir/contraer
- **Navegación por teclado**: Totalmente navegable con flechas y Enter/Space
- **Accesible**: Implementa WAI-ARIA con roles y estados apropiados
- **Íconos automáticos**: Indicadores visuales del estado (abierto/cerrado)

## Composición

\`\`\`tsx
<Accordion>
  <Accordion.Item>
    <Accordion.Button>Título de la sección</Accordion.Button>
    <Accordion.Panel>
      Contenido que se expande y contrae
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>
\`\`\`

## Navegación por teclado

- **Enter / Space**: Alternar panel
- **Flecha abajo**: Navegar al siguiente botón
- **Flecha arriba**: Navegar al botón anterior
- **Home**: Ir al primer botón
- **End**: Ir al último botón
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
Accordion básico con comportamiento exclusivo: solo un panel puede estar abierto a la vez.

Cuando abres un panel, el panel previamente abierto se cierra automáticamente. Este es el comportamiento predeterminado, ideal para FAQs o navegación.
        `,
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
