import { forwardRef, useEffect, useRef } from 'react';

import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { cn } from "@utils/cn";

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
    const dropRef = useRef<HTMLDivElement>(null);
    const localRef = ref || dropRef;

    useEffect(() => {
      const element = (localRef as React.RefObject<HTMLDivElement>).current;

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
    }, [id, isValidate, localRef]);

    return (
      <div
        ref={localRef as React.RefObject<HTMLDivElement>}
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
