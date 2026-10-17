import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

import type { DragAndDropContextType } from '../types/types';
import type { ReorderCommand } from '../utils/dnd-state';
import type { DndSnapshot, DndStore } from '../utils/dnd-store';
import type { DndMessages } from '../utils/messages';

const REORDER_COMMANDS: readonly string[] = ['top', 'up', 'down', 'bottom'];

/** Lo que el componente raíz comparte con sus zonas y drags. Es estable: casi nunca cambia. */
export interface DndInternalContext {
  store: DndStore;

  /** Identifica a esta instancia: evita que dos DragAndDrop en la misma página se mezclen. */
  storeKey: string;

  /** Con `true` la actividad está comprobada y nada se puede mover. */
  validate: boolean;

  messages: DndMessages;
}

/** Lo que cada zona comparte con lo que hay dentro de ella. */
export interface ZoneContextValue {
  /** Id de la zona. Para un drag declarado dentro, es su "home". */
  id: string;

  sortable: boolean;

  /** Lo llama `DragAndDrop.Items` al montarse. Devuelve la función que lo anula. */
  registerOutlet: () => () => void;
}

const InternalContext = createContext<DndInternalContext | null>(null);

InternalContext.displayName = 'DragAndDropContext';

/** Proveedor del contexto interno. Solo lo usa el componente raíz. */
export const DndRoot = InternalContext.Provider;

export const ZoneContext = createContext<ZoneContextValue | null>(null);

ZoneContext.displayName = 'DragAndDropZoneContext';

/**
 * Acceso al contexto interno. Falla con un mensaje claro si se usa fuera de `<DragAndDrop>`.
 */
export const useDndInternal = (): DndInternalContext => {
  const context = useContext(InternalContext);

  if (!context) {
    throw new Error('Los componentes de DragAndDrop deben usarse dentro de <DragAndDrop>.');
  }

  return context;
};

/** Zona que contiene al componente. Falla si no está dentro de un `Container` o un `Drop`. */
export const useZone = (component: string): ZoneContextValue => {
  const zone = useContext(ZoneContext);

  if (!zone) {
    throw new Error(`${component} debe estar dentro de un <DragAndDrop.Container> o un <DragAndDrop.Drop>.`);
  }

  return zone;
};

/** Foto actual del estado; el componente se vuelve a pintar cuando cambia. */
export const useDndSnapshot = (): DndSnapshot => {
  const { store } = useDndInternal();

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
};

/**
 * Contexto público del DragAndDrop. Úsalo en un componente hijo de `<DragAndDrop>` para reiniciar
 * la actividad, saber qué se está arrastrando o mover elementos por código.
 */
export const useDragAndDropContext = (): DragAndDropContextType => {
  const { store, validate } = useDndInternal();
  const snapshot = useDndSnapshot();

  return useMemo<DragAndDropContextType>(
    () => ({
      layout: snapshot.layout,
      listId: store.validIds(),
      validate,
      isDragging: snapshot.dragging,
      handleResetDnd: () => store.reset(),
      availableDropTargets: snapshot.zoneIds.map((id) => ({ id, label: snapshot.zones[id].label })),
      handleDragMove: (dragId, target) => {
        if (REORDER_COMMANDS.includes(target)) {
          store.reorder(dragId, target as ReorderCommand);
        } else {
          store.move(dragId, target);
        }
      },
    }),
    [snapshot, store, validate]
  );
};
