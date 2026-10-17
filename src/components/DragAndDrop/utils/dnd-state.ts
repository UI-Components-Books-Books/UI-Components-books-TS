/**
 * Núcleo de estado del DragAndDrop: funciones puras, sin React ni DOM.
 *
 * El componente solo se encarga de pintar y de conectar eventos; las reglas (a dónde se puede
 * mover un elemento, quién se desplaza, qué es válido) viven aquí para poder probarlas aisladas.
 *
 * Vocabulario:
 *  - Zona: cualquier lugar donde puede estar un drag (`Container` o `Drop`).
 *  - Home: la zona en la que se declaró un drag. Es a donde regresa cuando otro lo desplaza.
 *  - Layout: dónde está cada drag ahora mismo (`{ [idZona]: [idDrag, ...] }`).
 */

/** Dónde está cada drag: ids de zona → ids de drag, en orden. */
export type Layout = Record<string, string[]>;

/** Reglas de una zona. Todas son opcionales. */
export interface ZoneRule {
  /** Ids de los drags que se consideran correctos en esta zona. */
  validate?: string[];

  /** Máximo de drags a la vez. Sin valor, la zona no tiene límite. */
  capacity?: number;

  /** Si es `true`, solo acepta drags cuyo home es esta zona. */
  homeOnly?: boolean;
}

/** Reglas por zona. */
export type Zones = Record<string, ZoneRule>;

/** Zona de origen de cada drag: id de drag → id de zona. */
export type Homes = Record<string, string>;

/** Comandos de reordenamiento dentro de una misma zona. */
export type ReorderCommand = 'top' | 'up' | 'down' | 'bottom';

/** Un movimiento efectivo. Un solo `move` puede producir varios (el arrastrado y los desplazados). */
export interface Movement {
  dragId: string;
  from: string;
  to: string;
}

/** Por qué no se pudo mover un elemento. */
export type RejectReason =
  | 'unknown' // el drag o la zona no existen
  | 'same-zone' // ya está en esa zona
  | 'locked' // el drag está bloqueado: no se puede mover
  | 'home-only' // la zona solo acepta a su dueño
  | 'full'; // no hay espacio y no se pudo reubicar a nadie

/** Ids de los drags bloqueados (`dragDisabled`). Ni se mueven ni se desplazan. */
export type LockedIds = ReadonlySet<string>;

const NONE_LOCKED: LockedIds = new Set();

export type MoveResult =
  | { ok: true; layout: Layout; movements: Movement[] }
  | { ok: false; reason: RejectReason };

/**
 * Devuelve la zona en la que está un drag, o `undefined` si no está en ninguna.
 */
export const locate = (layout: Layout, dragId: string): string | undefined =>
  Object.keys(layout).find((zoneId) => layout[zoneId].includes(dragId));

/**
 * Arma el layout inicial agrupando cada drag en su home, respetando el orden de declaración.
 * Las zonas sin drags quedan con una lista vacía.
 *
 * @param zoneIds - Ids de todas las zonas, en orden de declaración.
 * @param drags - Drags con su home, en orden de declaración.
 */
export const layoutFromHomes = (zoneIds: string[], drags: Array<{ id: string; home: string }>): Layout => {
  const layout: Layout = {};

  zoneIds.forEach((zoneId) => {
    layout[zoneId] = [];
  });

  drags.forEach(({ id, home }) => {
    // Un drag declarado en una zona desconocida no se pierde: se crea la zona.
    (layout[home] ??= []).push(id);
  });

  return layout;
};

const capacityOf = (zones: Zones, zoneId: string): number => zones[zoneId]?.capacity ?? Infinity;

const hasRoom = (layout: Layout, zones: Zones, zoneId: string): boolean =>
  layout[zoneId].length < capacityOf(zones, zoneId);

/** Una zona `homeOnly` solo recibe a su dueño. */
const accepts = (zones: Zones, homes: Homes, dragId: string, zoneId: string): boolean =>
  !zones[zoneId]?.homeOnly || homes[dragId] === zoneId;

/**
 * Mueve un drag a una zona.
 *
 * Si la zona está llena, desplaza a los ocupantes más antiguos hasta que haya espacio. Cada
 * desplazado vuelve a su home; si el home no tiene espacio ni lo acepta, ocupa el lugar que
 * dejó el drag que llegó (intercambio). Si no hay a dónde mandarlo, el movimiento se rechaza y
 * nada cambia.
 *
 * Los drags bloqueados (`locked`) no se pueden mover ni desplazar: ocupan su lugar en la zona y,
 * si por ellos no queda espacio, el movimiento se rechaza.
 *
 * Nunca modifica `layout`: devuelve uno nuevo.
 */
export const moveDrag = (
  layout: Layout,
  zones: Zones,
  homes: Homes,
  dragId: string,
  toZone: string,
  locked: LockedIds = NONE_LOCKED
): MoveResult => {
  const from = locate(layout, dragId);

  if (from === undefined || !(toZone in layout)) return { ok: false, reason: 'unknown' };
  if (from === toZone) return { ok: false, reason: 'same-zone' };
  if (locked.has(dragId)) return { ok: false, reason: 'locked' };
  if (!accepts(zones, homes, dragId, toZone)) return { ok: false, reason: 'home-only' };

  const capacity = capacityOf(zones, toZone);

  // Una zona sin capacidad no puede recibir nada, ni siquiera desplazando a alguien.
  if (capacity < 1) return { ok: false, reason: 'full' };

  const next: Layout = { ...layout };
  const movements: Movement[] = [];

  // El arrastrado sale de su zona de origen antes de calcular a dónde van los desplazados,
  // porque ese espacio liberado puede ser justo el destino de uno de ellos.
  next[from] = next[from].filter((id) => id !== dragId);

  const toDisplace = Math.max(0, next[toZone].length - capacity + 1);

  // Se desplazan los más antiguos que no estén bloqueados. Si no alcanzan, no hay forma de hacer lugar.
  const displaced = next[toZone].filter((id) => !locked.has(id)).slice(0, toDisplace);

  if (displaced.length < toDisplace) return { ok: false, reason: 'full' };

  next[toZone] = next[toZone].filter((id) => !displaced.includes(id));

  for (const id of displaced) {
    const home = homes[id];
    const target =
      home !== undefined && home !== toZone && home in next && hasRoom(next, zones, home) && accepts(zones, homes, id, home)
        ? home
        : hasRoom(next, zones, from) && accepts(zones, homes, id, from)
          ? from
          : undefined;

    if (target === undefined) return { ok: false, reason: 'full' };

    next[target] = [...next[target], id];
    movements.push({ dragId: id, from: toZone, to: target });
  }

  next[toZone] = [...next[toZone], dragId];
  movements.unshift({ dragId, from, to: toZone });

  return { ok: true, layout: next, movements };
};

/**
 * Indica si un drag puede ir a una zona (para el menú de movimiento y para `canDrop`).
 */
export const canMove = (
  layout: Layout,
  zones: Zones,
  homes: Homes,
  dragId: string,
  toZone: string,
  locked: LockedIds = NONE_LOCKED
): boolean => moveDrag(layout, zones, homes, dragId, toZone, locked).ok;

/**
 * Reordena un drag dentro de la zona donde está actualmente.
 *
 * Devuelve el mismo `layout` (misma referencia) si no hay nada que cambiar: el drag no está en
 * ninguna zona o ya está en el extremo hacia el que se le pide ir.
 */
export const reorderDrag = (layout: Layout, dragId: string, command: ReorderCommand): Layout => {
  const zoneId = locate(layout, dragId);

  if (zoneId === undefined) return layout;

  const items = layout[zoneId];
  const index = items.indexOf(dragId);
  const last = items.length - 1;

  const target = {
    top: 0,
    up: Math.max(0, index - 1),
    down: Math.min(last, index + 1),
    bottom: last,
  }[command];

  if (target === index) return layout;

  const reordered = items.filter((id) => id !== dragId);
  reordered.splice(target, 0, dragId);

  return { ...layout, [zoneId]: reordered };
};

/**
 * Ids de los drags que están en una zona que los considera correctos.
 *
 * La validez se calcula siempre a partir de dónde está cada elemento: no hay un estado aparte
 * que pueda quedar desactualizado.
 */
export const validDrags = (layout: Layout, zones: Zones): string[] =>
  Object.keys(layout).flatMap((zoneId) => {
    const accepted = zones[zoneId]?.validate;

    return accepted ? layout[zoneId].filter((id) => accepted.includes(id)) : [];
  });
