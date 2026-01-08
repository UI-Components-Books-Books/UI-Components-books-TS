import { Pagination } from "@components";
import type { StoryObj, Meta } from "@storybook/react";

const meta: Meta<typeof Pagination> = {
  title: "Pagination",
  component: Pagination,
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
          "El componente `Pagination` nos ofrece una forma sencilla de manejar la paginación de nuestro aplicativo. Construido a partir del hook personalizado `usePagination`, este componente nos brinda la estructura, el diseño y las características de accesibilidad recomendadas para un paginador. Para su implementación, solo debes importar el componente Pagination y, utilizando la propiedad `count`, indicarle el número de páginas que va a manejar. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  args: {
    count: 10,
  },
  render: (args) => <Pagination {...args}></Pagination>,
};

export const WithoutButtons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, el componente incluye los botones de siguiente y anterior página, pero usando las propiedades `hideNextButton` y `hidePrevButton`, puedes ocultarlos.",
      },
    },
  },
  args: {
    ...Default.args,
    hideNextButton: true,
    hidePrevButton: true,
  },
};

export const WithMoreButtons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `showFirstButton` y `showLastButton`, podemos mostrar los botones para ir a la primera y última página del componente.",
      },
    },
  },
  args: {
    ...Default.args,
    showFirstButton: true,
    showLastButton: true,
  },
};

export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, el `<Pagination.Item />` muestra una flecha en formato SVG. Con las propiedad `icon` presente en `renderItem`, puedes pasarle cualquier string, SVG o HTML para ser colocado dentro del botón que abre el acordeón. Ten en cuenta que este elemento estará dentro de una etiqueta `Button`, por lo que no debes pasarle otro `Button`.",
      },
    },
  },
  args: {
    ...Default.args,
    renderItem: (item) => (
      <Pagination.Item
        {...item}
        icons={{
          previous: <span>👈</span>,
          next: <span>👉</span>,
        }}
      />
    ),
  },
};
