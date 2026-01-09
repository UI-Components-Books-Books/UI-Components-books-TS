import { Button, Panel } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Panel> = {
  title: "Panel",
  component: Panel,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Panel** organiza contenido en secciones navegables, mostrando una a la vez.

## Características principales

- **Composable**: Construido con \`Panel.Section\` y \`Panel.Nav\`
- **Navegación integrada**: Puntos indicadores clickeables
- **Botones opcionales**: Next/Previous para navegación lineal
- **Indicador visual**: Muestra la sección activa
- **Navegación por teclado**: Flechas para cambiar de sección
- **Accesible**: ARIA roles y labels apropiados
- **Transiciones suaves**: Animaciones entre secciones
- **Responsive**: Se adapta a diferentes tamaños

## Composición

\`\`\`tsx
<Panel>
  <Panel.Section>Contenido 1</Panel.Section>
  <Panel.Section>Contenido 2</Panel.Section>
  <Panel.Section>Contenido 3</Panel.Section>
  <Panel.Nav 
    showNextButton 
    showPrevButton 
  />
</Panel>
\`\`\`

## Casos de uso

- Onboarding con múltiples pasos
- Galerías de imágenes
- Presentaciones tipo slideshow
- Tutoriales paso a paso
- Carruseles de contenido
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
Panel básico con cuatro secciones y navegación por puntos.

**Características:**
- Navegación con indicadores (dots)
- Una sección visible a la vez
- Click en los puntos para cambiar de sección
- Totalmente accesible
        `,
      },
    },
  },
  args: {
    children: [
      <>
        <Panel.Section>First section</Panel.Section>
        <Panel.Section>Second section</Panel.Section>
        <Panel.Section>Third section</Panel.Section>
        <Panel.Section>Fourth section</Panel.Section>
        <Panel.Nav />
      </>,
    ],
  },
  render: (args) => <Panel {...args}></Panel>,
};

export const WithNavigationButtons: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Panel con botones de navegación anterior/siguiente además de los indicadores.

\`\`\`tsx
<Panel.Nav 
  showNextButton 
  showPrevButton 
/>
\`\`\`

Ideal para experiencias guiadas donde quieres que el usuario navegue secuencialmente.
        `,
      },
    },
  },
  args: {
    children: [
      <>
        <Panel.Section>First section</Panel.Section>
        <Panel.Section>Second section</Panel.Section>
        <Panel.Section>Third section</Panel.Section>
        <Panel.Section>Fourth section</Panel.Section>
        <Panel.Nav showNextButton showPrevButton />
      </>,
    ],
  },
};

export const WithADefaultIndex: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad `defaultIndex`, podemos decidir qué sección debe aparecer al momento de mostrarse en un grupo de secciones. Ten en cuenta que esta propiedad se maneja igual que las posiciones de un `Array`, por lo que el número `0` corresponderá la primera sección del grupo, y así sucesivamente.",
      },
    },
  },
  args: {
    defaultIndex: 3,
    children: [
      <>
        <Panel.Section>First section</Panel.Section>
        <Panel.Section>Second section</Panel.Section>
        <Panel.Section>Third section</Panel.Section>
        <Panel.Section>Fourth section</Panel.Section>
        <Panel.Nav />
      </>,
    ],
  },
};

export const ButtonToNavigateBetweenSections: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Existe otra forma de navegar entre secciones aparte del `<Panel.Nav />`, y es usando el componente `<Panel.Button />`. Este componente es un `botón` igual que el componente `<Button/>` con la uníca diferencia que recibe la propiedad `section`, en la cual indicaremos el número de la sección a la que queremos ir. Al igual que con `defaultIndex`, ten en cuenta que esta propiedad se maneja igual que las posiciones de un `Array`, por lo que el número `0` corresponderá a la primera sección del grupo, y así sucesivamente.",
      },
    },
  },
  args: {
    children: [
      <>
        <Panel.Section>
          First section
          <Panel.Button section={1}>
            <Button>Go to the second section 👉</Button>
          </Panel.Button>
        </Panel.Section>
        <Panel.Section>
          Second section
          <Panel.Button section={0}>
            <Button>Go to the first section 👈</Button>
          </Panel.Button>
        </Panel.Section>
        <Panel.Nav />
      </>,
    ],
  },
};
