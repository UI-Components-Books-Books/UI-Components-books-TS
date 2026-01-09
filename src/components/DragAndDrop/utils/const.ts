/**
 *  Propiedad utilizada para cambiar los estilos de los
 *  elementos arrastrables cuando se realiza la validación.
 */
export const PROPERTY_USE_TO_VALIDATION = 'data-validation';

export enum DragAndDropTypes {
  CONTAINER = 'dnd-container-drag-item',
  DRAGGABLE = 'dnd-drag-item',
  DROPPABLE = 'dnd-drop-item',
  DRAGGABLE_MOVE_BUTTON = 'dnd-drag-move-button'
}
