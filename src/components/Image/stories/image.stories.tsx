import { Image } from "@components";
import type { Meta, StoryObj } from "@storybook/react";


const meta: Meta<typeof Image> = {
  title: "Image",
  component: Image,
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
          "El componente `Image` es una herramienta sencilla que nos permite gestionar nuestras imágenes de manera rápida y sin preocuparnos demasiado. Cuenta con la propiedad `src`, en la cual podemos colocar la URL de nuestra imagen; en caso de que esta no se encuentre, aparecerá una imagen de respaldo para evitar problemas en nuestro diseño. Además, tenemos dos propiedades, `title` y `alt`, que permiten colocar una descripción que aparecerá en la parte inferior de nuestra imagen. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  argTypes: {
    noCaption: {
      options: [true, false],
      control: { type: "boolean" },
    },
  },
  args: {
    alt: "Default image.",
    size: "350px",
  },
  render: (args) => <Image {...args} />,
};

export const WithoutCaption: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `noCaption`, podemos ocultar la descripción de la imagen. Además, esta propiedad no genera conflictos si necesitas colocarle una propiedad `alt` a tu imagen.",
      },
    },
  },
  args: {
    ...Default.args,
    noCaption: true,
    src: "https://images.pexels.com/photos/1545346/pexels-photo-1545346.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    alt: "Autumn season.",
  },
};

export const ImageSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad `size` puedes cambiar el tamaño de tu imagen. Puedes utilizar cualquiera de las más de 60 unidades de medida que existen en CSS.",
      },
    },
  },
  args: {
    title: "Imagen 2.",
    alt: "Montañas.",
    src: "https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91bnRhaW4lMjBsYW5kc2NhcGV8ZW58MHx8MHx8fDA%3D",
    size: "80vw",
  },
};
