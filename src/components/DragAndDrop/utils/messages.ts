import type { ReorderCommand } from './dnd-state';

/**
 * Textos que el DragAndDrop muestra o anuncia a los lectores de pantalla.
 *
 * Todos son funciones para poder armar frases con los nombres del elemento y de las zonas. Se
 * pueden reemplazar uno a uno con la prop `messages` del componente (por ejemplo, para traducirlos).
 *
 * Las guías de accesibilidad de pragmatic-drag-and-drop piden que los anuncios incluyan el nombre
 * del elemento, de dónde viene y a dónde va.
 */
export interface DndMessages {
  /** Nombre accesible del botón que abre el menú para mover un elemento. */
  moveButton: (args: { drag: string }) => string;

  /** Nombre accesible del menú que se abre con ese botón. */
  moveMenu: (args: { drag: string }) => string;

  /** Opción del menú para mover un elemento a una zona. */
  moveTo: (args: { zone: string }) => string;

  /** Opción del menú para reordenar un elemento dentro de su zona. */
  reorderOption: (args: { command: ReorderCommand }) => string;

  /** Texto del menú cuando el elemento no tiene ningún lugar disponible al que moverse. */
  noMoves: () => string;

  /** Nombre accesible de una zona vacía (una zona con contenido se nombra solo con su `label`). */
  emptyZone: (args: { zone: string }) => string;

  /** Texto oculto que se añade a cada elemento al comprobar la actividad. */
  validationResult: (args: { correct: boolean }) => string;

  /** Anuncio tras mover un elemento. `displaced` son los que tuvieron que dejarle el lugar. */
  moved: (args: {
    drag: string;
    from: string;
    to: string;
    displaced: Array<{ drag: string; to: string }>;
  }) => string;

  /** Anuncio tras reordenar un elemento dentro de su zona. */
  reordered: (args: { drag: string; zone: string; position: number; total: number }) => string;

  /** Anuncio tras reiniciar. */
  reset: () => string;
}

const REORDER_OPTIONS: Record<ReorderCommand, string> = {
  top: 'Mover al inicio',
  up: 'Subir una posición',
  down: 'Bajar una posición',
  bottom: 'Mover al final',
};

export const defaultMessages: DndMessages = {
  moveButton: ({ drag }) => `Mover ${drag}`,
  moveMenu: ({ drag }) => `Opciones para mover ${drag}`,
  moveTo: ({ zone }) => `Mover a ${zone}`,
  reorderOption: ({ command }) => REORDER_OPTIONS[command],
  noMoves: () => 'No hay lugares disponibles.',
  emptyZone: ({ zone }) => `${zone}, vacío`,
  validationResult: ({ correct }) => (correct ? 'Correcto' : 'Incorrecto'),
  moved: ({ drag, from, to, displaced }) =>
    [
      `«${drag}» movido a «${to}», desde «${from}».`,
      ...displaced.map((item) => `«${item.drag}» volvió a «${item.to}».`),
    ].join(' '),
  reordered: ({ drag, zone, position, total }) =>
    `«${drag}» movido a la posición ${position} de ${total} en «${zone}».`,
  reset: () => 'Todos los elementos volvieron a su posición inicial.',
};

/** Mezcla los textos personalizados con los de por defecto. */
export const resolveMessages = (custom?: Partial<DndMessages>): DndMessages =>
  custom ? { ...defaultMessages, ...custom } : defaultMessages;
