import { forwardRef } from 'react';

import { Zone } from './zone';
import type { DroppableProps } from '../types/types';
import { DragAndDropTypes } from '../utils/const';

/**
 * Zona de destino. Por defecto acepta un solo drag a la vez: si se suelta otro, el anterior
 * vuelve a su zona de origen. Usa `capacity` para cambiarlo y `validate` para indicar qué
 * drags se consideran correctos aquí.
 */
export const Droppable = forwardRef<HTMLDivElement, DroppableProps>((props, ref) => (
  <Zone {...props} ref={ref} zoneType={DragAndDropTypes.DROPPABLE} defaultCapacity={1} />
));

Droppable.displayName = 'Droppable';
