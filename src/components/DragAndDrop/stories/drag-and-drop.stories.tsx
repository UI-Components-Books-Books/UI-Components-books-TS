import { useState } from "react";

import { Button ,Col , Row , DragAndDrop } from "@components";
import type { StoryObj, Meta } from "@storybook/react";

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
          "El componente `DragAndDrop` nos permite usar la HTML Drag and Drop API de una forma más sencilla e intuitiva. Construido a partir del paquete `@dnd-kit`, este componente provee diferentes funcionalidades, tales como la validación de los elementos arrastrables y todos los mecanismos necesarios para que sea accesible para personas con discapacidades. Para su implementación, solo necesitamos importar el componente `<DragAndDrop/>`. Este incluye los componentes `<DragAndDrop.Container/>`, `<DragAndDrop.Drag/>` y `<DragAndDrop.Drop/>`, necesarios para su uso. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
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
          "Continuando con el tema de validación, para reiniciar tu `<DragAndDrop/>`necesitas usar la función `handleResetDnd` proveniente del custom hook `useDragAndDropContext`.",
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
          "Con respecto al tema de accesibilidad (a11y), puedes utilizar las propiedades `screenReaderInstructions` y `announcement`. Cuando enfocamos un elemento `<DragAndDrop.Drag/>` utilizando un lector de pantalla, la propiedad `screenReaderInstructions` será leída por este. En otras palabras, esta propiedad se encarga de explicar al usuario con discapacidad cómo usar el componente a través del teclado. Por otro lado, cuando interactuamos con un `<DragAndDrop.Drag/>`, el lector de pantalla verbalizará los diferentes estados, tales como: `onDragStart` (cuando se agarra el elemento), `onDragOver` (cuando se mueve), `onDragEnd` (cuando se suelta) y `onDragCancel` (cuando se cancela el arrastre).",
      },
    },
  },
  args: {
    ...Default.args,
    screenReaderInstructions:
      "He cambiado la instrucción de como se debe usar el DragAndDrop",
    announcements: {
      onDragStart({ active }) {
        return `Se ha agarrado el elemento arrastrable ${active.data.current?.label}.`;
      },
      onDragOver({ active, over }) {
        if (over) {
          return `El elemento arrastrable ${active.data.current?.label} se movió sobre la área desplegable ${over.data.current?.label}.`;
        }

        return `El elemento arrastrable ${active.data.current?.label} ya no está sobre una área desplegable.`;
      },
      onDragEnd({ active, over }) {
        if (over) {
          return `El elemento arrastrable ${active.data.current?.label} se soltó sobre la área desplegable ${over.data.current?.label}.`;
        }

        return `El elemento arrastrable item ${active.data.current?.label} se eliminó.`;
      },
      onDragCancel({ active }) {
        return `Se cancelo el arrastre. El elemento arrastrable ${active.data.current?.label} se eliminó.`;
      },
    },
  },
};

export const DragStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Si necesitas personalizar completamente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`, la cual es aceptada por los componentes `<DragAndDrop.Container/>`, `<DragAndDrop.Drag/>` y `<DragAndDrop.Drop/>`. En cuanto a la validación, puedes utilizar el valor de la propiedad `propValidate`. Durante la validación, cada elemento `<DragAndDrop.Drag/>` recibirá un valor `true` o `false`. Un valor `true` indica que el `<DragAndDrop.Drag/>` está en el `<DragAndDrop.Drop/>` correcto, mientras que `false` significa lo contrario. Por defecto, `propValidate` tiene el valor de `'data-validation'`, pero puedes modificarlo según tus necesidades.",
      },
    },
  },
  args: {
    ...Default.args,
    propValidate: "data-drag-validation-ome",
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
