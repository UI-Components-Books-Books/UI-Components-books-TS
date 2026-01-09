import { Pagination } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

const meta: Meta<typeof Pagination> = {
  title: "Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Pagination** proporciona navegación por páginas accesible y personalizable.

## Características principales

- **Basado en usePagination hook**: Lógica reutilizable y testeada
- **Botones configurables**: Next, Previous, First, Last (opcionales)
- **Indicador de página actual**: Destacado visualmente
- **Navegación por teclado**: Completa con Tab y Enter
- **Accesible**: Implementa ARIA para lectores de pantalla
- **Responsive**: Se adapta a diferentes tamaños
- **Elipsis inteligentes**: Muestra ... cuando hay muchas páginas
- **Callback onChange**: Notifica cambios de página

## Props principales

- **\`count\`**: Número total de páginas (requerido)
- **\`page\`**: Página actual (controlado)
- **\`defaultPage\`**: Página inicial (no controlado)
- **\`onChange\`**: Callback al cambiar de página
- **\`hideNextButton\`**: Ocultar botón siguiente
- **\`hidePrevButton\`**: Ocultar botón anterior
- **\`showFirstButton\`**: Mostrar botón primera página
- **\`showLastButton\`**: Mostrar botón última página
- **\`siblingCount\`**: Número de páginas visibles a cada lado
- **\`boundaryCount\`**: Número de páginas en los extremos

## Uso típico

\`\`\`tsx
<Pagination 
  count={totalPages}
  page={currentPage}
  onChange={(page) => setCurrentPage(page)}
  showFirstButton
  showLastButton
/>
\`\`\`
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
Paginación básica con 10 páginas.

**Incluye:**
- Botones de siguiente y anterior
- Números de página clickeables
- Página actual destacada
- Elipsis (...) para rangos grandes
- Accesibilidad completa
        `,
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
        story: `
Paginación sin botones de navegación anterior/siguiente.

Usa \`hideNextButton\` y \`hidePrevButton\` para un diseño minimalista que solo muestra los números de página.
        `,
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
        story: `
Paginación completa con botones de primera y última página.

Activa \`showFirstButton\` y \`showLastButton\` para facilitar la navegación rápida en conjuntos de datos grandes.
        `,
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
