import { forwardRef, useEffect, useMemo, useRef } from "react";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Popover } from "@components";
import { cn } from "@utils/cn";
import { mergeRefs } from "@utils/mergeRefs";
import { useIsomorphicLayoutEffect } from "@utils/useIsomorphicLayoutEffect";
import { createPortal } from "react-dom";

import { useDndInternal, useDndSnapshot, useZone } from "./drag-and-drop-context";
import { DragMoveButton } from "./drag-move-button";
import type { DraggableProps } from "../types/types";
import { DragAndDropTypes, PROPERTY_USE_TO_VALIDATION } from "../utils/const";
import { locate, validDrags } from "../utils/dnd-state";

import "./drag-and-drop.css";

/**
 * Lo que se pinta de un drag: el elemento arrastrable con su botón de mover y su contenido.
 */
const DragBody = forwardRef<HTMLDivElement, DraggableProps>(
  ({ id, label, children, addClass, className, dragging, dragDisabled = false, ...rest }, ref) => {
    const { store, storeKey, validate, messages } = useDndInternal();
    const { layout, zones, dragging: draggingId, focusRequest } = useDndSnapshot();

    const elementRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    // Une la ref interna (la que usa el efecto de arrastre) con la que pueda pasar quien usa el
    // componente: si solo se usara una de las dos, el elemento dejaría de ser arrastrable.
    const setRefs = useMemo(() => mergeRefs(elementRef, ref), [ref]);

    const isDragging = draggingId === id;
    const isValid = useMemo(() => validDrags(layout, zones).includes(id), [layout, zones, id]);

    useEffect(() => {
      const element = elementRef.current;

      if (!element || dragDisabled) return;

      // Configuramos el elemento como arrastrable
      return draggable({
        element,
        getInitialData: () => ({ id, storeKey }),
        canDrag: () => !validate,
      });
    }, [id, storeKey, dragDisabled, validate]);

    // Tras mover el elemento con el menú, el botón se vuelve a crear en su nuevo lugar: se le
    // devuelve el foco para que quien usa teclado o lector de pantalla no lo pierda.
    useIsomorphicLayoutEffect(() => {
      if (focusRequest === id) {
        buttonRef.current?.focus();
        store.clearFocusRequest();
      }
    }, [focusRequest, id, store]);

    return (
      <div
        {...rest}
        ref={setRefs}
        data-drag-id={id}
        data-type={DragAndDropTypes.DRAGGABLE}
        data-dragging={isDragging || undefined}
        data-disabled={dragDisabled || undefined}
        className={cn("c-draggable", addClass, className, isDragging && dragging)}
        {...(validate && { [PROPERTY_USE_TO_VALIDATION]: isValid })}
      >
        <div className="c-draggable-content">
          <Popover>
            <DragMoveButton dragId={id} label={label} disabled={validate || dragDisabled} buttonRef={buttonRef}>
              {children}
            </DragMoveButton>
          </Popover>
          {/* El color o el atributo `data-validation` no bastan para quien no ve la pantalla. */}
          {validate && <span className="u-sr-only">{messages.validationResult({ correct: isValid })}</span>}
        </div>
      </div>
    );
  }
);

DragBody.displayName = "DragBody";

/**
 * Elemento arrastrable. Se declara dentro de la zona donde empieza (su "home"), con o sin
 * wrappers o componentes propios de por medio.
 *
 * Mientras está en su home se pinta donde lo declaraste. Si pasa a otra zona, se pinta allí
 * (con un portal) pero sigue siendo el mismo componente de React: conserva su contexto, y en su
 * home quedan los wrappers que lo rodeaban, por ejemplo una celda vacía.
 */
export const Draggable = forwardRef<HTMLDivElement, DraggableProps>((props, ref) => {
  const { id, label, dragDisabled = false } = props;
  const { store } = useDndInternal();
  const { id: home } = useZone("DragAndDrop.Drag");
  const { layout, zones, slots } = useDndSnapshot();

  // Un drag deshabilitado queda bloqueado en el estado: ni se mueve ni lo desplaza otro elemento.
  useIsomorphicLayoutEffect(
    () => store.registerDrag(id, { home, label, locked: dragDisabled }),
    [store, id, home, label, dragDisabled]
  );

  // Mientras no se haya registrado, o si su zona actual no existe, el drag está en su home.
  const current = locate(layout, id) ?? home;
  const zone = zones[current];

  const body = <DragBody {...props} ref={ref} />;

  // En su home, y salvo que la zona sea `sortable`, se pinta donde se declaró.
  if (!zone || (current === home && !zone.sortable)) return body;

  // En otra zona (o en una `sortable`) se pinta en el marcador que esa zona reservó para él.
  const slot = slots[id];

  if (slot && slot.zoneId === current) return createPortal(body, slot.element);

  // Una zona `sortable` todavía sin marcador: se pinta donde se declaró hasta que lo tenga.
  return current === home ? body : null;
});

Draggable.displayName = "Draggable";
