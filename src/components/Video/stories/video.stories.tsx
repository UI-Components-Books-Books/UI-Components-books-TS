import { VideoPlayer } from "@components";
import { StoryObj, Meta } from "@storybook/react-vite";

const meta: Meta<typeof VideoPlayer> = {
  title: "Video player",
  component: VideoPlayer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **VideoPlayer** es un reproductor de video personalizado y altamente accesible que extiende las capacidades del elemento HTML5 \`<video>\`.

## Características principales

- **Audio descriptivo integrado**: Soporte completo para pistas de audio descriptivo con controles dedicados
- **Subtítulos (Captions)**: Compatible con archivos WebVTT para subtítulos en múltiples idiomas
- **Controles personalizados**: Interfaz completa con play/pause, barra de progreso, volumen, velocidad de reproducción
- **Picture-in-Picture**: Permite ver el video en una ventana flotante mientras navegas
- **Pantalla completa**: Modo de pantalla completa con todos los controles accesibles
- **Navegación por teclado**: Completamente navegable con atajos de teclado
- **Accesible**: Cumple con estándares WCAG con soporte para lectores de pantalla
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## Controles de teclado

- **Espacio / Enter**: Play/Pause
- **Flecha arriba/abajo**: Ajustar volumen
- **Flecha izquierda/derecha**: Retroceder/Avanzar 5 segundos
- **M**: Silenciar/Activar sonido
- **F**: Pantalla completa
- **C**: Activar/Desactivar subtítulos

## Audio descriptivo

El reproductor incluye un toolbar especializado para el audio descriptivo que permite:
- Activar/desactivar el audio descriptivo
- Controlar el volumen del audio descriptivo independientemente del video
- Controlar la reproducción del video desde el mismo toolbar

## Accesibilidad

- Atributos ARIA apropiados en todos los controles
- Anuncios en vivo para cambios de estado
- Gestión de foco durante la interacción
- Soporte completo para lectores de pantalla
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
Ejemplo básico del reproductor de video con controles estándar.

**Características incluidas:**
- Controles de reproducción (play, pause, stop)
- Barra de progreso interactiva
- Control de volumen
- Selector de velocidad de reproducción
- Modo picture-in-picture
- Modo pantalla completa

Haz clic en **Show code** en la parte inferior para ver el código de implementación.
        `,
      },
    },
  },
  args: {
    width: "900px",
    src: "https://demos.booksandbooksdigital.com.co/120-ovas-2023/ovas/ova-41/assets/videos/120 OVAS-24 - OVA_41 - SLD 3.mp4",
  },
  render: (args) => <VideoPlayer {...args} />,
};

export const AudioDescription: Story = {
  parameters: {
    docs: {
      description: {
        story: `
El reproductor soporta **audio descriptivo** para mejorar la accesibilidad del contenido.

**Características del audio descriptivo:**
- Toolbar dedicado con controles especializados
- Volumen independiente del video principal
- Controles de reproducción sincronizados
- Botones para avanzar/retroceder 10 segundos
- Se puede activar/desactivar durante la reproducción

Utiliza la prop \`audio\` para proporcionar la URL del archivo de audio descriptivo (formato MP3 recomendado).
        `,
      },
    },
  },
  args: {
    ...Default.args,
    audio:
      "https://demos.booksandbooksdigital.com.co/ui-components/assets/slide3-1-description.mp3",
  },
};

export const Captions: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Los **subtítulos (captions)** permiten hacer el contenido accesible para personas con discapacidad auditiva.

**Configuración de subtítulos:**

\`\`\`typescript
caption: {
  src: "./ruta/archivo.vtt",  // Ruta al archivo WebVTT
  lang: "es" | "en"           // Idioma: español o inglés
}
\`\`\`

**Formato WebVTT:**
Los subtítulos deben estar en formato WebVTT (.vtt). Este es el estándar para subtítulos en HTML5.

**Control de subtítulos:**
Los usuarios pueden activar/desactivar los subtítulos usando:
- El botón CC en la barra de controles
- La tecla **C** del teclado
        `,
      },
    },
  },
  args: {
    ...Default.args,
    caption: {
      src: "./assets/120 OVAS-24 - OVA_41 - SLD 3.vtt",
      lang: "es",
    },
  },
};

export const Poster: Story = {
  parameters: {
    docs: {
      description: {
        story: `
La prop \`poster\` permite mostrar una **imagen de portada** antes de que el video comience a reproducirse.

**Beneficios:**
- Mejora la experiencia visual inicial
- Proporciona contexto sobre el contenido del video
- Reduce el tiempo de carga percibido
- Formatos recomendados: JPEG, PNG, WebP

**Consejo:** Usa imágenes optimizadas para web para mejorar el rendimiento.
        `,
      },
    },
  },
  args: {
    ...Default.args,
    poster:
      "https://demos.booksandbooksdigital.com.co/ui-components/assets/poster.webp",
  },
};

export const Complete: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Ejemplo completo que combina todas las características del reproductor:
- **Audio descriptivo** para accesibilidad
- **Subtítulos** en español
- **Póster** de portada
- Todos los controles disponibles

Este es un ejemplo de implementación completa ideal para contenido educativo o de e-learning.
        `,
      },
    },
  },
  args: {
    width: "900px",
    src: "https://demos.booksandbooksdigital.com.co/120-ovas-2023/ovas/ova-41/assets/videos/120 OVAS-24 - OVA_41 - SLD 3.mp4",
    audio: "https://demos.booksandbooksdigital.com.co/ui-components/assets/slide3-1-description.mp3",
    caption: {
      src: "./assets/120 OVAS-24 - OVA_41 - SLD 3.vtt",
      lang: "es",
    },
    poster: "https://demos.booksandbooksdigital.com.co/ui-components/assets/poster.webp",
  },
  render: (args) => <VideoPlayer {...args} />,
};

export const CustomWidth: Story = {
  parameters: {
    docs: {
      description: {
        story: `
El reproductor se adapta al ancho especificado. Puedes usar diferentes unidades:
- Píxeles: \`"600px"\`
- Porcentaje: \`"100%"\`
- Viewport: \`"80vw"\`

El reproductor mantiene las proporciones del video automáticamente.
        `,
      },
    },
  },
  args: {
    ...Default.args,
    width: "600px",
  },
  render: (args) => <VideoPlayer {...args} />,
};
