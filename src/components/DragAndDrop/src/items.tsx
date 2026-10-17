import { useCallback, useRef } from 'react';

import { useIsomorphicLayoutEffect } from '@utils/useIsomorphicLayoutEffect';

import { useDndInternal, useDndSnapshot, useZone } from './drag-and-drop-context';

/**
 * Elemento vacío donde se pinta (con un portal) un drag que no está inline.
 * `display: contents` hace que no genere caja: el drag se comporta como hijo directo de la zona
 * (por ejemplo, como celda de un grid).
 */
const Marker = ({ dragId, zoneId }: { dragId: string; zoneId: string }) => {
  const { store } = useDndInternal();
  const release = useRef<(() => void) | null>(null);

  const setElement = useCallback(
    (element: HTMLElement | null) => {
      release.current?.();
      release.current = element ? store.registerSlot(dragId, zoneId, element) : null;
    },
    [store, dragId, zoneId]
  );

  return <span ref={setElement} data-dnd-slot={dragId} style={{ display: 'contents' }} />;
};

/**
 * Marcadores de los drags que esta zona debe pintar ella misma: los que vienen de otras zonas
 * y, en una zona `sortable`, todos (para que el orden del DOM sea el del estado).
 */
export const Markers = ({ zoneId, sortable }: { zoneId: string; sortable: boolean }) => {
  const { layout, drags } = useDndSnapshot();
  const ids = (layout[zoneId] ?? []).filter((dragId) => sortable || drags[dragId]?.home !== zoneId);

  return (
    <>
      {ids.map((dragId) => (
        <Marker key={dragId} dragId={dragId} zoneId={zoneId} />
      ))}
    </>
  );
};

/**
 * Lugar, dentro de una zona, donde se pintan los drags que no se declararon en ella.
 *
 * Sin él, esos drags aparecen al final de la zona. Úsalo cuando la zona tenga contenido propio
 * y los drags deban ir en un punto concreto. No genera ningún elemento: envuélvelo en el que
 * necesites. Usa solo uno por zona.
 *
 * @example
 * <DragAndDrop.Drop id="z1" label="Zona 1">
 *   <h4>Clasifica aquí</h4>
 *   <div className="lista"><DragAndDrop.Items /></div>
 *   <p>Pista: …</p>
 * </DragAndDrop.Drop>
 */
export const Items = () => {
  const zone = useZone('DragAndDrop.Items');
  const { registerOutlet } = zone;

  useIsomorphicLayoutEffect(() => registerOutlet(), [registerOutlet]);

  return <Markers zoneId={zone.id} sortable={zone.sortable} />;
};

Items.displayName = 'Items';
