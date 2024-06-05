import { StoryObj, Meta } from "@storybook/react";

import { VideoPlayer } from "../src/video-player";

const meta: Meta<typeof VideoPlayer> = {
  title: "Video player",
  component: VideoPlayer,
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
          "El componente `Video` es una personalización del video nativo de HTML. Además, cuenta con diversas funcionalidades como la integración de audio descriptivo. Para su implementación, solo necesitas importar el componente `<Video />`. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  args: {
    width: "600px",
    src: "https://demos.booksandbooksdigital.com.co/120-ovas/ova-98/assets/videos/slide3-1.mp4",
  },
  render: (args) => <VideoPlayer {...args} />,
};

export const AudioDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Utilizando la propiedad `audio` puedes colocar un audio descriptivo al video.",
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
        story:
          "Con la propiedad `caption`, puedes colocar los subtítulos del video. Para ello, debes pasarle un objeto con las propiedades `src`, donde va la ruta de los subtítulos, y la propiedad `lang`, que puede ser 'en' o 'es' para definir el idioma de los subtítulos. Además, ten en cuenta que el archivo de subtítulos debe ser un archivo WebVTT (.vtt).",
      },
    },
  },
  args: {
    ...Default.args,
    caption: {
      src: "https://demos.booksandbooksdigital.com.co/120-ovas/ova-98/assets/videos/slide3-1.vtt",
      lang: "es",
    },
  },
};

export const Poster: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Para agregar un póster al video, puedes usar la propiedad `poster`.",
      },
    },
  },
  args: {
    ...Default.args,
    poster:
      "https://demos.booksandbooksdigital.com.co/ui-components/assets/poster.webp",
  },
};
