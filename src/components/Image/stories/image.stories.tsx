import { Image } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";


const meta: Meta<typeof Image> = {
  title: "Image",
  component: Image,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Image** gestiona imágenes con fallback automático y caption opcional.

## Características principales

- **Imagen de fallback**: Muestra imagen placeholder si falla la carga
- **Caption integrado**: Descripción bajo la imagen con \`title\` y \`alt\`
- **Caption opcional**: Se puede ocultar con \`noCaption\`
- **Tamaño configurable**: Control del ancho con \`size\`
- **Accesible**: Atributo \`alt\` para lectores de pantalla
- **Lazy loading**: Carga diferida opcional
- **Responsive**: Se adapta al contenedor

## Buenas prácticas

- Siempre proporciona un \`alt\` descriptivo
- Usa \`title\` para contexto adicional
- El \`alt\` debe describir el contenido, no repetir el \`title\`
- Para imágenes decorativas, usa \`alt=""\`

## Caption vs noCaption

- Por defecto, muestra caption con \`title\` o \`alt\`
- Usa \`noCaption={true}\` para ocultar, manteniendo \`alt\` accesible
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
Imagen básica con caption visible.

**Características:**
- Imagen de fallback si \`src\` no está disponible
- Caption generado automáticamente desde \`alt\` o \`title\`
- Tamaño configurable con la prop \`size\`
        `,
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
        story: `
Imagen sin caption visible usando \`noCaption={true}\`.

**Importante:** El atributo \`alt\` se mantiene para accesibilidad aunque el caption esté oculto. Los lectores de pantalla seguirán accediendo a la descripción.
        `,
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
