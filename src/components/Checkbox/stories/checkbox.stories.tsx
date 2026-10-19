import { useRef, useState } from "react";

import { CheckBox } from "@components";
import type { Meta, StoryObj } from "@storybook/react-vite";

import "../assets/docs.css";

const meta: Meta<typeof CheckBox> = {
  title: "CheckBox",
  component: CheckBox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
El componente **CheckBox** es un input personalizado para selección múltiple.

## Características principales

- **Estados visuales**: Normal, correcto (right), incorrecto (wrong)
- **Iconos integrados**: Feedback visual con iconos SVG
- **Resultado accesible**: El resultado (\`right\` o \`wrong\`) se anuncia a los lectores de pantalla en la opción marcada
- **Label flexible**: Soporta HTML para formateo rico
- **Accesible**: Atributos ARIA y asociación label-input correcta
- **Controlado/No controlado**: Funciona en ambos modos
- **Customizable**: Estilos modificables mediante clases

## Uso en formularios

Ideal para:
- Selección múltiple de opciones
- Aceptación de términos y condiciones
- Filtros y preferencias
- Validación con feedback visual
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
Checkbox básico con label que soporta HTML.

El label puede incluir formato como \`<strong>\`, \`<em>\`, enlaces, etc., para mejorar la presentación del texto.
        `,
      },
    },
  },
  argTypes: {
    state: {
      options: ["normal", "right", "wrong"],
      control: { type: "radio" },
    },
  },
  args: {
    label: "Default <strong>checkbox</strong> label",
  },
  render: (args) => <CheckBox {...args}></CheckBox>,
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story: `
El checkbox soporta tres estados visuales:

- **normal**: Estado estándar sin validación
- **right**: Muestra un icono de éxito/correcto (✓)
- **wrong**: Muestra un icono de error/incorrecto (✗)

Los estados \`right\` y \`wrong\` son útiles para validación en tiempo real o feedback de formularios.

El resultado se muestra y se **anuncia solo en la opción marcada**: el icono solo se dibuja cuando está marcada, y a un lector de pantalla se le lee «Correcto» o «Incorrecto» como descripción en ese mismo caso, así recibe lo mismo que quien ve. No se anuncia en las opciones sin marcar, para no revelar cuáles eran las correctas. Los textos se pueden reemplazar con \`messages\`.
        `,
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    label: "Right state ✔",
    state: "right",
    defaultChecked: true,
  },
};

const CITIES = [
  { id: "madrid", label: "Madrid", correct: true },
  { id: "lima", label: "Lima", correct: false },
  { id: "roma", label: "Roma", correct: true },
  { id: "quito", label: "Quito", correct: false },
];

const ActivityExample = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [checked, setChecked] = useState(false);
  const [summary, setSummary] = useState("");

  const check = () => {
    const selected = new FormData(formRef.current as HTMLFormElement).getAll("ciudades");
    const hits = CITIES.filter((c) => selected.includes(c.id) && c.correct).length;
    const misses = selected.length - hits;
    setSummary(`Acertaste ${hits} y fallaste ${misses}.`);
    setChecked(true);
  };

  const reset = () => {
    formRef.current?.reset();
    setSummary("");
    setChecked(false);
  };

  return (
    <form ref={formRef} onSubmit={(event) => event.preventDefault()} style={{ display: "grid", gap: "0.75rem" }}>
      <fieldset style={{ display: "grid", gap: "0.5rem" }}>
        <legend>Marca las capitales de Europa</legend>
        {CITIES.map((city) => (
          <CheckBox
            key={city.id}
            id={`ciudad-${city.id}`}
            name="ciudades"
            value={city.id}
            label={city.label}
            disabled={checked}
            state={checked ? (city.correct ? "right" : "wrong") : "normal"}
          />
        ))}
      </fieldset>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" onClick={check}>
          Comprobar
        </button>
        <button type="button" onClick={reset}>
          Reiniciar
        </button>
      </div>
      {/* Un resumen para toda la actividad: avisa una sola vez. */}
      <p role="status">{summary}</p>
    </form>
  );
};

export const ActivityResult: Story = {
  parameters: {
    docs: {
      description: {
        story: `
Una actividad de selección múltiple. Al comprobar, **cada opción** recibe su \`state\` (correcta o incorrecta), pero solo se ve —y se anuncia— el de las que marcaste: las demás no revelan si eran correctas.

Con un lector de pantalla, al enfocar una opción marcada se lee su nombre y su resultado («Madrid, casilla de verificación, marcada, Correcto»). El resumen va en una región \`role="status"\` de la actividad, así se anuncia una sola vez.
        `,
      },
    },
  },
  render: () => <ActivityExample />,
};

export const Checked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Al igual que en el estándar de HTML, podemos utilizar la propiedad nativa `defaultChecked` para que nuestro checkbox esté 'seleccionado' por defecto.",
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    ...Default.args,
    label: "Default checked",
    defaultChecked: true,
  },
};

export const CheckStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Además, también contamos con CSS custom properties, que puedes usar: `--input-check-bg`, `--input-check-clr`, `--input-check-border-clr` y `--input-check-border-radius`. Puedes especificar estas variables en una clase personalizada de CSS. Por otra parte, para manejar los estilos dependiendo de los diferentes estados, puedes utilizar el atributo `data-state` presente en el componente. Haz clic en Show code en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  argTypes: {
    ...Default.argTypes,
  },
  args: {
    ...Default.args,
    label: "Change styles",
    addClass: "checkbox-example",
    state: "wrong",
    defaultChecked: true,
  },
};
