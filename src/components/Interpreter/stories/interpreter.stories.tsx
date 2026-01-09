import { Interpreter } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

const meta: Meta<typeof Interpreter> = {
  title: "Interpreter",
  component: Interpreter,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
El componente **Interpreter** proporciona una ventana flotante para visualizar intérpretes de lenguaje de señas, mejorando la accesibilidad del contenido multimedia.

## Características principales

- **Ventana flotante arrastrable**: Los usuarios pueden mover el intérprete por la pantalla según sus preferencias
- **Múltiples videos**: Soporta dos tipos de videos (descriptivo y de contenido) que se pueden alternar
- **Control de zoom**: Permite aumentar el tamaño del intérprete con niveles de zoom ajustables
- **Eventos personalizados**: Comunica el estado del intérprete mediante eventos del DOM
- **Accesible**: Botones con labels descriptivos y soporte para navegación por teclado

## Integración con eventos

El componente escucha el evento personalizado \`changeInterpreteVideoSources\` para actualizar las URLs de los videos:

\`\`\`javascript
const event = new CustomEvent('changeInterpreteVideoSources', {
  detail: {
    accesibilityURL: 'https://ejemplo.com/video-descriptivo.mp4',
    contentURL: 'https://ejemplo.com/video-contenido.mp4'
  }
});
document.dispatchEvent(event);
\`\`\`

Y emite el evento \`changeInterpreteVideoVisibility\` cuando cambia su estado de visibilidad.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Ejemplo básico del intérprete. Haz clic en el botón flotante para abrir el intérprete. Para que muestre videos, debes despachar un evento personalizado con las URLs.",
      },
    },
  },
  render: () => <Interpreter />,
};

export const WithCustomIcon: Story = {
  parameters: {
    docs: {
      description: {
        story: "Puedes personalizar el ícono del botón flotante usando la prop `icon`.",
      },
    },
  },
  render: () => (
    <Interpreter
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
      }
    />
  ),
};

export const WithVideos: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Ejemplo que muestra cómo enviar las URLs de los videos al intérprete mediante eventos personalizados.
Abre el intérprete y verás que puedes alternar entre dos videos diferentes.
        `,
      },
    },
  },
  render: () => {
    // Simular el envío de URLs cuando el componente se monta
    setTimeout(() => {
      const event = new CustomEvent("changeInterpreteVideoSources", {
        detail: {
          accesibilityURL: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
          contentURL: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
      });
      document.dispatchEvent(event);
    }, 100);

    return <Interpreter />;
  },
};
