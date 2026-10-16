import { forwardRef, useEffect, useMemo, useRef } from "react";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Popover } from "@components";
import { cn } from "@utils/cn";
import { mergeRefs } from "@utils/mergeRefs";

import { useDragAndDropContext } from "./drag-and-drop-context";
import { DragMoveButton } from "./drag-move-button";
import type { DraggableProps } from "../types/types";
import { DragAndDropTypes, PROPERTY_USE_TO_VALIDATION } from "../utils/const";

import "./drag-and-drop.css";

interface DraggableComponent
  extends React.ForwardRefExoticComponent<
    React.PropsWithoutRef<DraggableProps> & React.RefAttributes<HTMLDivElement>
  > {
  _dndType?: DragAndDropTypes;
}

export const Draggable = forwardRef<HTMLDivElement, DraggableProps>(
  ({ id, children, dragDisabled = false, addClass = "", label, handleDrag, ...rest }, ref) => {
    const dragRef = useRef<HTMLDivElement | null>(null);
    // Une la ref interna (la que usa el efecto de arrastre) con la que pueda pasar quien usa el
    // componente: si solo se usara una de las dos, el elemento dejaría de ser arrastrable.
    const setRefs = useMemo(() => mergeRefs(dragRef, ref), [ref]);

    const { validate, listId } = useDragAndDropContext();

    // Manejador para mover el elemento
    const handleMove = (targetDropId: string) => {
      if (handleDrag && id) {
        handleDrag(id, targetDropId);
      }
    };

    useEffect(() => {
      const element = dragRef.current;
      if (!element || dragDisabled) return;

      // Configuramos el elemento como arrastrable
      const cleanup = draggable({
        element,
        getInitialData: () => ({ id }),
        canDrag: () => !validate,
      });

      return cleanup;
    }, [id, dragDisabled, validate]);

    return (
      <div
        ref={setRefs}
        data-drag-id={id}
        data-type={DragAndDropTypes.DRAGGABLE}
        className={cn("c-draggable", addClass)}
        {...(validate && id && { [PROPERTY_USE_TO_VALIDATION]: !!listId.includes(id) })}
        {...rest}
      >
        <div className="c-draggable-content">
          <Popover>
            <DragMoveButton label={label} handleMove={handleMove}>
              {children}
            </DragMoveButton>
          </Popover>
        </div>
      </div>
    );
  }
) as DraggableComponent;

Draggable._dndType = DragAndDropTypes.DRAGGABLE;
Draggable.displayName = "Draggable";
