import { useState } from "react";

import { TextField } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

const meta: Meta<typeof TextField> = {
  title: "TextField",
  component: TextField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **TextField** es un campo de texto de una línea, con etiqueta, ayuda, mensaje de error y el resultado de una actividad.

## Características principales

- **Etiqueta obligatoria**: siempre da el nombre accesible; puede ocultarse visualmente
- **Ayuda y error**: enlazados al campo con \`aria-describedby\`; el error marca el campo con \`aria-invalid\`
- **Resultado de actividad**: \`state\` (\`normal\`, \`right\`, \`wrong\`), con la misma convención que \`CheckBox\` y \`Radio\`
- **En línea**: para completar una frase
- **Tipos**: \`text\`, \`email\`, \`tel\`, \`url\`, \`search\` y \`password\` (para números usa \`NumberInput\`)
- **Tamaños**: small, normal y big
- **Sin estado propio**: es controlado o no controlado, como un \`<input>\`; \`ref\` y el resto de atributos pasan al input
- **Personalizable**: todos los colores son variables CSS \`--text-field-*\`

## Uso ideal

- Respuestas libres en actividades (completar frases, respuestas cortas)
- Formularios (nombre, correo, teléfono)

Para varias líneas usa \`TextArea\`.

## Accesibilidad

- La etiqueta es un \`<label>\` asociado al input; con \`isLabelVisible={false}\` se oculta pero se sigue leyendo.
- La ayuda, el error y el resultado se leen al enfocar el campo (\`aria-describedby\`).
- El resultado nunca depende solo del color: lleva un icono, un texto para lectores de pantalla («Correcto» / «Incorrecto», reemplazables con \`messages\`) y un borde distinto (continuo si es correcto, discontinuo si es incorrecto).
- No hay una región en vivo por campo: al comprobar varios campos a la vez sería ruido. Anuncia el resumen en la actividad (ver la historia **ActivityResult**).
- Admite \`autoComplete\` para que el navegador rellene datos personales, y no bloquea pegar.

## Colores

\`\`\`css
.mi-actividad {
  --text-field-right: #1b6e3c;
  --text-field-wrong: #a4262c;
}
\`\`\`

Los valores por defecto son grises y cumplen los contrastes de WCAG sobre fondo blanco. Si pones otros colores, comprueba que el texto tenga al menos 4.5:1 y los bordes e iconos 3:1.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "min(26rem, 90vw)" }}>
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
Campo básico con la etiqueta visible. Es controlado o no controlado, como un \`<input>\` normal.
        `,
      },
    },
  },
  argTypes: {
    size: {
      options: ["small", "normal", "big"],
      control: { type: "radio" },
    },
    type: {
      options: ["text", "email", "tel", "url", "search", "password"],
      control: { type: "select" },
    },
    state: {
      options: ["normal", "right", "wrong"],
      control: { type: "radio" },
    },
  },
  args: {
    label: "Nombre completo",
    autoComplete: "name",
  },
};

export const HiddenLabel: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Con \`isLabelVisible={false}\` la etiqueta se oculta visualmente pero sigue dando el nombre accesible. Úsalo solo cuando el texto que rodea el campo ya lo explique a la vista.
        `,
      },
    },
  },
  args: {
    label: "Buscar en el glosario",
    isLabelVisible: false,
    type: "search",
    placeholder: "Buscar en el glosario",
  },
};

export const WithHint: Story = {
  parameters: {
    docs: {
      description: {
        story: `
La ayuda (formato esperado o un ejemplo) se enlaza con \`aria-describedby\`, así que se lee al enfocar el campo.
        `,
      },
    },
  },
  args: {
    label: "Teléfono",
    type: "tel",
    autoComplete: "tel",
    hint: "Con el indicativo del país, por ejemplo +57 300 123 4567",
  },
};

export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Si pasas \`error\`, el campo se marca con \`aria-invalid\`, el mensaje se lee al enfocarlo y el borde cambia a discontinuo con un icono. El mensaje debe decir qué falló y cómo corregirlo.
        `,
      },
    },
  },
  args: {
    label: "Correo electrónico",
    type: "email",
    autoComplete: "email",
    defaultValue: "ana.correo.com",
    error: "Falta la arroba (@). Escribe un correo como nombre@institucion.edu.",
  },
};

const ValidationExample = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  const validate = (text: string) => {
    if (!text.trim()) return "Escribe tu correo.";
    if (!text.includes("@")) return "Falta la arroba (@). Escribe un correo como nombre@institucion.edu.";
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
      <TextField
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        hint="El de tu institución"
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
Un formulario con validación propia: el error aparece al salir del campo o al enviar, y se corrige mientras se escribe. Con \`noValidate\` el navegador no muestra sus propios mensajes.

El marcador **\\*** de \`required\` es visual: los lectores de pantalla leen el atributo \`required\`. Explica en el formulario qué significa.
        `,
      },
    },
  },
  render: () => <ValidationExample />,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Deshabilitado y de solo lectura. Un campo deshabilitado no recibe el foco; si el usuario debe poder leerlo o copiarlo, usa \`readOnly\`.
        `,
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <TextField label="Deshabilitado" defaultValue="No se puede cambiar" disabled />
      <TextField label="Solo lectura" defaultValue="Se puede leer y copiar" readOnly />
    </div>
  ),
};

export const Types: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Cada tipo abre el teclado adecuado en móvil. \`autoComplete\` (criterio 1.3.5) permite que el navegador rellene datos personales.
        `,
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <TextField label="Nombre" autoComplete="name" />
      <TextField label="Correo" type="email" autoComplete="email" />
      <TextField label="Teléfono" type="tel" autoComplete="tel" />
      <TextField label="Sitio web" type="url" autoComplete="url" />
      <TextField label="Buscar" type="search" />
      <TextField label="Contraseña" type="password" autoComplete="current-password" />
    </div>
  ),
};

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

const ActivityExample = () => {
  const CORRECT = { capital: "paris", river: "sena" } as const;
  const [answers, setAnswers] = useState({ capital: "", river: "" });
  const [checked, setChecked] = useState(false);

  const stateOf = (key: keyof typeof CORRECT) =>
    !checked ? "normal" : normalize(answers[key]) === CORRECT[key] ? "right" : "wrong";

  const correctCount = (Object.keys(CORRECT) as Array<keyof typeof CORRECT>).filter(
    (key) => stateOf(key) === "right"
  ).length;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <TextField
        label="¿Cuál es la capital de Francia?"
        hint="Una palabra"
        state={stateOf("capital")}
        value={answers.capital}
        onChange={(event) => setAnswers({ ...answers, capital: event.target.value })}
      />
      <TextField
        label="¿Qué río cruza París?"
        hint="Una palabra"
        state={stateOf("river")}
        value={answers.river}
        onChange={(event) => setAnswers({ ...answers, river: event.target.value })}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" onClick={() => setChecked(true)}>
          Comprobar
        </button>
        <button
          type="button"
          onClick={() => {
            setAnswers({ capital: "", river: "" });
            setChecked(false);
          }}
        >
          Reiniciar
        </button>
      </div>
      {/* Un resumen para toda la actividad: avisa una sola vez en lugar de un aviso por campo. */}
      <p role="status">{checked ? `${correctCount} de 2 respuestas correctas.` : ""}</p>
    </div>
  );
};

export const ActivityResult: Story = {
  parameters: {
    docs: {
      description: {
        story: `
El caso de las actividades: al comprobar, cada campo recibe \`state\` \`right\` o \`wrong\`. Se ve por el icono y el borde (continuo o discontinuo) y se lee al enfocar el campo («Correcto» / «Incorrecto»).

El resumen («2 de 2 respuestas correctas») va en una región \`role="status"\` de la actividad: así se anuncia una sola vez, en lugar de un aviso por cada campo. Al reiniciar, \`state\` vuelve a \`normal\`.
        `,
      },
    },
  },
  render: () => <ActivityExample />,
};

const InSentenceExample = () => {
  const [answers, setAnswers] = useState({ capital: "", river: "" });
  const [checked, setChecked] = useState(false);
  const stateOf = (value: string, correct: string) =>
    !checked ? "normal" : normalize(value) === correct ? "right" : "wrong";

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <p style={{ lineHeight: 2.4 }}>
        La capital de Francia es{" "}
        <TextField
          label="Capital de Francia"
          isLabelVisible={false}
          inline
          state={stateOf(answers.capital, "paris")}
          value={answers.capital}
          onChange={(event) => setAnswers({ ...answers, capital: event.target.value })}
        />{" "}
        y la cruza el río{" "}
        <TextField
          label="Río que cruza París"
          isLabelVisible={false}
          inline
          state={stateOf(answers.river, "sena")}
          value={answers.river}
          onChange={(event) => setAnswers({ ...answers, river: event.target.value })}
        />
        .
      </p>
      <div>
        <button type="button" onClick={() => setChecked(true)}>
          Comprobar
        </button>
      </div>
    </div>
  );
};

export const InSentence: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Con \`inline\` el campo se integra en una frase para completar huecos. Como el texto que lo rodea ya da contexto a la vista, la etiqueta se oculta (\`isLabelVisible={false}\`) pero **conserva un nombre propio** para los lectores de pantalla: no la dejes vacía ni repetida.

El ancho **del texto** se cambia con la variable \`--text-field-inline-width\` (por defecto 12ch); el borde, el relleno y el espacio del icono se suman aparte, así que el campo no cambia de ancho al mostrar el resultado. El campo no usa un \`<div>\`, así que es HTML válido dentro de un párrafo.
        `,
      },
    },
  },
  render: () => <InSentenceExample />,
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Tres tamaños. Incluso el pequeño mide más de 24 × 24 px (criterio 2.5.8).
        `,
      },
    },
  },
  render: () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      <TextField label="Pequeño" size="small" />
      <TextField label="Normal" size="normal" />
      <TextField label="Grande" size="big" />
    </div>
  ),
};
