import { useEffect, useId, useMemo, useRef } from 'react';

import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { announce } from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { useIsomorphicLayoutEffect } from '@utils/useIsomorphicLayoutEffect';

import { ContainerDrag } from './container-drag';
import { Draggable } from './drag';
import { DndRoot } from './drag-and-drop-context';
import { Droppable } from './drop';
import { Items } from './items';
import type { DragAndDropProps, DragAndDropSubModules } from '../types/types';
import { createDndStore, type DndEvent, type DndStore } from '../utils/dnd-store';
import { resolveMessages } from '../utils/messages';

const DragAndDrop: React.FC<DragAndDropProps> & DragAndDropSubModules = ({
  id,
  children,
  validate = false,
  onValidate,
  defaultState,
  onState,
  onMove,
  messages: customMessages,
}) => {
  // Identifica a esta instancia frente a la librería de arrastre, que es global a toda la página.
  const storeKey = useId();

  const storeRef = useRef<DndStore>();

  if (!storeRef.current) storeRef.current = createDndStore(defaultState);

  const store = storeRef.current;

  const messages = useMemo(() => resolveMessages(customMessages), [customMessages]);

  // Los callbacks se leen siempre en su versión más reciente, sin volver a suscribirse a cada render.
  const latest = useRef({ id, onValidate, onState, onMove, messages });

  useIsomorphicLayoutEffect(() => {
    latest.current = { id, onValidate, onState, onMove, messages };
  });

  /**
   * Avisa de cada acción: callbacks de quien usa el componente y anuncio para lectores de pantalla.
   */
  useEffect(() => {
    const labelOf = (dragId: string) => store.getSnapshot().drags[dragId]?.label ?? dragId;
    const zoneLabelOf = (zoneId: string) => store.getSnapshot().zones[zoneId]?.label ?? zoneId;

    const announceEvent = (event: DndEvent, text: ReturnType<typeof resolveMessages>) => {
      if (event.type === 'move') {
        const [dragged, ...displaced] = event.movements;

        announce(
          text.moved({
            drag: labelOf(dragged.dragId),
            from: zoneLabelOf(dragged.from),
            to: zoneLabelOf(dragged.to),
            displaced: displaced.map((movement) => ({ drag: labelOf(movement.dragId), to: zoneLabelOf(movement.to) })),
          })
        );
      } else if (event.type === 'reorder') {
        const zoneId = Object.keys(event.layout).find((key) => event.layout[key].includes(event.dragId)) ?? '';

        announce(
          text.reordered({
            drag: labelOf(event.dragId),
            zone: zoneLabelOf(zoneId),
            position: event.layout[zoneId].indexOf(event.dragId) + 1,
            total: event.layout[zoneId].length,
          })
        );
      } else {
        announce(text.reset());
      }
    };

    return store.subscribeEvents((event) => {
      const current = latest.current;
      const validIds = store.validIds();

      if (event.type === 'move') {
        current.onMove?.({ movements: event.movements, source: event.source });
        current.onValidate?.({ validate: validIds, active: true });
      } else if (event.type === 'reset') {
        current.onValidate?.({ validate: [], active: false });
      }

      announceEvent(event, current.messages);
      current.onState?.({ id: current.id, state: event.layout, validateId: validIds });
    });
  }, [store]);

  /**
   * Conecta el arrastre con el puntero: qué se está arrastrando y dónde se suelta.
   * Solo atiende a los drags de esta instancia.
   */
  useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => source.data.storeKey === storeKey,
        onDragStart: ({ source }) => {
          if (typeof source.data.id === 'string') store.setDragging(source.data.id);
        },
        onDrop: ({ source, location }) => {
          store.setDragging(null);

          // El primer destino es el más interno; los que no aceptan el drag ya vienen descartados.
          const target = location.current.dropTargets[0];
          const dragId = source.data.id;
          const zoneId = target?.data.zoneId;

          if (typeof dragId === 'string' && typeof zoneId === 'string') {
            store.move(dragId, zoneId, { source: 'pointer' });
          }
        },
      }),
    [store, storeKey]
  );

  /**
   * Si `defaultState` cambia desde fuera, los drags se reubican. La primera vez no hace falta:
   * el store ya se creó con esas posiciones.
   */
  const defaultStateKey = defaultState ? JSON.stringify(defaultState) : undefined;
  const isFirstRender = useRef(true);

  useIsomorphicLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    if (defaultStateKey !== undefined) store.syncLayout(JSON.parse(defaultStateKey));
  }, [store, defaultStateKey]);

  const value = useMemo(() => ({ store, storeKey, validate, messages }), [store, storeKey, validate, messages]);

  return <DndRoot value={value}>{children}</DndRoot>;
};

DragAndDrop.Container = ContainerDrag;
DragAndDrop.Drag = Draggable;
DragAndDrop.Drop = Droppable;
DragAndDrop.Items = Items;

export { DragAndDrop };
