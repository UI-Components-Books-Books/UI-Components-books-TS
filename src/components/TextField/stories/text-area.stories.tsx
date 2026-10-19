import { useState } from "react";

import { TextArea } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

const meta: Meta<typeof TextArea> = {
  title: "TextArea",
  component: TextArea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **TextArea** es el campo de texto de **varias líneas**. Comparte con \`TextField\` la etiqueta, la ayuda, el mensaje de error y el resultado de una actividad.

## Características principales

- **Etiqueta obligatoria**: siempre da el nombre accesible; puede ocultarse visualmente
- **Ayuda y error**: enlazados al campo con \`aria-describedby\`; el error marca el campo con \`aria-invalid\`
- **Resultado de actividad**: \`state\` (\`normal\`, \`right\`, \`wrong\`), con la misma convención que \`CheckBox\`, \`Radio\` y \`TextField\`
- **Líneas visibles**: \`rows\` (4 por defecto); el usuario puede cambiar el alto arrastrando la esquina
- **Tamaños**: small, normal y big
- **Sin estado propio**: es controlado o no controlado, como un \`<textarea>\`; \`ref\` y el resto de atributos pasan al \`<textarea>\`
- **Personalizable**: usa las mismas variables CSS \`--text-field-*\` que \`TextField\`

## Uso ideal

- Respuestas abiertas y reflexiones en actividades
- Comentarios y mensajes en formularios

Para una sola línea (nombre, correo, huecos de una frase) usa \`TextField\`.

## Accesibilidad

- La etiqueta es un \`<label>\` asociado al \`<textarea>\`; con \`isLabelVisible={false}\` se oculta pero se sigue leyendo.
- La ayuda, el error y el resultado se leen al enfocar el campo (\`aria-describedby\`).
- El resultado nunca depende solo del color: lleva un icono, un texto para lectores de pantalla («Correcto» / «Incorrecto», reemplazables con \`messages\`) y un borde distinto (continuo si es correcto, discontinuo si es incorrecto).
- Un contador de caracteres puede ir en la ayuda (ver **CharacterCount**). No lo anuncies en cada pulsación con una región en vivo: sería ruido para quien escribe.
- No bloquea pegar.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(30rem, 90vw)" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Campo básico con la etiqueta visible. Es controlado o no controlado, como un \`<textarea>\` normal.
        `,
      },
    },
  },
  argTypes: {
    size: {
      options: ["small", "normal", "big"],
      control: { type: "radio" },
    },
    state: {
      options: ["normal", "right", "wrong"],
      control: { type: "radio" },
    },
    rows: {
      control: { type: "number", min: 2, max: 20 },
    },
  },
  args: {
    label: "Comentario",
  },
};

export const WithHint: Story = {
  parameters: {
    docs: {
      description: {
        story: `
La ayuda se enlaza con \`aria-describedby\`, así que se lee al enfocar el campo.
        `,
      },
    },
  },
  args: {
    label: "¿Qué aprendiste en esta unidad?",
    hint: "Escribe al menos dos frases con tus propias palabras",
  },
};

export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Si pasas \`error\`, el campo se marca con \`aria-invalid\`, el mensaje se lee al enfocarlo y el borde cambia a discontinuo con un icono. El icono va arriba, apartado de la barra de desplazamiento.
        `,
      },
    },
  },
  args: {
    label: "Comentario",
    defaultValue: "Bien.",
    error: "Escribe al menos dos frases para que podamos ayudarte.",
  },
};

const MAX = 120;

const CharacterCountExample = () => {
  const [value, setValue] = useState("");

  return (
    <TextArea
      label="Resumen"
      maxLength={MAX}
      hint={`${value.length} de ${MAX} caracteres`}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
};

export const CharacterCount: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Un contador de caracteres en la ayuda. La ayuda es la descripción del campo, así que se lee al enfocarlo y se actualiza sin interrumpir a quien escribe. \`maxLength\` impide pasarse del límite.
        `,
      },
    },
  },
  render: () => <CharacterCountExample />,
};

const ValidationExample = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  const validate = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter((sentence) => sentence.trim()).length;
    if (sentences === 0) return "Escribe tu respuesta.";
    if (sentences === 1) return "Solo hay una frase. Añade al menos una más.";
    return undefined;
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setError(validate(value));
      }}
      style={{ display: "grid", gap: "0.75rem" }}
    >
      <TextArea
        label="¿Qué aprendiste en esta unidad?"
        required
        hint="Escribe al menos dos frases"
        value={value}
        error={error}
        onChange={(event) => {
          setValue(event.target.value);
          if (error) setError(validate(event.target.value));
        }}
        onBlur={() => setError(validate(value))}
      />
      <button type="submit">Enviar</button>
    </form>
  );
};

export const Validation: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Un formulario con validación propia: el error aparece al salir del campo o al enviar, y se corrige mientras se escribe. El marcador **\\*** de \`required\` es visual: los lectores de pantalla leen el atributo \`required\`.
        `,
      },
    },
  },
  render: () => <ValidationExample />,
};

const KEY_IDEAS = ["luz", "agua", "glucosa"] as const;

const ActivityExample = () => {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  const found = KEY_IDEAS.filter((idea) => answer.toLowerCase().includes(idea)).length;
  const state = !checked ? "normal" : found >= 2 ? "right" : "wrong";

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <TextArea
        label="Explica con tus palabras qué es la fotosíntesis"
        hint="Menciona al menos dos de estas ideas: luz, agua y glucosa"
        state={state}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" onClick={() => setChecked(true)}>
          Comprobar
        </button>
        <button
          type="button"
          onClick={() => {
            setAnswer("");
            setChecked(false);
          }}
        >
          Reiniciar
        </button>
      </div>
      {/* Un resumen para toda la actividad: avisa una sola vez. */}
      <p role="status">{checked ? `Mencionaste ${found} de ${KEY_IDEAS.length} ideas clave.` : ""}</p>
    </div>
  );
};

export const ActivityResult: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Una pregunta abierta. Al comprobar, el campo recibe \`state\` \`right\` o \`wrong\`: se ve por el icono y el borde (continuo o discontinuo) y se lee al enfocarlo («Correcto» / «Incorrecto»).

El resumen va en una región \`role="status"\` de la actividad, así se anuncia una sola vez. Al reiniciar, \`state\` vuelve a \`normal\`.
        `,
      },
    },
  },
  render: () => <ActivityExample />,
};

export const Rows: Story = {
  parameters: {
    docs: {
      description: {
        story: `
\`rows\` define las líneas visibles y los tres tamaños cambian el texto. El usuario puede cambiar el alto arrastrando la esquina inferior derecha.
        `,
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <TextArea label="Pequeño, 2 líneas" size="small" rows={2} />
      <TextArea label="Normal, 4 líneas" size="normal" />
      <TextArea label="Grande, 6 líneas" size="big" rows={6} />
      <TextArea label="Deshabilitado" defaultValue="No se puede cambiar" disabled rows={2} />
    </div>
  ),
};
