import { forwardRef } from 'react';

import { Zone } from './zone';
import type { ContainerDragProps } from '../types/types';
import { DragAndDropTypes } from '../utils/const';

/**
 * Zona sin límite de drags por defecto; típicamente el banco de donde parten los elementos.
 * Usa `homeOnly` para dar a cada drag su propia celda, y `capacity` para limitarla.
 */
export const ContainerDrag = forwardRef<HTMLDivElement, ContainerDragProps>((props, ref) => (
  <Zone {...props} ref={ref} zoneType={DragAndDropTypes.CONTAINER} defaultCapacity={Infinity} />
));

ContainerDrag.displayName = 'ContainerDrag';
