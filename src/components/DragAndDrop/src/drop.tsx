import { forwardRef, useEffect, useMemo, useRef } from 'react';

import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { cn } from "@utils/cn";
import { mergeRefs } from "@utils/mergeRefs";

import { useDragAndDropContext } from './drag-and-drop-context';
import { DragAndDropTypes } from '../utils/const';

import "./drag-and-drop.css";

interface DroppableProps {
  id: string;
  label: string;
  children?: React.ReactNode;
  validate?: string[];
  addClass?: string;
}

interface DroppableComponente
  extends React.ForwardRefExoticComponent<React.PropsWithoutRef<DroppableProps> & React.RefAttributes<HTMLDivElement>> {
  _dndType?: DragAndDropTypes;
}

export const Droppable = forwardRef<HTMLDivElement, DroppableProps>(
  ({ id, children, validate = [], addClass = '', label, ...rest }, ref) => {
    const { validate: isValidate } = useDragAndDropContext();
    const dropRef = useRef<HTMLDivElement | null>(null);
    // Une la ref interna con la que pueda pasar quien usa el componente (objeto o callback).
    const setRefs = useMemo(() => mergeRefs(dropRef, ref), [ref]);

    useEffect(() => {
      const element = dropRef.current;

      if (!element) return;

      // Configuramos el elemento como destino de drop
      const cleanup = dropTargetForElements({
        element,
        canDrop: () => {
          if (isValidate) return false;
          return true;
        }
      });

      return cleanup;
    }, [id, isValidate]);

    return (
      <div
        ref={setRefs}
        role="region"
        aria-label={label}
        data-drop-id={id}
        data-validate={validate.join(',')}
        data-type={DragAndDropTypes.DROPPABLE}
        className={cn('c-droppable', addClass)}
        {...rest}>
        {children}
      </div>
    );
  }
) as DroppableComponente;

Droppable._dndType = DragAndDropTypes.DROPPABLE;
Droppable.displayName = 'Droppable';
