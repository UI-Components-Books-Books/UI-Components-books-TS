/**
 * Store del DragAndDrop: guarda dónde está cada drag y qué zonas existen.
 *
 * No depende de React. Los componentes se registran aquí cuando se montan y se suscriben con
 * `useSyncExternalStore`; las reglas de movimiento viven en `dnd-state.ts`.
 *
 * Que sea un store (y no estado de React dentro del componente raíz) permite que los manejadores
 * de arrastre y del menú lean siempre el estado más reciente y avisen de los cambios fuera de
 * cualquier función de renderizado.
 */
import {
  canMove as canMoveDrag,
  layoutFromHomes,
  locate,
  moveDrag,
  reorderDrag,
  validDrags,
  type Homes,
  type Layout,
  type LockedIds,
  type Movement,
  type MoveResult,
  type ReorderCommand,
  type ZoneRule,
} from './dnd-state';

/** Una zona registrada: sus reglas más lo necesario para mostrarla. */
export interface ZoneEntry extends ZoneRule {
  label: string;

  /** Si es `true`, sus drags se pintan en el orden del estado y se pueden reordenar. */
  sortable: boolean;
}

/** Un drag registrado. */
export interface DragEntry {
  /** Zona en la que se declaró. */
  home: string;

  label: string;

  /** Si es `true`, el drag no se puede mover ni desplazar (`dragDisabled`). */
  locked: boolean;
}

/** Un marcador: el elemento vacío de una zona donde se pinta un drag. */
export interface SlotEntry {
  zoneId: string;
  element: HTMLElement;
}

/** Foto inmutable del estado. Cada cambio produce un objeto nuevo. */
export interface DndSnapshot {
  layout: Layout;

  /** Zonas registradas, en orden de declaración. */
  zoneIds: string[];
  zones: Record<string, ZoneEntry>;

  /** Drags registrados, en orden de declaración. */
  dragIds: string[];
  drags: Record<string, DragEntry>;

  /**
   * Elementos del DOM donde se pinta cada drag que no está inline (por id de drag), junto con la
   * zona a la que pertenece cada uno. Un drag solo usa el marcador de su zona actual.
   */
  slots: Record<string, SlotEntry>;

  /** Id del drag que se está arrastrando ahora, si lo hay. */
  dragging: string | null;

  /** Drag al que hay que devolverle el foco tras un movimiento hecho con el menú. */
  focusRequest: string | null;
}

/** Cómo se originó un movimiento. */
export type MoveSource = 'pointer' | 'menu' | 'api';

export type DndEvent =
  | { type: 'move'; movements: Movement[]; layout: Layout; source: MoveSource }
  | { type: 'reorder'; dragId: string; layout: Layout }
  | { type: 'reset'; layout: Layout };

export interface MoveOptions {
  source?: MoveSource;

  /** Devuelve el foco al botón del drag cuando termine de pintarse en su nuevo lugar. */
  restoreFocus?: boolean;
}

const sameList = (a: string[] | undefined, b: string[] | undefined) =>
  a === b || (!!a && !!b && a.length === b.length && a.every((value, index) => value === b[index]));

const sameZone = (a: ZoneEntry, b: ZoneEntry) =>
  a.label === b.label &&
  a.capacity === b.capacity &&
  a.homeOnly === b.homeOnly &&
  a.sortable === b.sortable &&
  sameList(a.validate, b.validate);

const sameLayout = (a: Layout, b: Layout) => {
  const keys = Object.keys(a);

  return keys.length === Object.keys(b).length && keys.every((key) => sameList(a[key], b[key]));
};

const cloneLayout = (layout: Layout): Layout =>
  Object.fromEntries(Object.entries(layout).map(([zoneId, ids]) => [zoneId, [...ids]]));

const omit = <T>(record: Record<string, T>, key: string): Record<string, T> => {
  const rest = { ...record };

  delete rest[key];

  return rest;
};

/**
 * Crea un store.
 *
 * @param initialLayout - Posiciones iniciales (`defaultState`). Los drags que no aparezcan aquí
 * empiezan en su home.
 */
export const createDndStore = (initialLayout: Layout = {}) => {
  let state: DndSnapshot = {
    layout: cloneLayout(initialLayout),
    zoneIds: [],
    zones: {},
    dragIds: [],
    drags: {},
    slots: {},
    dragging: null,
    focusRequest: null,
  };

  const listeners = new Set<() => void>();
  const eventListeners = new Set<(event: DndEvent) => void>();

  // Cuántos componentes tienen registrado cada id. Mientras un id tenga al menos uno, no se borra.
  const zoneUsers = new Map<string, number>();
  const dragUsers = new Map<string, number>();

  const set = (patch: Partial<DndSnapshot>) => {
    state = { ...state, ...patch };
    [...listeners].forEach((listener) => listener());
  };

  const emit = (event: DndEvent) => {
    [...eventListeners].forEach((listener) => listener(event));
  };

  const homes = (): Homes => Object.fromEntries(state.dragIds.map((id) => [id, state.drags[id].home]));

  const locked = (): LockedIds => new Set(state.dragIds.filter((id) => state.drags[id].locked));

  /**
   * Libera un registro. El borrado real se aplaza a un microtask: así, un componente que se
   * desmonta y se vuelve a montar de inmediato (StrictMode, o un efecto que se re-ejecuta) no pierde
   * su posición.
   */
  const release = (users: Map<string, number>, id: string, remove: (id: string) => void) => {
    users.set(id, (users.get(id) ?? 1) - 1);

    queueMicrotask(() => {
      if ((users.get(id) ?? 0) <= 0) {
        users.delete(id);
        remove(id);
      }
    });
  };

  const removeZone = (zoneId: string) => {
    if (!(zoneId in state.zones)) return;

    const zoneIds = state.zoneIds.filter((id) => id !== zoneId);
    const orphans = state.layout[zoneId] ?? [];
    const layout = omit(state.layout, zoneId);

    // Los drags que estaban en la zona que desaparece regresan a su home.
    orphans.forEach((dragId) => {
      const home = state.drags[dragId]?.home;

      if (home && home !== zoneId && home in layout) layout[home] = [...layout[home], dragId];
    });

    set({ zones: omit(state.zones, zoneId), zoneIds, layout });
  };

  const removeDrag = (dragId: string) => {
    if (!(dragId in state.drags)) return;

    const layout = Object.fromEntries(
      Object.entries(state.layout).map(([zoneId, ids]) => [zoneId, ids.filter((id) => id !== dragId)])
    );

    set({
      drags: omit(state.drags, dragId),
      dragIds: state.dragIds.filter((id) => id !== dragId),
      slots: omit(state.slots, dragId),
      layout,
      dragging: state.dragging === dragId ? null : state.dragging,
      focusRequest: state.focusRequest === dragId ? null : state.focusRequest,
    });
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    /** Para los callbacks del usuario y los anuncios: se llama en cada cambio hecho por una acción. */
    subscribeEvents(listener: (event: DndEvent) => void) {
      eventListeners.add(listener);

      return () => {
        eventListeners.delete(listener);
      };
    },

    getSnapshot: () => state,

    /* ───────────── Registro ───────────── */

    /** Registra una zona (o actualiza sus reglas). Devuelve la función que la libera. */
    registerZone(zoneId: string, entry: ZoneEntry) {
      zoneUsers.set(zoneId, (zoneUsers.get(zoneId) ?? 0) + 1);

      const existing = state.zones[zoneId];
      const hasLayout = zoneId in state.layout;

      if (!existing || !sameZone(existing, entry) || !hasLayout) {
        set({
          zones: { ...state.zones, [zoneId]: entry },
          zoneIds: existing ? state.zoneIds : [...state.zoneIds, zoneId],
          layout: hasLayout ? state.layout : { ...state.layout, [zoneId]: [] },
        });
      }

      let released = false;

      return () => {
        if (released) return;

        released = true;
        release(zoneUsers, zoneId, removeZone);
      };
    },

    /** Registra un drag (o actualiza su home/etiqueta). Si no tenía posición, entra en su home. */
    registerDrag(dragId: string, entry: DragEntry) {
      dragUsers.set(dragId, (dragUsers.get(dragId) ?? 0) + 1);

      const existing = state.drags[dragId];
      const isPlaced = locate(state.layout, dragId) !== undefined;

      if (
        !existing ||
        existing.home !== entry.home ||
        existing.label !== entry.label ||
        existing.locked !== entry.locked ||
        !isPlaced
      ) {
        set({
          drags: { ...state.drags, [dragId]: entry },
          dragIds: existing ? state.dragIds : [...state.dragIds, dragId],
          layout: isPlaced
            ? state.layout
            : { ...state.layout, [entry.home]: [...(state.layout[entry.home] ?? []), dragId] },
        });
      }

      let released = false;

      return () => {
        if (released) return;

        released = true;
        release(dragUsers, dragId, removeDrag);
      };
    },

    /** Registra el elemento donde una zona pinta un drag que no está inline. */
    registerSlot(dragId: string, zoneId: string, element: HTMLElement) {
      if (state.slots[dragId]?.element !== element) {
        set({ slots: { ...state.slots, [dragId]: { zoneId, element } } });
      }

      return () => {
        // Solo se quita si sigue siendo el mismo elemento: otro marcador pudo tomar su lugar.
        if (state.slots[dragId]?.element === element) set({ slots: omit(state.slots, dragId) });
      };
    },

    /* ───────────── Acciones ───────────── */

    move(dragId: string, zoneId: string, { source = 'api', restoreFocus = false }: MoveOptions = {}): MoveResult {
      const result = moveDrag(state.layout, state.zones, homes(), dragId, zoneId, locked());

      if (!result.ok) return result;

      set({ layout: result.layout, focusRequest: restoreFocus ? dragId : state.focusRequest });
      emit({ type: 'move', movements: result.movements, layout: result.layout, source });

      return result;
    },

    /** Reordena un drag dentro de su zona. Solo aplica en zonas `sortable`. Devuelve si cambió algo. */
    reorder(dragId: string, command: ReorderCommand, { restoreFocus = false }: MoveOptions = {}) {
      const zoneId = locate(state.layout, dragId);

      if (zoneId === undefined || !state.zones[zoneId]?.sortable || state.drags[dragId]?.locked) return false;

      const layout = reorderDrag(state.layout, dragId, command);

      if (layout === state.layout) return false;

      set({ layout, focusRequest: restoreFocus ? dragId : state.focusRequest });
      emit({ type: 'reorder', dragId, layout });

      return true;
    },

    /** Devuelve cada drag a su home. */
    reset() {
      const layout = layoutFromHomes(
        state.zoneIds,
        state.dragIds.map((id) => ({ id, home: state.drags[id].home }))
      );

      set({ layout, dragging: null, focusRequest: null });
      emit({ type: 'reset', layout });
    },

    /**
     * Aplica posiciones que vienen de fuera (`defaultState`). Los drags que no se mencionan, o que
     * se mencionan en una zona que no existe, quedan en su home. No emite eventos: no es una acción
     * del usuario.
     */
    syncLayout(external: Layout) {
      const next = layoutFromHomes(
        state.zoneIds,
        state.dragIds.map((id) => ({ id, home: state.drags[id].home }))
      );

      Object.entries(external).forEach(([zoneId, ids]) => {
        if (!(zoneId in next)) return;

        ids.forEach((id) => {
          if (!(id in state.drags)) return;

          Object.keys(next).forEach((key) => {
            next[key] = next[key].filter((other) => other !== id);
          });
          next[zoneId].push(id);
        });
      });

      if (!sameLayout(next, state.layout)) set({ layout: next });
    },

    setDragging(dragId: string | null) {
      if (state.dragging !== dragId) set({ dragging: dragId });
    },

    clearFocusRequest() {
      if (state.focusRequest !== null) set({ focusRequest: null });
    },

    /* ───────────── Consultas ───────────── */

    canMove: (dragId: string, zoneId: string) =>
      canMoveDrag(state.layout, state.zones, homes(), dragId, zoneId, locked()),

    /** Zonas a las que se puede mover un drag (sin contar la actual), en orden de declaración. */
    targetsFor: (dragId: string) =>
      state.zoneIds
        .filter((zoneId) => canMoveDrag(state.layout, state.zones, homes(), dragId, zoneId, locked()))
        .map((zoneId) => ({ id: zoneId, label: state.zones[zoneId].label })),

    validIds: () => validDrags(state.layout, state.zones),
  };
};

export type DndStore = ReturnType<typeof createDndStore>;
