import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { cn } from '@utils/cn';
import { mergeRefs } from '@utils/mergeRefs';
import { useIsomorphicLayoutEffect } from '@utils/useIsomorphicLayoutEffect';

import { useDndInternal, useDndSnapshot, ZoneContext, type ZoneContextValue } from './drag-and-drop-context';
import { Markers } from './items';
import type { ZoneProps } from '../types/types';
import type { DragAndDropTypes } from '../utils/const';

import './drag-and-drop.css';

interface ZoneInternalProps extends ZoneProps {
  /** Valor de `data-type`: distingue un Container de un Drop en el DOM. */
  zoneType: DragAndDropTypes;

  /** Capacidad si la zona no declara `capacity`. */
  defaultCapacity: number;
}

/**
 * Zona compartida por `Container` y `Drop`: una zona donde pueden estar drags.
 *
 * Pinta sus hijos tal cual. No inspecciona ni reemplaza su contenido, así que puede llevar
 * títulos, imágenes o cualquier otra cosa, y los drags pueden estar dentro de wrappers o de
 * componentes propios.
 */
export const Zone = forwardRef<HTMLDivElement, ZoneInternalProps>(
  (
    {
      id,
      label,
      children,
      addClass,
      className,
      over,
      capacity,
      defaultCapacity,
      homeOnly = false,
      sortable = false,
      validate,
      zoneType,
      ...rest
    },
    ref
  ) => {
    const { store, storeKey, validate: locked, messages } = useDndInternal();
    const { layout } = useDndSnapshot();

    const elementRef = useRef<HTMLDivElement | null>(null);
    // Une la ref interna con la que pueda pasar quien usa el componente (objeto o callback).
    const setRefs = useMemo(() => mergeRefs(elementRef, ref), [ref]);

    const [isOver, setIsOver] = useState(false);
    // La zona sabe qué contiene solo después de que sus drags se hayan registrado.
    const [isReady, setIsReady] = useState(false);
    const [outlets, setOutlets] = useState(0);

    const effectiveCapacity = capacity ?? defaultCapacity;
    // Se compara por contenido: `validate={['A']}` es un arreglo nuevo en cada render.
    const validateKey = validate === undefined ? undefined : JSON.stringify(validate);

    useIsomorphicLayoutEffect(() => {
      const accepted = validateKey === undefined ? undefined : (JSON.parse(validateKey) as string[]);
      const release = store.registerZone(id, {
        label,
        capacity: effectiveCapacity,
        homeOnly,
        sortable,
        validate: accepted,
      });

      setIsReady(true);

      return release;
    }, [store, id, label, effectiveCapacity, homeOnly, sortable, validateKey]);

    useEffect(() => {
      const element = elementRef.current;

      if (!element) return;

      return dropTargetForElements({
        element,
        getData: () => ({ zoneId: id, storeKey }),
        canDrop: ({ source }) =>
          !locked &&
          source.data.storeKey === storeKey &&
          typeof source.data.id === 'string' &&
          store.canMove(source.data.id, id),
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: () => setIsOver(false),
      });
    }, [store, storeKey, id, locked]);

    const registerOutlet = useCallback(() => {
      setOutlets((count) => count + 1);

      return () => setOutlets((count) => count - 1);
    }, []);

    const zone = useMemo<ZoneContextValue>(
      () => ({ id, sortable, registerOutlet }),
      [id, sortable, registerOutlet]
    );

    const isEmpty = isReady && (layout[id]?.length ?? 0) === 0;

    return (
      <ZoneContext.Provider value={zone}>
        <div
          {...rest}
          ref={setRefs}
          role="group"
          aria-label={isEmpty ? messages.emptyZone({ zone: label }) : label}
          data-drop-id={id}
          data-type={zoneType}
          data-empty={isEmpty || undefined}
          data-over={isOver || undefined}
          className={cn('c-droppable', addClass, className, isOver && 'c-droppable--active', isOver && over)}
        >
          {children}
          {/* Sin `DragAndDrop.Items`, los drags de otras zonas se pintan al final. Se espera a que la
              zona esté montada para saber si hay uno: así nunca se pintan dos juegos de marcadores. */}
          {isReady && outlets === 0 && <Markers zoneId={id} sortable={sortable} />}
        </div>
      </ZoneContext.Provider>
    );
  }
);

Zone.displayName = 'Zone';
