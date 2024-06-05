import type { Announcements } from '@dnd-kit/core'

import { ContainerDrag } from '../src/container-drag'
import { Draggable } from '../src/drag'
import { Droppable } from '../src/drop'

/**
 * Tipo que representa los modificadores permitidos por el componente.
 * 
 * @typedef {'restrictToVerticalAxis' | 'restrictToHorizontalAxis'} ModifiersType
 */
export type ModifiersType = 'restrictToVerticalAxis' | 'restrictToHorizontalAxis';


/**
 * Tipo que representa los elementos y sus IDs asociados.
 * 
 * @typedef {Object} ItemType
 * @property {string[]} [key] - Array de IDs asociados a cada clave.
 */
export type ItemType = {
    [key: string]: string[];
};


/**
 * Propiedades para el componente Droppable.
 */
export interface DroppableProps {
    /**
     * ID del droppable.
     */
    id?: string;

    /**
     * Hijos del droppable.
     */
    children: React.ReactNode | React.ReactNode[];

    /**
     * Validaciones asociadas.
     */
    validate: string[];

    /**
     * Clase CSS adicional.
     */
    addClass?: string;

    /**
     * Clase CSS cuando está sobre un droppable.
     */
    over?: string;

    /**
     * Etiqueta del droppable.
     */
    label: string;

    /**
     * Tipo del droppable.
     */
    __TYPE?: 'droppable';
}


/**
 * Tipo que representa los atributos ARIA para elementos arrastrables.
 */
type AttributeDragType = {
    /**
     * Rol ARIA del elemento.
     */
    role: string;
    
    /**
     * Descripción del rol ARIA.
     */
    roleDescription: string;
    
    /**
     * Índice de tabulación del elemento.
     */
    tabIndex: number;
};


/**
 * Propiedades para el componente Draggable.
 */
export interface DraggableProps {
    /**
     * ID del draggable.
     */
    id?: string;

    /**
     * Hijos del draggable.
     */
    children: React.ReactNode | React.ReactNode[];

    /**
     * Clase CSS adicional.
     */
    addClass?: string;

    /**
     * Clase CSS cuando está siendo arrastrado.
     */
    dragging?: string;

    /**
     * Etiqueta del draggable.
     */
    label: string;

    /**
     * Atributos ARIA del draggable.
     */
    attribute?: AttributeDragType;

    /**
     * Tipo del draggable.
     */
    __TYPE?: 'draggable';
}


/**
 * Propiedades para el componente DragAndDrop.
 */
export interface DragAndDropProps {
    /**
     * ID del componente DragAndDrop.
     */
    id: string;

    /**
     * Hijos del componente.
     */
    children: JSX.Element[] | JSX.Element;

    /**
     * Permite arrastrar múltiples elementos.
     */
    multipleDrags?: boolean;

    /**
     * Función de validación.
     */
    onValidate?: ({ validate, active }: { validate: string[]; active: boolean; }) => void;

    /**
     * Indica si la validación está activa.
     */
    validate?: boolean;

    /**
     * Propiedad de validación.
     */
    propValidate?: string;

    /**
     * Modificadores del DragAndDrop.
     */
    modifiers?: ModifiersType;

    /**
     * Instrucciones para lectores de pantalla.
     */
    screenReaderInstructions?: string;

    /**
     * Anuncios ARIA.
     */
    announcements?: Announcements;

    /**
     * Estado por defecto del DragAndDrop.
     */
    defaultState?: ItemType;

    /**
     * Validaciones por defecto.
     */
    defaultValidate?: string[];

    /**
     * Función de actualización de estado.
     */
    onState?: ({ id, state, validateId }: { id: string, state: ItemType, validateId: string[] }) => void;
}


/**
 * Tipos de submódulos disponibles para el componente DragAndDrop.
 */
export type DragAndDropSubModules = {
    /**
     * Submódulo para el contenedor de arrastre.
     */
    Container: typeof ContainerDrag;

    /**
     * Submódulo para el elemento arrastrable.
     */
    Drag: typeof Draggable;

    /**
     * Submódulo para el elemento droppable.
     */
    Drop: typeof Droppable;
}


/**
 * Contexto para el componente DragAndDrop.
 */
export type DragAndDropContextType = {
    /**
     * Lista de IDs.
     */
    listId: string[];

    /**
     * Propiedad de validación.
     */
    propValidate: string;

    /**
     * Indica si la validación está activa.
     */
    validate: boolean;

    /**
     * ID del elemento que se está arrastrando.
     */
    isDragging: string | null;

    /**
     * Función para reiniciar el DragAndDrop.
     */
    handleResetDnd: () => void;
}


/**
 * Propiedades para el componente ContainerDrag.
 */
export interface ContainerDragProps {
    /**
     * ID del contenedor.
     */
    id?: string;

    /**
     * Hijos del contenedor.
     */
    children: JSX.Element | JSX.Element[];

    /**
     * Clase CSS adicional.
     */
    addClass?: string;

    /**
     * Clase CSS cuando está sobre un contenedor.
     */
    over?: string;

    /**
     * Etiqueta del contenedor.
     */
    label: string;

    /**
     * Tipo del contenedor.
     */
    __TYPE?: 'general-draggable';
}

