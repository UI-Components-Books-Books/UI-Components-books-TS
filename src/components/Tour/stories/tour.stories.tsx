import { useState } from "react";

import { Button, Col,Row, Tour } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TourWithHooks> = {
  title: "Tour",
  component: TourWithHooks,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **Tour** proporciona una guía interactiva paso a paso para ayudar a los usuarios a conocer las funcionalidades de una aplicación.

## Características principales

- **Guía paso a paso**: Resalta elementos específicos de la interfaz secuencialmente
- **Overlay contextual**: Oscurece el resto de la pantalla para enfocar la atención en el elemento actual
- **Navegación flexible**: Permite avanzar, retroceder o cerrar el tour en cualquier momento
- **Posicionamiento inteligente**: Usa Popper.js para posicionar los mensajes de forma óptima
- **Accesible**: Soporta navegación por teclado y lectores de pantalla con atributos ARIA
- **Composición modular**: Usa \`Tour.Layer\` y \`Tour.Modal\` para construir el tour
- **Gestión de foco**: Restaura el foco al elemento correcto al cerrar el tour

## Estructura del componente

El Tour está compuesto por dos subcomponentes:

- **Tour.Layer**: Capa semitransparente que oscurece el contenido y resalta el elemento objetivo
- **Tour.Modal**: Ventana flotante que muestra el contenido de cada paso

## Configuración de pasos

Cada paso del tour se define con:

- \`target\`: Selector CSS del elemento a resaltar
- \`content\`: Contenido del mensaje (texto o JSX)
- \`placement\`: Posición del modal relativa al elemento (top, bottom, left, right, etc.)
- \`distance\`: Distancia en píxeles entre el elemento y el modal
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function TourWithHooks() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const steps = [
    {
      target: ".paragraph",
      content: "Paragraph",
    },
    {
      target: ".download",
      content: "Download button",
    },
    {
      target: ".next",
      content: "Next button",
    },
  ];

  return (
    <>
      <Tour
        steps={steps}
        isOpen={isOpen}
        onClose={toggleModal}
        finalFocusRef=".start"
      >
        <Tour.Layer />
        <Tour.Modal />
      </Tour>

      <Col xs="11" mm="10" md="9" hd="8" lg="7">
        <Button
          label="Start tour"
          addClass="start"
          onClick={() => setIsOpen(!isOpen)}
        />
      </Col>

      <Col xs="11" mm="10" md="9" hd="8" lg="7">
        <p className="paragraph u-my-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus soluta
          minima neque saepe architecto cupiditate impedit mollitia nesciunt
          similique accusantium tempora id enim, placeat omnis in, facere sit
          quasi quisquam doloremque nisi officiis tempore porro temporibus
          voluptatibus? Minus delectus pariatur porro officia deserunt,
          voluptatum totam impedit? Rem recusandae sed ad? Molestias, distinctio
          explicabo. Tenetur quis facere recusandae excepturi reiciendis soluta,
          odio nobis itaque fugit adipisci ut officia corporis eligendi harum.
          Minima in quasi doloribus reiciendis alias, beatae molestiae omnis
          dolores impedit expedita magnam cupiditate quas velit.
        </p>
      </Col>

      <Col xs="11" mm="10" md="9" hd="8" lg="7">
        <Row alignItems="center" justifyContent="space-evenly">
          <Button addClass="download" label="Download" />
          <Button addClass="next" label="Next" />
        </Row>
      </Col>
    </>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Ejemplo básico de un tour con tres pasos. El tour resalta diferentes elementos de la página secuencialmente.

- **Paso 1**: Resalta el párrafo de texto
- **Paso 2**: Resalta el botón de descarga
- **Paso 3**: Resalta el botón siguiente

Haz clic en "Start tour" para iniciar el recorrido guiado.
        `,
      },
    },
  },
  render: () => <TourWithHooks />,
};

export const WithCustomContent: Story = {
  parameters: {
    docs: {
      description: {
        story: "Ejemplo de tour con contenido personalizado en JSX, incluyendo títulos, listas y botones.",
      },
    },
  },
  render: () => {
    function TourWithCustomContent() {
      const [isOpen, setIsOpen] = useState(false);

      const steps = [
        {
          target: ".custom-paragraph",
          content: (
            <div>
              <h3>¡Bienvenido! 👋</h3>
              <p>Este es un tour interactivo con contenido personalizado.</p>
              <ul>
                <li>Puedes usar HTML/JSX</li>
                <li>Añadir listas, imágenes, etc.</li>
                <li>Personalizar completamente el mensaje</li>
              </ul>
            </div>
          ),
          placement: "bottom" as const,
        },
        {
          target: ".custom-button",
          content: (
            <div>
              <h4>Botones interactivos</h4>
              <p>Los botones son elementos importantes de la interfaz.</p>
            </div>
          ),
          placement: "top" as const,
        },
      ];

      return (
        <>
          <Tour
            steps={steps}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            finalFocusRef=".start-custom"
          >
            <Tour.Layer />
            <Tour.Modal />
          </Tour>

          <Col xs="11" mm="10" md="9" hd="8" lg="7">
            <Button
              label="Iniciar tour personalizado"
              addClass="start-custom"
              onClick={() => setIsOpen(true)}
            />
          </Col>

          <Col xs="11" mm="10" md="9" hd="8" lg="7">
            <p className="custom-paragraph u-my-4">
              Este es un párrafo de ejemplo que será resaltado durante el tour.
            </p>
          </Col>

          <Col xs="11" mm="10" md="9" hd="8" lg="7">
            <Button addClass="custom-button" label="Acción importante" />
          </Col>
        </>
      );
    }

    return <TourWithCustomContent />;
  },
};

export const WithDifferentPlacements: Story = {
  parameters: {
    docs: {
      description: {
        story: "Ejemplo que muestra diferentes posiciones (placement) para los mensajes del tour: top, bottom, left, right.",
      },
    },
  },
  render: () => {
    function TourWithPlacements() {
      const [isOpen, setIsOpen] = useState(false);

      const steps = [
        {
          target: ".placement-top",
          content: "Este mensaje aparece en la parte superior (top)",
          placement: "top" as const,
        },
        {
          target: ".placement-bottom",
          content: "Este mensaje aparece en la parte inferior (bottom)",
          placement: "bottom" as const,
        },
        {
          target: ".placement-left",
          content: "Este mensaje aparece a la izquierda (left)",
          placement: "left" as const,
        },
        {
          target: ".placement-right",
          content: "Este mensaje aparece a la derecha (right)",
          placement: "right" as const,
        },
      ];

      return (
        <>
          <Tour
            steps={steps}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            finalFocusRef=".start-placement"
          >
            <Tour.Layer />
            <Tour.Modal />
          </Tour>

          <Col xs="11" mm="10" md="9" hd="8" lg="7">
            <Button
              label="Ver posiciones"
              addClass="start-placement"
              onClick={() => setIsOpen(true)}
            />
          </Col>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "2rem", marginTop: "2rem" }}>
            <Button addClass="placement-top" label="Top" />
            <Button addClass="placement-bottom" label="Bottom" />
            <Button addClass="placement-left" label="Left" />
            <Button addClass="placement-right" label="Right" />
          </div>
        </>
      );
    }

    return <TourWithPlacements />;
  },
};
