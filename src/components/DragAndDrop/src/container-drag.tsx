import { forwardRef, useEffect, useRef } from "react";

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { useDragAndDropContext } from "./drag-and-drop-context";
import { DragAndDropTypes } from "../utils/const";
import { cn } from "@/utils/cn";

interface ContainerDragProps {
  id: string;
  children: React.ReactNode;
  addClass?: string;
  label: string;
}

interface ContainerDragComponent
  extends React.ForwardRefExoticComponent<
    React.PropsWithoutRef<ContainerDragProps> & React.RefAttributes<HTMLDivElement>
  > {
  _dndType?: DragAndDropTypes;
}

export const ContainerDrag = forwardRef<HTMLDivElement, ContainerDragProps>(
  ({ id, children, addClass, label, ...rest }, ref) => {
    const { validate } = useDragAndDropContext();

    const dropRef = useRef<HTMLDivElement>(null);
    const localRef = ref || dropRef;

    useEffect(() => {
      const element = (localRef as React.RefObject<HTMLDivElement>).current;

      if (!element) return;

      // Configuramos el elemento como contenedor de drop
      const cleanup = dropTargetForElements({
        element,
        canDrop: () => {
          if (validate) return false;
          return true;
        },
      });

      return cleanup;
    }, [id, validate, localRef]);

    return (
      <div
        ref={localRef as React.RefObject<HTMLDivElement>}
        data-drop-id={id}
        data-type={DragAndDropTypes.CONTAINER}
        role="region"
        aria-label={label}
        className={cn("c-droppable", addClass)}
        {...rest}
      >
        {children}
      </div>
    );
  }
) as ContainerDragComponent;

ContainerDrag._dndType = DragAndDropTypes.CONTAINER;
ContainerDrag.displayName = "ContainerDrag";
