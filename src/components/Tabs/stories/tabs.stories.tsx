import { Tabs } from "@components";
import type { Meta, StoryObj } from "@storybook/react";

import "../assets/docs.css";

const meta: Meta<typeof Tabs> = {
  title: "Tabs",
  component: Tabs,
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
          "El componente `Tabs` es un conjunto de secciones de contenido, conocidas como paneles de pestañas, que muestran un panel de contenido a la vez. Este componente está equipado con diversas propiedades que permiten su completa personalización. Además, incorpora diferentes atributos `aria` para garantizar su correcto funcionamiento en lectores de pantalla. Para su implementación, solo necesitas importar el componente `<Tabs />`. Este incluye los componentes `<Tabs.TabList />`, `<Tabs.Tab />`, `<Tabs.TabPanels />` y `<Tabs.Panel />`, necesarios para su uso. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  args: {
    children: (
      <>
        <Tabs.TabList label="testing" orientation="horizontal">
          <Tabs.Tab>One</Tabs.Tab>
          <Tabs.Tab>Two</Tabs.Tab>
          <Tabs.Tab>Three</Tabs.Tab>
        </Tabs.TabList>
        <Tabs.TabPanels>
          <Tabs.TabPanel>First panel 1️⃣</Tabs.TabPanel>
          <Tabs.TabPanel>Second panel 2️⃣</Tabs.TabPanel>
          <Tabs.TabPanel>Third panel 3️⃣</Tabs.TabPanel>
        </Tabs.TabPanels>
      </>
    ),
  },
  render: (args) => <Tabs {...args}></Tabs>,
};

export const WithADefaultIndex: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad `defaultIndex`, podemos decidir qué pestaña debe aparecer abierta al momento de mostrarse. Ten en cuenta que esta propiedad se maneja igual que las posiciones de un `Array`, por lo que el número 0 corresponderá a la primera pestaña del grupo, y así sucesivamente.",
      },
    },
  },
  args: {
    ...Default.args,
    defaultIndex: 1,
  },
};

export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `icon`, puedes pasarle cualquier string, SVG o HTML para ser colocado dentro del botón que abre la pestaña. Además, puedes personalizarlo dependiendo del estado de la pestaña. Ten en cuenta que este elemento estará dentro de una etiqueta `Button`, por lo que no debes pasarle otro `Button`.",
      },
    },
  },
  args: {
    children: (
      <>
        <Tabs.TabList label="testing" orientation="horizontal">
          <Tabs.Tab icon={(isSelected) => (isSelected ? "🥳" : "😥")}>
            One
          </Tabs.Tab>
          <Tabs.Tab>Two</Tabs.Tab>
        </Tabs.TabList>
        <Tabs.TabPanels>
          <Tabs.TabPanel>First panel 1️⃣</Tabs.TabPanel>
          <Tabs.TabPanel>Second panel 2️⃣</Tabs.TabPanel>
        </Tabs.TabPanels>
      </>
    ),
  },
};

export const StylingSelected: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Todos los componentes dentro de `<Tabs>` la aceptan. Además, puedes apoyarte en las propiedades `aria` para modificar el estilo del acordeón dependiendo de su comportamiento. Por ejemplo, utilizando la propiedad `aria-selected='true'`, podemos cambiar los estilos del `<Tabs.Tab />` cuando esté abierto.",
      },
    },
  },
  args: {
    children: (
      <>
        <Tabs.TabList label="testing" orientation="horizontal">
          <Tabs.Tab addClass="tab--selected">One</Tabs.Tab>
          <Tabs.Tab>Two</Tabs.Tab>
        </Tabs.TabList>
        <Tabs.TabPanels>
          <Tabs.TabPanel>First panel 1️⃣</Tabs.TabPanel>
          <Tabs.TabPanel>Second panel 2️⃣</Tabs.TabPanel>
        </Tabs.TabPanels>
      </>
    ),
  },
};
