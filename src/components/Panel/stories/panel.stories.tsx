import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../Button";
import { Panel } from "../src/panel";

const meta: Meta<typeof Panel> = {
  title: "Panel",
  component: Panel,
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
          "El componente `Panel` nos brinda la oportunidad de distribuir el contenido de nuestra página en diferentes secciones. Además, incorpora diferentes atributos `aria` para garantizar su correcto funcionamiento con lectores de pantalla. Para su implementación, solo necesitas importar el componente `<Panel />`. Este incluye los componentes `<Panel.Section />` y `<Panel.Nav />`, necesarios para su uso. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
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
        story:
          "Utilizando las propiedades `showNextButton` y `showNextButton` presentes en el `<Panel.Nav />`, podemos mostrar los botones de siguiente y anterior sección.",
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
