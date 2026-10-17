import { useState } from "react";

import { Button, Col, Row, DragAndDrop } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

import { useDragAndDropContext } from "../index";

import "../assets/docs.css";

const meta: Meta<typeof DragAndDrop> = {
  title: "DragAndDrop",
  component: DragAndDrop,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Botones de la actividad: comprobar y reintentar. Usa el contexto, por eso va dentro del DragAndDrop. */
function CheckAndReset({ checked, onCheck }: { checked: boolean; onCheck: (checked: boolean) => void }) {
  const { handleResetDnd } = useDragAndDropContext();

  return (
    <div className="actions-story">
      <Button label="Comprobar" onClick={() => onCheck(true)} disabled={checked} addClass="button-story" />
      <Button
        label="Reintentar"
        onClick={() => {
          handleResetDnd();
          onCheck(false);
        }}
        addClass="button-story"
      />
    </div>
  );
}

/**
 * Resultado de la actividad en texto. Es una región `role="status"`: se anuncia a los lectores de
 * pantalla y no depende del color. Va dentro del DragAndDrop porque lee los aciertos del contexto.
 */
function Resultado({ checked, total }: { checked: boolean; total: number }) {
  const { listId } = useDragAndDropContext();

  const message = !checked
    ? ""
    : listId.length === total
      ? "¡Muy bien! Todas las respuestas son correctas."
      : `Acertaste ${listId.length} de ${total}. Revisa los elementos marcados como incorrectos.`;

  return (
    <p role="status" className="result-story">
      {message}
    </p>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`DragAndDrop` permite arrastrar y soltar elementos con el mouse o moverlos con un menú accesible (el botón ⋮ de cada elemento), sin necesidad de arrastrar. Está construido sobre `@atlaskit/pragmatic-drag-and-drop`.\n\nSe compone de: `<DragAndDrop.Drag/>` (elemento arrastrable), `<DragAndDrop.Container/>` (zona sin límite de elementos, típicamente el banco de donde parten) y `<DragAndDrop.Drop/>` (zona de destino; por defecto acepta **un** elemento: si sueltas otro, el anterior regresa a la zona donde se declaró).\n\nCada `Drag` se declara **dentro de la zona donde empieza** (su *home*).",
      },
    },
  },
  args: {
    id: "default-drag",
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container id="banco" label="Banco" addClass="drop-story">
            <DragAndDrop.Drag id="A" label="Elemento A" addClass="drag-story" dragging="drag-story--active">
              Elemento A
            </DragAndDrop.Drag>
            <DragAndDrop.Drag id="B" label="Elemento B" addClass="drag-story" dragging="drag-story--active">
              Elemento B
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop id="destino" label="Destino" validate={["A"]} addClass="drop-story" over="drop-story--over">
            <p>Destino</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

export const UnContenedorPorDrag: Story = {
  name: "Un contenedor por drag",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando cada elemento necesita **su propio lugar**, declara un `Container` por elemento con `homeOnly`: esa celda solo acepta a su dueño. Al sacar un elemento la celda queda vacía (no se reacomodan los demás) y, si otro elemento lo desplaza de una zona, vuelve exactamente a su celda.\n\nLas celdas también pueden llevar contenido propio (aquí, un texto oculto con la posición): ya no se pierde. En el menú de cada elemento no aparecen las celdas de los demás.",
      },
    },
  },
  args: {
    id: "celda-por-drag",
    children: (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {["riesgos", "firma", "explicación"].map((palabra, index) => (
            <DragAndDrop.Container
              key={palabra}
              id={`celda-${palabra}`}
              label={`Espacio de ${palabra}`}
              addClass="cell-story drop-story"
              homeOnly
            >
              <DragAndDrop.Drag id={palabra} label={palabra} addClass="drag-story" dragging="drag-story--active">
                {palabra}
              </DragAndDrop.Drag>
              <span className="u-sr-only">{`Posición ${index + 1}`}</span>
            </DragAndDrop.Container>
          ))}
        </div>
        <Row justify-content="center" align-items="center">
          {["Consentimiento", "Procedimiento"].map((titulo) => (
            <Col key={titulo} xs="11" mm="10" md="9" lg="5" hd="4">
              <DragAndDrop.Drop id={`z-${titulo}`} label={titulo} addClass="drop-story">
                <p>{titulo}</p>
              </DragAndDrop.Drop>
            </Col>
          ))}
        </Row>
      </>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

export const CompletarFrases: Story = {
  name: "Completar frases",
  parameters: {
    docs: {
      description: {
        story:
          "Un banco de palabras y espacios dentro de las frases. Cada espacio es un `Drop` con `validate` (la palabra correcta). Al activar `validate` en `DragAndDrop` la actividad se comprueba: nada se puede mover, cada palabra recibe `data-validation` y un texto oculto «Correcto» o «Incorrecto» para lectores de pantalla. Usa `useDragAndDropContext().handleResetDnd` para reintentar.",
      },
    },
  },
  args: {
    id: "completar-frases",
    children: <></>,
  },
  render: function Render(args) {
    const [checked, setChecked] = useState(false);

    return (
      <DragAndDrop {...args} validate={checked}>
        <DragAndDrop.Container id="banco" label="Palabras disponibles" addClass="drop-story">
          {[
            { id: "riesgos", texto: "riesgos" },
            { id: "firma", texto: "firma" },
            { id: "explicacion", texto: "explicación" },
          ].map(({ id, texto }) => (
            <DragAndDrop.Drag key={id} id={id} label={texto} addClass="drag-story" dragging="drag-story--active">
              <span>{texto}</span>
            </DragAndDrop.Drag>
          ))}
        </DragAndDrop.Container>

        <ol>
          <li>
            Antes de una cirugía, el paciente debe recibir una{" "}
            <DragAndDrop.Drop id="espacio-1" label="primer espacio" validate={["explicacion"]} addClass="blank-story" />{" "}
            clara sobre el procedimiento.
          </li>
          <li>
            El médico debe informar sobre los posibles{" "}
            <DragAndDrop.Drop id="espacio-2" label="segundo espacio" validate={["riesgos"]} addClass="blank-story" />{" "}
            asociados al tratamiento.
          </li>
          <li>
            Normalmente se solicita la{" "}
            <DragAndDrop.Drop id="espacio-3" label="tercer espacio" validate={["firma"]} addClass="blank-story" />{" "}
            del paciente en un documento.
          </li>
        </ol>

        <CheckAndReset checked={checked} onCheck={setChecked} />
      </DragAndDrop>
    );
  },
};

const ANIMALES = [
  { id: "perro", texto: "Perro", categoria: "vertebrados" },
  { id: "mariposa", texto: "Mariposa", categoria: "invertebrados" },
  { id: "aguila", texto: "Águila", categoria: "vertebrados" },
  { id: "pulpo", texto: "Pulpo", categoria: "invertebrados" },
  { id: "rana", texto: "Rana", categoria: "vertebrados" },
  { id: "caracol", texto: "Caracol", categoria: "invertebrados" },
];

export const ClasificarEnCategorias: Story = {
  name: "Clasificar en categorías",
  parameters: {
    docs: {
      description: {
        story:
          "Cada categoría es un `Drop` con `capacity={Infinity}` y su `validate` con los elementos que le corresponden. El título es contenido propio de la zona (`<h4>`) y los elementos que llegan se pintan debajo. Al comprobar, un `<p role=\"status\">` dice cuántos acertaron: el resultado no depende solo del color.",
      },
    },
  },
  args: { id: "clasificar", children: <></> },
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    const categorias = [
      { id: "vertebrados", titulo: "Vertebrados" },
      { id: "invertebrados", titulo: "Invertebrados" },
    ];

    return (
      <DragAndDrop {...args} validate={checked}>
        <DragAndDrop.Container id="banco" label="Animales por clasificar" addClass="drop-story">
          {ANIMALES.map(({ id, texto }) => (
            <DragAndDrop.Drag key={id} id={id} label={texto} addClass="drag-story" dragging="drag-story--active">
              {texto}
            </DragAndDrop.Drag>
          ))}
        </DragAndDrop.Container>

        <Row justify-content="center" align-items="stretch">
          {categorias.map(({ id, titulo }) => (
            <Col key={id} xs="11" mm="10" md="9" lg="5" hd="4">
              <DragAndDrop.Drop
                id={id}
                label={titulo}
                capacity={Infinity}
                validate={ANIMALES.filter((animal) => animal.categoria === id).map((animal) => animal.id)}
                addClass="drop-story category-story"
              >
                <h4>{titulo}</h4>
              </DragAndDrop.Drop>
            </Col>
          ))}
        </Row>

        <Resultado checked={checked} total={ANIMALES.length} />
        <CheckAndReset checked={checked} onCheck={setChecked} />
      </DragAndDrop>
    );
  },
};

const PARES = [
  { id: "fotosintesis", termino: "Fotosíntesis", definicion: "Las plantas producen su alimento usando la luz del sol." },
  { id: "respiracion", termino: "Respiración celular", definicion: "Las células liberan la energía de los nutrientes." },
  { id: "digestion", termino: "Digestión", definicion: "El cuerpo descompone los alimentos en nutrientes." },
];

export const RelacionarColumnas: Story = {
  name: "Relacionar columnas",
  parameters: {
    docs: {
      description: {
        story:
          "Una columna de términos, cada uno con un `Drop` de capacidad 1, y un banco de definiciones para arrastrar. Cada `Drop` lleva un `label` que incluye el término (`Definición de Fotosíntesis`), así quien usa lector de pantalla sabe a qué espacio se refiere. Si sueltas una definición en un espacio ocupado, la anterior regresa al banco.",
      },
    },
  },
  args: { id: "relacionar-columnas", children: <></> },
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    // El banco se declara en otro orden para que no esté resuelto desde el inicio.
    const banco = [PARES[1], PARES[2], PARES[0]];

    return (
      <DragAndDrop {...args} validate={checked}>
        <Row justify-content="center" align-items="start">
          <Col xs="11" mm="10" md="9" lg="6" hd="5">
            <ul className="pair-story" aria-label="Términos">
              {PARES.map(({ id, termino }) => (
                <li key={id}>
                  <strong>{termino}</strong>
                  <DragAndDrop.Drop
                    id={`par-${id}`}
                    label={`Definición de ${termino}`}
                    validate={[id]}
                    addClass="drop-story pair-drop-story"
                  />
                </li>
              ))}
            </ul>
          </Col>
          <Col xs="11" mm="10" md="9" lg="6" hd="5">
            <DragAndDrop.Container id="banco" label="Definiciones" addClass="drop-story">
              {banco.map(({ id, definicion }) => (
                <DragAndDrop.Drag
                  key={id}
                  id={id}
                  label={definicion}
                  addClass="drag-story definition-story"
                  dragging="drag-story--active"
                >
                  {definicion}
                </DragAndDrop.Drag>
              ))}
            </DragAndDrop.Container>
          </Col>
        </Row>

        <Resultado checked={checked} total={PARES.length} />
        <CheckAndReset checked={checked} onCheck={setChecked} />
      </DragAndDrop>
    );
  },
};

/** Espacio sobre el dibujo: se coloca por porcentajes para que siga al dibujo al cambiar de tamaño. */
const PARTES = [
  { id: "petalo", texto: "Pétalo", pista: "parte superior, de colores vivos", style: { left: "2%", top: "16%" } },
  { id: "hoja", texto: "Hoja", pista: "parte plana y verde del costado", style: { left: "2%", top: "52%" } },
  { id: "raiz", texto: "Raíz", pista: "parte que está bajo la tierra", style: { left: "2%", top: "88%" } },
  { id: "tallo", texto: "Tallo", pista: "parte larga que sostiene la flor", style: { left: "70%", top: "62%" } },
];

export const EtiquetarImagen: Story = {
  name: "Etiquetar una imagen",
  parameters: {
    docs: {
      description: {
        story:
          "Los `Drop` se colocan encima de un dibujo con posición absoluta y porcentajes, así siguen a la imagen al cambiar de tamaño. Como el dibujo no se puede leer con un lector de pantalla, cada zona lleva un `label` que describe la parte que señala (*Espacio 1: parte superior, de colores vivos*) y la imagen tiene un texto alternativo. Las zonas quedan en el orden del DOM, que es también el orden del teclado.",
      },
    },
  },
  args: { id: "etiquetar-imagen", children: <></> },
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    // Orden distinto al de las zonas para que no esté resuelto desde el inicio.
    const banco = [PARTES[2], PARTES[0], PARTES[3], PARTES[1]];

    return (
      <DragAndDrop {...args} validate={checked}>
        <div className="figure-story">
          <svg
            viewBox="0 0 400 300"
            role="img"
            aria-label="Dibujo de una flor con cuatro partes señaladas con líneas hacia espacios numerados"
          >
            <path d="M262 125 L262 262" stroke="#2f7d32" strokeWidth="8" fill="none" />
            <ellipse cx="232" cy="200" rx="34" ry="12" transform="rotate(-25 232 200)" fill="#43a047" />
            <path d="M262 262 Q240 280 222 292 M262 262 L262 296 M262 262 Q284 280 302 292" stroke="#8d6e63" strokeWidth="4" fill="none" />
            {[
              [296, 105],
              [279, 134],
              [245, 134],
              [228, 105],
              [245, 76],
              [279, 76],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="22" fill="#f48fb1" />
            ))}
            <circle cx="262" cy="105" r="18" fill="#fdd835" />
            {[
              [120, 48, 208, 100],
              [120, 156, 212, 208],
              [120, 264, 226, 289],
              [280, 186, 264, 186],
            ].map(([x1, y1, x2, y2]) => (
              <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#495057" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>

          {PARTES.map(({ id, pista, style }, index) => (
            <DragAndDrop.Drop
              key={id}
              id={`espacio-${id}`}
              label={`Espacio ${index + 1}: ${pista}`}
              validate={[id]}
              addClass="hotspot-story"
              style={style}
            />
          ))}
        </div>

        <DragAndDrop.Container id="banco" label="Nombres de las partes" addClass="drop-story">
          {banco.map(({ id, texto }) => (
            <DragAndDrop.Drag key={id} id={id} label={texto} addClass="drag-story" dragging="drag-story--active">
              {texto}
            </DragAndDrop.Drag>
          ))}
        </DragAndDrop.Container>

        <Resultado checked={checked} total={PARTES.length} />
        <CheckAndReset checked={checked} onCheck={setChecked} />
      </DragAndDrop>
    );
  },
};

export const ElementosBloqueados: Story = {
  name: "Pistas ya colocadas",
  parameters: {
    docs: {
      description: {
        story:
          "Con `dragDisabled` un elemento queda **fijo**: no se arrastra, no se mueve con el menú y **otro elemento no puede desplazarlo** (esa zona deja de ofrecerse como destino). Declara el elemento dentro de la zona donde debe quedar; aquí el primer espacio ya viene completado como pista. «Reintentar» lo deja en su lugar y, al comprobar, cuenta como correcto. Recibe `data-disabled` para darle estilo.",
      },
    },
  },
  args: { id: "pistas", children: <></> },
  render: function Render(args) {
    const [checked, setChecked] = useState(false);

    return (
      <DragAndDrop {...args} validate={checked}>
        <DragAndDrop.Container id="banco" label="Palabras disponibles" addClass="drop-story">
          {[
            { id: "riesgos", texto: "riesgos" },
            { id: "firma", texto: "firma" },
          ].map(({ id, texto }) => (
            <DragAndDrop.Drag key={id} id={id} label={texto} addClass="drag-story" dragging="drag-story--active">
              {texto}
            </DragAndDrop.Drag>
          ))}
        </DragAndDrop.Container>

        <ol>
          <li>
            Antes de una cirugía, el paciente debe recibir una{" "}
            <DragAndDrop.Drop id="espacio-1" label="primer espacio" validate={["explicacion"]} addClass="blank-story">
              <DragAndDrop.Drag id="explicacion" label="explicación" dragDisabled addClass="drag-story">
                explicación
              </DragAndDrop.Drag>
            </DragAndDrop.Drop>{" "}
            clara sobre el procedimiento.
          </li>
          <li>
            El médico debe informar sobre los posibles{" "}
            <DragAndDrop.Drop id="espacio-2" label="segundo espacio" validate={["riesgos"]} addClass="blank-story" />{" "}
            asociados al tratamiento.
          </li>
          <li>
            Normalmente se solicita la{" "}
            <DragAndDrop.Drop id="espacio-3" label="tercer espacio" validate={["firma"]} addClass="blank-story" />{" "}
            del paciente en un documento.
          </li>
        </ol>

        <Resultado checked={checked} total={3} />
        <CheckAndReset checked={checked} onCheck={setChecked} />
      </DragAndDrop>
    );
  },
};

const PROGRESS_KEY = "books-ui-story-dnd-progress";

/** Lee el progreso guardado. Falla en silencio si el almacenamiento no está disponible. */
const readProgress = (): Record<string, string[]> | undefined => {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);

    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

function ForgetProgress() {
  const { handleResetDnd } = useDragAndDropContext();

  return (
    <Button
      label="Borrar progreso"
      onClick={() => {
        handleResetDnd();
        try {
          window.localStorage.removeItem(PROGRESS_KEY);
        } catch {
          // Sin almacenamiento no hay nada que borrar.
        }
      }}
      addClass="button-story"
    />
  );
}

export const ProgresoGuardado: Story = {
  name: "Guardar y retomar el progreso",
  parameters: {
    docs: {
      description: {
        story:
          "Un OVA puede recordar dónde dejó el estudiante cada elemento. `onState` entrega las posiciones tras cada movimiento (aquí se guardan en `localStorage`) y `defaultState` las restaura al volver. Mueve un elemento, recarga la página y seguirá donde lo dejaste. Los elementos que no aparezcan en `defaultState` quedan en la zona donde se declararon.",
      },
    },
  },
  args: { id: "progreso-guardado", children: <></> },
  render: function Render(args) {
    // Se lee una sola vez: `defaultState` es el punto de partida, no un estado que se vuelve a escribir.
    const [saved] = useState(readProgress);

    return (
      <DragAndDrop
        {...args}
        defaultState={saved}
        onState={({ state }) => {
          try {
            window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
          } catch {
            // Si no se puede guardar, la actividad sigue funcionando.
          }
        }}
      >
        <Row justify-content="center" align-items="center">
          <Col xs="11" mm="10" md="9" lg="5" hd="4">
            <DragAndDrop.Container id="banco" label="Banco" addClass="drop-story">
              {["A", "B", "C"].map((letra) => (
                <DragAndDrop.Drag key={letra} id={letra} label={`Elemento ${letra}`} addClass="drag-story" dragging="drag-story--active">
                  Elemento {letra}
                </DragAndDrop.Drag>
              ))}
            </DragAndDrop.Container>
          </Col>
          <Col xs="11" mm="10" md="9" lg="5" hd="4">
            <DragAndDrop.Drop id="destino" label="Destino" capacity={Infinity} addClass="drop-story">
              <p>Destino</p>
            </DragAndDrop.Drop>
          </Col>
        </Row>
        <ForgetProgress />
      </DragAndDrop>
    );
  },
};

export const DosActividadesEnLaPagina: Story = {
  name: "Dos actividades en la misma página",
  parameters: {
    docs: {
      description: {
        story:
          "Cada `DragAndDrop` es independiente, incluso si usan los mismos ids de zonas y elementos (algo común cuando una página repite una plantilla). Lo que arrastras en una actividad nunca cae en la otra.",
      },
    },
  },
  args: { id: "dos-actividades", children: <></> },
  render: () => (
    <>
      {["Actividad 1", "Actividad 2"].map((titulo, index) => (
        <section key={titulo} aria-labelledby={`titulo-actividad-${index}`}>
          <h3 id={`titulo-actividad-${index}`}>{titulo}</h3>
          <DragAndDrop id={`actividad-${index}`}>
            <Row justify-content="center" align-items="center">
              <Col xs="11" mm="10" md="9" lg="5" hd="4">
                <DragAndDrop.Container id="banco" label={`Banco de ${titulo}`} addClass="drop-story">
                  <DragAndDrop.Drag id="A" label={`Elemento A de ${titulo}`} addClass="drag-story" dragging="drag-story--active">
                    Elemento A
                  </DragAndDrop.Drag>
                  <DragAndDrop.Drag id="B" label={`Elemento B de ${titulo}`} addClass="drag-story" dragging="drag-story--active">
                    Elemento B
                  </DragAndDrop.Drag>
                </DragAndDrop.Container>
              </Col>
              <Col xs="11" mm="10" md="9" lg="5" hd="4">
                <DragAndDrop.Drop id="destino" label={`Destino de ${titulo}`} addClass="drop-story">
                  <p>Destino</p>
                </DragAndDrop.Drop>
              </Col>
            </Row>
          </DragAndDrop>
        </section>
      ))}
    </>
  ),
};

export const ContenidoPropio: Story = {
  name: "Contenido propio en las zonas",
  parameters: {
    docs: {
      description: {
        story:
          "Las zonas pintan sus hijos tal cual: pueden llevar títulos, imágenes, pistas o cualquier contenido, y los drags pueden estar dentro de wrappers o de **componentes propios**. Los drags que llegan a una zona se pintan al final de ella; con `<DragAndDrop.Items />` eliges el punto exacto (úsalo una sola vez por zona; no genera ningún elemento).",
      },
    },
  },
  args: {
    id: "contenido-propio",
    children: (
      <Row justify-content="center" align-items="stretch">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container id="banco" label="Banco" addClass="drop-story">
            <h4>Conceptos</h4>
            <DragAndDrop.Drag id="A" label="Consentimiento" addClass="drag-story" dragging="drag-story--active">
              Consentimiento
            </DragAndDrop.Drag>
            <DragAndDrop.Drag id="B" label="Riesgos" addClass="drag-story" dragging="drag-story--active">
              Riesgos
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop id="destino" label="Destino" capacity={Infinity} addClass="drop-story">
            <h4>Antes de la intervención</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", justifyContent: "center" }}>
              <DragAndDrop.Items />
            </div>
            <p>Pista: lo que el paciente debe conocer.</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

const Palabra = ({ id, texto }: { id: string; texto: string }) => (
  <DragAndDrop.Container id={`celda-${id}`} label={`Espacio de ${texto}`} addClass="cell-story drop-story" homeOnly>
    <DragAndDrop.Drag id={id} label={texto} addClass="drag-story" dragging="drag-story--active">
      {texto}
    </DragAndDrop.Drag>
  </DragAndDrop.Container>
);

export const ComponentePropio: Story = {
  name: "Componente propio",
  parameters: {
    docs: {
      description: {
        story:
          "`Container` y `Drag` pueden estar dentro de tus propios componentes (aquí, `Palabra`). El componente raíz no recorre el JSX para encontrarlos: cada uno se registra solo al montarse.",
      },
    },
  },
  args: {
    id: "componente-propio",
    children: (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <Palabra id="uno" texto="Uno" />
          <Palabra id="dos" texto="Dos" />
          <Palabra id="tres" texto="Tres" />
        </div>
        <DragAndDrop.Drop id="destino" label="Destino" capacity={Infinity} addClass="drop-story">
          <p>Destino</p>
        </DragAndDrop.Drop>
      </>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

export const OrdenarSecuencia: Story = {
  name: "Ordenar una secuencia",
  parameters: {
    docs: {
      description: {
        story:
          "Piezas desordenadas en un banco y casillas numeradas. Cada casilla es un `Container` con `capacity={1}` y `validate` con la pieza que le corresponde. Una pieza que llega a una casilla ocupada desplaza a la anterior a su lugar de origen (el banco).",
      },
    },
  },
  args: { id: "ordenar", children: <></> },
  render: function Render(args) {
    const [checked, setChecked] = useState(false);

    return (
      <DragAndDrop {...args} validate={checked}>
        <DragAndDrop.Container id="banco" label="Pasos desordenados" addClass="drop-story">
          <DragAndDrop.Drag id="p3" label="Servir" addClass="drag-story" dragging="drag-story--active">
            Servir
          </DragAndDrop.Drag>
          <DragAndDrop.Drag id="p1" label="Hervir el agua" addClass="drag-story" dragging="drag-story--active">
            Hervir el agua
          </DragAndDrop.Drag>
          <DragAndDrop.Drag id="p2" label="Agregar el café" addClass="drag-story" dragging="drag-story--active">
            Agregar el café
          </DragAndDrop.Drag>
        </DragAndDrop.Container>

        {[
          { n: 1, id: "p1" },
          { n: 2, id: "p2" },
          { n: 3, id: "p3" },
        ].map(({ n, id }) => (
          <DragAndDrop.Container
            key={n}
            id={`casilla-${n}`}
            label={`Paso ${n}`}
            capacity={1}
            validate={[id]}
            addClass="step-story drop-story"
          >
            <strong aria-hidden="true">{n}.</strong>
          </DragAndDrop.Container>
        ))}

        <CheckAndReset checked={checked} onCheck={setChecked} />
      </DragAndDrop>
    );
  },
};

export const ListaOrdenable: Story = {
  name: "Zona ordenable",
  parameters: {
    docs: {
      description: {
        story:
          "Con `sortable` en una zona, sus elementos se pintan en el orden del estado y el menú de cada uno ofrece reordenarlo dentro de la zona: *Mover al inicio*, *Subir una posición*, *Bajar una posición* y *Mover al final* (solo las que cambiarían algo). Tras reordenar, el foco sigue en el botón del elemento y se anuncia la nueva posición.",
      },
    },
  },
  args: {
    id: "lista-ordenable",
    children: (
      <DragAndDrop.Container id="lista" label="Prioridades" sortable addClass="drop-story">
        {["Seguridad", "Calidad", "Costo", "Tiempo"].map((texto) => (
          <DragAndDrop.Drag key={texto} id={texto} label={texto} addClass="drag-story" dragging="drag-story--active">
            {texto}
          </DragAndDrop.Drag>
        ))}
      </DragAndDrop.Container>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

export const DragValidation: Story = {
  name: "Validación",
  parameters: {
    docs: {
      description: {
        story:
          "Cada `<DragAndDrop.Drop/>` recibe `validate`: los ids de los `Drag` que se consideran correctos allí. Al pasar `validate` en `<DragAndDrop/>` la actividad se comprueba: ningún elemento se puede mover y cada `Drag` recibe `data-validation=\"true\"` o `\"false\"` más un texto oculto («Correcto» / «Incorrecto») para lectores de pantalla. `onValidate` informa, tras cada movimiento, qué ids están en una zona que los considera correctos.\n\nLa validez siempre se calcula a partir de dónde está cada elemento.",
      },
    },
  },
  args: { id: "validation-drag", children: <></> },
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    const [correct, setCorrect] = useState<string[]>([]);

    return (
      <DragAndDrop {...args} validate={checked} onValidate={({ validate }) => setCorrect(validate)}>
        <Row justify-content="center" align-items="center">
          <Col xs="11" mm="10" md="9" lg="5" hd="4">
            <DragAndDrop.Container id="banco" label="Banco" addClass="drop-story">
              <DragAndDrop.Drag id="A" label="Elemento A" addClass="drag-story" dragging="drag-story--active">
                Elemento A
              </DragAndDrop.Drag>
              <DragAndDrop.Drag id="B" label="Elemento B" addClass="drag-story" dragging="drag-story--active">
                Elemento B
              </DragAndDrop.Drag>
            </DragAndDrop.Container>
          </Col>
          <Col md="12">
            <Row justify-content="center" align-items="center">
              <Col xs="11" mm="10" md="9" lg="5" hd="4">
                <DragAndDrop.Drop id="drop-b" label="Zona para B" validate={["B"]} addClass="drop-story">
                  <p>Zona para B</p>
                </DragAndDrop.Drop>
              </Col>
              <Col xs="11" mm="10" md="9" lg="5" hd="4">
                <DragAndDrop.Drop id="drop-a" label="Zona para A" validate={["A"]} addClass="drop-story">
                  <p>Zona para A</p>
                </DragAndDrop.Drop>
              </Col>
            </Row>
          </Col>
        </Row>
        <p style={{ textAlign: "center" }}>Elementos en su zona correcta: {correct.length}</p>
        <CheckAndReset checked={checked} onCheck={setChecked} />
      </DragAndDrop>
    );
  },
};

export const ResetDrag: Story = {
  name: "Reiniciar",
  parameters: {
    docs: {
      description: {
        story:
          "Para devolver todos los elementos a la zona donde se declararon y limpiar las validaciones, usa `handleResetDnd` de `useDragAndDropContext()`. El hook debe usarse en un componente hijo de `<DragAndDrop/>`. Reiniciar también se anuncia a los lectores de pantalla.",
      },
    },
  },
  args: {
    id: "reset-drag",
    children: (
      <>
        <Row justify-content="center" align-items="center">
          <Col xs="11" mm="10" md="9" lg="5" hd="4">
            <DragAndDrop.Container id="banco" label="Banco" addClass="drop-story">
              <DragAndDrop.Drag id="A" label="Elemento A" addClass="drag-story" dragging="drag-story--active">
                Elemento A
              </DragAndDrop.Drag>
            </DragAndDrop.Container>
          </Col>
          <Col xs="11" mm="10" md="9" lg="5" hd="4">
            <DragAndDrop.Drop id="destino" label="Destino" validate={["A"]} addClass="drop-story">
              <p>Destino</p>
            </DragAndDrop.Drop>
          </Col>
        </Row>
        <ResetOnly />
      </>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

function ResetOnly() {
  const { handleResetDnd } = useDragAndDropContext();

  return <Button label="Reiniciar" onClick={handleResetDnd} addClass="button-story" />;
}

export const Accesibilidad: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pensado para WCAG 2.2 AA y siguiendo las [guías de accesibilidad de pragmatic-drag-and-drop](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines):\n\n- **Alternativa al arrastre (2.5.7):** cada elemento tiene un botón ⋮ que abre un diálogo con las mismas opciones que arrastrar (mover a cada zona y, en zonas `sortable`, reordenar). Su nombre incluye el elemento y mide al menos 24 × 24 px (2.5.8).\n- **Anuncios (4.1.3):** cada movimiento se anuncia con una región `role=\"status\"` con el nombre del elemento, de dónde viene y a dónde va; también si desplazó a otro y al reiniciar.\n- **Foco:** tras mover con el menú el foco vuelve al botón del elemento.\n- **Zonas:** son `role=\"group\"` con su `label`; una zona vacía se anuncia como «vacía». No son landmarks, así que un ejercicio con muchos espacios no llena la lista de regiones.\n- **Validación sin depender del color (1.4.1):** cada elemento recibe un texto oculto «Correcto» / «Incorrecto».\n- **Textos:** todos están en español y se pueden reemplazar con la prop `messages` (abajo, en inglés).",
      },
    },
  },
  args: {
    id: "accesibilidad",
    messages: {
      moveButton: ({ drag }) => `Move ${drag}`,
      moveMenu: ({ drag }) => `Options to move ${drag}`,
      moveTo: ({ zone }) => `Move to ${zone}`,
      emptyZone: ({ zone }) => `${zone}, empty`,
      noMoves: () => "No places available.",
      moved: ({ drag, from, to }) => `${drag} moved to ${to} from ${from}.`,
      validationResult: ({ correct }) => (correct ? "Correct" : "Incorrect"),
    },
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container id="banco" label="Bank" addClass="drop-story">
            <DragAndDrop.Drag id="A" label="Item A" addClass="drag-story" dragging="drag-story--active">
              Item A (Tab, Enter)
            </DragAndDrop.Drag>
            <DragAndDrop.Drag id="B" label="Item B" addClass="drag-story" dragging="drag-story--active">
              Item B
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop id="destino" label="Target" validate={["A"]} addClass="drop-story">
            <p>Target</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

export const DragStyling: Story = {
  name: "Estilos",
  parameters: {
    docs: {
      description: {
        story:
          "Personaliza con `addClass` en `Container`, `Drag` y `Drop`. Clases y atributos útiles:\n\n- `dragging` (en `Drag`): clase mientras se arrastra. Además, el atributo `data-dragging`.\n- `over` (en `Container`/`Drop`): clase mientras un elemento compatible está encima. Además, `data-over` y `c-droppable--active`.\n- `data-empty` en una zona vacía.\n- `data-validation=\"true|false\"` en cada `Drag` al comprobar: `.drag-story[data-validation='true']`.\n\nNo uses solo el color para comunicar el resultado: el componente ya agrega el texto oculto para lectores de pantalla, y conviene sumar un ícono o texto visible.",
      },
    },
  },
  args: {
    id: "styling-drag",
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container id="banco" label="Banco" addClass="drop-story">
            <DragAndDrop.Drag id="A" label="Elemento A" addClass="drag-story" dragging="drag-story--active">
              Elemento A
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop id="destino" label="Destino" validate={["A"]} addClass="drop-story" over="drop-story--over">
            <p>Destino</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

export const MultiplesElementosEnUnaZona: Story = {
  name: "Varios elementos en una zona",
  parameters: {
    docs: {
      description: {
        story:
          "Una zona acepta varios elementos con `capacity` (un número, o `Infinity` para no limitarla). Un `Drop` acepta uno por defecto y un `Container` no tiene límite. Si la zona se llena, el elemento más antiguo regresa a la zona donde se declaró.",
      },
    },
  },
  args: {
    id: "multiples",
    children: (
      <Row justify-content="center" align-items="center">
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Container id="banco" label="Banco" addClass="drop-story">
            {["A", "B", "C", "D"].map((id) => (
              <DragAndDrop.Drag key={id} id={id} label={`Elemento ${id}`} addClass="drag-story" dragging="drag-story--active">
                Elemento {id}
              </DragAndDrop.Drag>
            ))}
          </DragAndDrop.Container>
        </Col>
        <Col xs="11" mm="10" md="9" lg="5" hd="4">
          <DragAndDrop.Drop id="dos" label="Zona de hasta dos" capacity={2} validate={["A", "B"]} addClass="drop-story">
            <p>Hasta 2</p>
          </DragAndDrop.Drop>
        </Col>
      </Row>
    ),
  },
  render: (args) => <DragAndDrop {...args} />,
};

export const StateManagement: Story = {
  name: "Control del estado",
  parameters: {
    docs: {
      description: {
        story:
          "Controla el estado desde fuera con `defaultState`, `onState` y `onMove`.\n\n- **defaultState**: posición de cada elemento (`{ [idZona]: [idDrag, …] }`). Si cambia, los elementos se reubican; los que no aparezcan quedan en su zona de origen.\n- **onState**: se llama después de cada movimiento, reordenamiento o reinicio con `{ id, state, validateId }`.\n- **onMove**: se llama después de cada movimiento con qué se movió (incluidos los desplazados) y su origen (`pointer`, `menu` o `api`).\n\nLa validez no se guarda: sale de `state`.",
      },
    },
  },
  args: { id: "state-management", children: <></> },
  render: function Render(args) {
    const [state, setState] = useState<Record<string, string[]>>({ banco: ["A", "B"], destino: [] });
    const [validatedIds, setValidatedIds] = useState<string[]>([]);
    const [lastMove, setLastMove] = useState("");

    return (
      <>
        <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f5f5f5", color: "#212529" }}>
          <h4>Estado actual:</h4>
          <pre>{JSON.stringify(state, null, 2)}</pre>
          <h4>Elementos válidos:</h4>
          <pre>{JSON.stringify(validatedIds)}</pre>
          <h4>Último movimiento:</h4>
          <pre>{lastMove || "—"}</pre>
        </div>
        <DragAndDrop
          {...args}
          defaultState={state}
          onState={({ state: next, validateId }) => {
            setState(next);
            setValidatedIds(validateId);
          }}
          onMove={({ movements, source }) => setLastMove(`${source}: ${JSON.stringify(movements)}`)}
        >
          <Row justify-content="center" align-items="center">
            <Col xs="11" mm="10" md="9" lg="5" hd="4">
              <DragAndDrop.Container id="banco" label="Banco" addClass="drop-story">
                <DragAndDrop.Drag id="A" label="Elemento A" addClass="drag-story" dragging="drag-story--active">
                  Elemento A
                </DragAndDrop.Drag>
                <DragAndDrop.Drag id="B" label="Elemento B" addClass="drag-story" dragging="drag-story--active">
                  Elemento B
                </DragAndDrop.Drag>
              </DragAndDrop.Container>
            </Col>
            <Col xs="11" mm="10" md="9" lg="5" hd="4">
              <DragAndDrop.Drop id="destino" label="Destino" validate={["A", "B"]} capacity={2} addClass="drop-story">
                <p>Destino</p>
              </DragAndDrop.Drop>
            </Col>
          </Row>
        </DragAndDrop>
      </>
    );
  },
};
