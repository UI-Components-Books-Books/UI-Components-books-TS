import { Tabs } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

import "../assets/docs.css";

const meta: Meta<typeof Tabs> = {
  title: "Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Tabs** organiza contenido en pestañas, mostrando un panel a la vez.

## Características principales

- **Composable**: Construido con subcomponentes (\`Tabs.TabList\`, \`Tabs.Tab\`, \`Tabs.TabPanels\`, \`Tabs.TabPanel\`)
- **Orientación**: Soporta layout horizontal y vertical
- **Pestaña inicial**: Configurable con \`defaultIndex\`
- **Navegación por teclado**: Completa accesibilidad con flechas
- **Accesible**: Implementa WAI-ARIA Tabs pattern
- **Indicador visual**: Destaca la pestaña activa
- **Sincronizado**: Los paneles se sincronizan automáticamente con las pestañas

## Composición

\`\`\`tsx
<Tabs defaultIndex={0}>
  <Tabs.TabList label="Navegación principal">
    <Tabs.Tab>Primera</Tabs.Tab>
    <Tabs.Tab>Segunda</Tabs.Tab>
  </Tabs.TabList>
  <Tabs.TabPanels>
    <Tabs.TabPanel>Contenido 1</Tabs.TabPanel>
    <Tabs.TabPanel>Contenido 2</Tabs.TabPanel>
  </Tabs.TabPanels>
</Tabs>
\`\`\`

## Navegación por teclado

- **Flecha izquierda/derecha** (horizontal): Navegar entre pestañas
- **Flecha arriba/abajo** (vertical): Navegar entre pestañas
- **Home**: Ir a la primera pestaña
- **End**: Ir a la última pestaña
- **Tab**: Navegar del TabList al contenido del panel activo
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
Ejemplo básico de tabs con orientación horizontal.

**Características demostradas:**
- Tres pestañas con sus respectivos paneles
- Orientación horizontal (default)
- Navegación con teclado habilitada
- Solo un panel visible a la vez
        `,
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
        story: `
Usa \`defaultIndex\` para especificar qué pestaña debe estar activa inicialmente.

**Nota:** El índice es base-0, como los arrays de JavaScript:
- \`0\` = Primera pestaña
- \`1\` = Segunda pestaña
- \`2\` = Tercera pestaña

En este ejemplo, \`defaultIndex={1}\` abre la segunda pestaña al cargar.
        `,
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
