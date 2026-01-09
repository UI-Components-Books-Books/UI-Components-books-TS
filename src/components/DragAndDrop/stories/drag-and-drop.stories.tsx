import { useState } from "react";

import { Button ,Col , Row , DragAndDrop } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

import { useDragAndDropContext } from "../src/drag-and-drop-context";

import "../assets/docs.css";

const meta: Meta<typeof DragAndDrop> = {
  title: "DragAndDrop",
  component: DragAndDrop,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function ButtonWithCustomHook() {
  const { handleResetDnd } = useDragAndDropContext();

  return (
    <Button
      label="Try again"
      onClick={handleResetDnd}
      addClass="button-story"
    />
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "El componente `DragAndDrop` permite implementar funcionalidad de arrastrar y soltar de manera sencilla e intuitiva. Construido sobre `@atlaskit/pragmatic-drag-and-drop`, proporciona validación de elementos arrastrables, navegación por teclado con menú contextual, y mecanismos de accesibilidad completos. Para su implementación, importa el componente `<DragAndDrop/>` que incluye los subcomponentes: `<DragAndDrop.Container/>` (contenedor base), `<DragAndDrop.Drag/>` (elemento arrastrable) y `<DragAndDrop.Drop/>` (zona de destino). Puedes arrastrar elementos con el mouse o usar el menú contextual (tres puntos) para moverlos por teclado.",
      },
    },
  },
  args: {
    id: "default-drag",
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container
            id="general-1"
            label="container"
            addClass="drop-story"
          >
            <DragAndDrop.Drag
              id="A"
              label="Draggable item"
              addClass="drag-story"
              dragging="drag-story--active"
            >
              Draggable
            </DragAndDrop.Drag>
            <DragAndDrop.Drag
              id="B"
              label="Draggable item"
              addClass="drag-story"
              dragging="drag-story--active"
            >
              Draggable 2
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop
            id="droppable"
            validate={["A"]}
            label="droppable"
            addClass="drop-story"
          >
            <p>Droppable</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
  render: (args) => <DragAndDrop {...args}></DragAndDrop>,
};

export const DragValidation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "La funcionalidad de validación consta de diferentes propiedades necesarias para su funcionamiento. Cada elemento `<DragAndDrop.Drag/>` necesita una propiedad `id`. Ten en cuenta esto, ya que es importante para los siguientes pasos. El `<DragAndDrop.Drop>` recibe una propiedad `validate`, que es un `array`. En este array se colocan los id de los elementos `<DragAndDrop.Drag/>` que pertenecen a ese elemento `<DragAndDrop.Drop/>`.\n Para ejecutar la validación, el componente `<DragAndDrop/>` recibe la propiedad `validate`. Ten en cuenta que, una vez esta propiedad está en `true`, los demás componentes se bloquearán, impidiendo que sean arrastrados a otros `<DragAndDrop.Drop/>` o incluso al `<DragAndDrop.Container/>`.",
      },
    },
  },
  args: {
    id: "validation-drag",
    validate: false,
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container
            id="general-1"
            label="container"
            addClass="drop-story"
          >
            <DragAndDrop.Drag
              id="A"
              label="Draggable item"
              addClass="drag-story"
              dragging="drag-story--active"
            >
              Draggable A
            </DragAndDrop.Drag>
            <DragAndDrop.Drag
              id="B"
              label="Draggable item"
              addClass="drag-story"
              dragging="drag-story--active"
            >
              Draggable B
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col md="12">
          <Row justify-content="center" align-items="center">
            <Col xs="11" mm="10" md="9" lg="5" hd="4">
              <DragAndDrop.Drop
                id="droppable"
                validate={["B"]}
                label="droppable"
                addClass="drop-story"
              >
                <p>Droppable B</p>
              </DragAndDrop.Drop>
            </Col>
            <Col xs="11" mm="10" md="9" lg="5" hd="4">
              <DragAndDrop.Drop
                id="droppable-2"
                validate={["A"]}
                label="droppable"
                addClass="drop-story"
              >
                <p>Droppable A</p>
              </DragAndDrop.Drop>
            </Col>
          </Row>
        </Col>
      </Row>
    ),
  },
  render: function Render(args) {
    const [validate, setValidate] = useState<boolean>(false);

    const handleValidation = () => {
      setValidate(!validate);
    };

    return (
      <>
        <DragAndDrop {...args} validate={validate}></DragAndDrop>
        <Button onClick={handleValidation} addClass="button-story">
          Check
        </Button>
      </>
    );
  },
};

export const ResetDrag: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Para reiniciar el estado del componente y devolver todos los elementos a su posición inicial, utiliza la función `handleResetDnd` del custom hook `useDragAndDropContext`. Este hook debe ser usado dentro de un componente que sea hijo de `<DragAndDrop/>`. El reset también limpia todas las validaciones activas.",
      },
    },
  },
  args: {
    id: "validation-drag",
    children: (
      <>
        <Row justify-content="center" align-items="center">
          <Col xs="11" mm="10" md="9" lg="5" hd="4">
            <DragAndDrop.Container
              id="general-1"
              label="container"
              addClass="drop-story"
            >
              <DragAndDrop.Drag
                id="A"
                label="Draggable item"
                addClass="drag-story"
                dragging="drag-story--active"
              >
                Draggable A
              </DragAndDrop.Drag>
            </DragAndDrop.Container>
          </Col>
          <Col md="12">
            <Row justify-content="center" align-items="center">
              <Col xs="11" mm="10" md="9" lg="5" hd="4">
                <DragAndDrop.Drop
                  id="droppable"
                  validate={["A"]}
                  label="droppable"
                  addClass="drop-story"
                >
                  <p>Droppable B</p>
                </DragAndDrop.Drop>
              </Col>
            </Row>
          </Col>
        </Row>
        <ButtonWithCustomHook />
      </>
    ),
  },
  render: (args) => <DragAndDrop {...args}></DragAndDrop>,
};

export const AccesibilityDrag: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "El componente incluye características de accesibilidad integradas: **Navegación por teclado**: Usa Tab para navegar entre elementos arrastrables y Enter/Espacio para abrir el menú contextual de movimiento. **ARIA**: Todos los elementos incluyen roles y etiquetas ARIA apropiadas (buttons tienen `aria-label`, contenedores tienen `role='region'`, menús tienen `role='menu'`). **Anuncios**: Usa la prop `announcements` (una función que se ejecuta después de mover un elemento) para proporcionar feedback auditivo personalizado a lectores de pantalla. El menú contextual permite mover elementos sin necesidad del mouse.",
      },
    },
  },
  args: {
    id: "accessibility-drag",
    announcements: () => {
      // Esta función se ejecuta después de cada movimiento
      // Aquí podrías activar un anuncio de lector de pantalla
      console.log('Elemento movido');
    },
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container
            id="general-1"
            label="Contenedor principal con elementos arrastrables"
            addClass="drop-story"
          >
            <DragAndDrop.Drag
              id="A"
              label="Elemento A"
              addClass="drag-story"
              dragging="drag-story--active"
            >
              Elemento A (usa Tab y Enter para el menú)
            </DragAndDrop.Drag>
            <DragAndDrop.Drag
              id="B"
              label="Elemento B"
              addClass="drag-story"
              dragging="drag-story--active"
            >
              Elemento B
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop
            id="droppable"
            validate={["A"]}
            label="Zona de destino para elemento A"
            addClass="drop-story"
          >
            <p>Suelta el elemento aquí</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
  render: (args) => <DragAndDrop {...args}></DragAndDrop>,
};

export const DragStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Personaliza la apariencia del componente usando la prop `addClass` disponible en `<DragAndDrop.Container/>`, `<DragAndDrop.Drag/>` y `<DragAndDrop.Drop/>`. **Estilos de validación**: Durante la validación, cada `<DragAndDrop.Drag/>` recibe el atributo `data-validation` con valor `true` (está en la posición correcta) o `false` (posición incorrecta). Usa este atributo en tus selectores CSS para aplicar estilos dinámicos: `.drag-story[data-validation='true']` o `.drag-story[data-validation='false']`.",
      },
    },
  },
  args: {
    id: "styling-drag",
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container
            id="general-1"
            label="container"
            addClass="drop-story"
          >
            <DragAndDrop.Drag
              id="A"
              label="Draggable item"
              addClass="drag-story"
              dragging="drag-story--active"
            >
              Draggable
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop
            id="droppable"
            validate={["A"]}
            label="droppable"
            addClass="drop-story"
          >
            <p>Droppable</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
};

export const MultipleDragsAndContextMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "El componente soporta múltiples elementos en un mismo contenedor con la prop `multipleDrags={true}`. **Menú contextual**: Haz clic en el ícono de tres puntos (⋮) o usa el teclado (Tab + Enter) para abrir un menú con opciones de movimiento. Puedes mover elementos a otros contenedores o reordenarlos dentro del mismo contenedor usando las opciones: `top` (al inicio), `up` (una posición arriba), `down` (una posición abajo), `bottom` (al final). Esta funcionalidad mejora significativamente la accesibilidad del componente.",
      },
    },
  },
  args: {
    id: "multiple-drags",
    multipleDrags: true,
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container
            id="general-1"
            label="Contenedor con múltiples elementos"
            addClass="drop-story"
          >
            <DragAndDrop.Drag
              id="A"
              label="Elemento A"
              addClass="drag-story"
            >
              Elemento A - Haz clic en ⋮
            </DragAndDrop.Drag>
            <DragAndDrop.Drag
              id="B"
              label="Elemento B"
              addClass="drag-story"
            >
              Elemento B
            </DragAndDrop.Drag>
            <DragAndDrop.Drag
              id="C"
              label="Elemento C"
              addClass="drag-story"
            >
              Elemento C
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop
            id="droppable"
            validate={["A", "B", "C"]}
            label="Zona de destino (acepta múltiples)"
            addClass="drop-story"
          >
            <p>Suelta múltiples elementos aquí</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
  render: (args) => <DragAndDrop {...args}></DragAndDrop>,
};

export const StateManagement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Controla el estado del DragAndDrop externamente usando `defaultState`, `defaultValidate` y `onState`. **defaultState**: Define la posición inicial de los elementos (objeto donde las keys son IDs de contenedores y los valores son arrays de IDs de draggables). **defaultValidate**: Array de IDs de elementos validados inicialmente. **onState**: Callback que se ejecuta cada vez que el estado cambia, recibe `{id, state, validateId}` permitiéndote sincronizar con tu estado de aplicación.",
      },
    },
  },
  render: function Render() {
    const [state, setState] = useState<Record<string, string[]>>({
      "general-1": ["A", "B"],
      "droppable": []
    });
    const [validatedIds, setValidatedIds] = useState<string[]>([]);

    return (
      <>
        <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f5f5f5" }}>
          <h4>Estado actual:</h4>
          <pre>{JSON.stringify(state, null, 2)}</pre>
          <h4>Elementos validados:</h4>
          <pre>{JSON.stringify(validatedIds, null, 2)}</pre>
        </div>
        <DragAndDrop
          id="state-management"
          defaultState={state}
          defaultValidate={validatedIds}
          onState={({ state: newState, validateId }) => {
            setState(newState);
            setValidatedIds(validateId);
          }}
        >
          <Row justify-content="center" align-items="center">
            <Col xs="11" mm="10" md="9" lg="5" hd="4">
              <DragAndDrop.Container
                id="general-1"
                label="container"
                addClass="drop-story"
              >
                <DragAndDrop.Drag
                  id="A"
                  label="Draggable A"
                  addClass="drag-story"
                >
                  Draggable A
                </DragAndDrop.Drag>
                <DragAndDrop.Drag
                  id="B"
                  label="Draggable B"
                  addClass="drag-story"
                >
                  Draggable B
                </DragAndDrop.Drag>
              </DragAndDrop.Container>
            </Col>
            <Col xs="11" mm="10" md="9" lg="5" hd="4">
              <DragAndDrop.Drop
                id="droppable"
                validate={["A", "B"]}
                label="droppable"
                addClass="drop-story"
              >
                <p>Droppable</p>
              </DragAndDrop.Drop>
            </Col>
          </Row>
        </DragAndDrop>
      </>
    );
  },
};
