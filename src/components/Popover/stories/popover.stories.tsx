import { Button,  Popover } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Popover> = {
  title: "Popover",
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Popover** muestra contenido flotante contextual al hacer click.

## Características principales

- **Composable**: Usa \`Popover.Button\` y \`Popover.Content\`
- **Posicionamiento inteligente**: Powered by Popper.js
- **12 posiciones**: top, bottom, left, right y sus variantes
- **Click outside**: Cierra al interactuar fuera (configurable)
- **Navegación por teclado**: ESC para cerrar
- **Trap focus**: Mantiene el foco dentro del popover
- **Accesible**: Implementa WAI-ARIA disclosure pattern
- **Portal**: Se renderiza fuera del flujo del DOM

## Composición

\`\`\`tsx
<Popover placement="bottom">
  <Popover.Button>
    <Button>Abrir</Button>
  </Popover.Button>
  <Popover.Content>
    {/* Tu contenido aquí */}
  </Popover.Content>
</Popover>
\`\`\`

## Diferencia con Tooltip

- **Popover**: Click para activar, contenido interactivo
- **Tooltip**: Hover para activar, solo informativo

## Casos de uso

- Menús desplegables
- Formularios en contexto
- Confirmaciones
- Información adicional interactiva
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
Popover básico con contenido interactivo.

**Características:**
- Abre con click en el botón
- Cierra con click fuera o ESC
- Puede contener botones y elementos interactivos
- Posicionamiento automático
        `,
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
  render: (args) => <Popover {...args}></Popover>,
};

export const DisabledInteractionOutside: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Popover que NO se cierra al hacer click fuera.

Usa \`disabledInteractOutside\` en \`Popover.Content\` cuando necesites que el usuario interactúe explícitamente con el contenido.

Útil para:
- Formularios que requieren completarse
- Confirmaciones importantes
- Contenido que no debe ignorarse
        `,
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content disabledInteractOutside>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
};

export const HasArrow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad hasArrow presente en el `<Popover.Content/>`, podemos agregar una flecha a nuestro popover.",
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content hasArrow>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
};

export const Placement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto, el componente se ubica automáticamente en la posición que permita visualizar correctamente su contenido. Sin embargo, si necesitas que esté en una posición específica, puedes usar la propiedad `placement` del `<Popover.Content/>`.",
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content placement="left-start" hasArrow isDisabled>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
};

export const Distance: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `distance` presente en el `<Popover.Content />`, podemos modificar la distancia entre nuestro `<Popover.Button />` y el `<Popover.Content />`.",
      },
    },
  },
  args: {
    children: (
      <>
        <Popover.Button>
          <Button>Open popover</Button>
        </Popover.Button>
        <Popover.Content placement="top-start" hasArrow distance={90}>
          <p style={{ marginBlock: "2rem" }}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit.
            Blanditiis, ipsam!
          </p>
          <Button>Learn more</Button>
        </Popover.Content>
      </>
    ),
  },
};
