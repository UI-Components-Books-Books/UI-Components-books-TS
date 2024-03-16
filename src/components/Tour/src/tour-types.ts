/**
 * Tipo para las posiciones posibles del elemento step.
 */
type placementsType =
    | 'auto'
    | 'auto-start'
    | 'auto-end'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end';

/**
 * Tipo que define un conjunto de métodos relacionados con las acciones del tour.
 */
export type MethodsType = {
    /**
     * Función llamada al avanzar al siguiente paso.
     */
    onNext: () => void;

    /**
     * Función llamada al retroceder al paso anterior.
     */
    onPrev: () => void;

    /**
     * Función llamada al cerrar o finalizar el tour.
     */
    onClose: () => void;
}

/**
 * Tipo que representa un paso para el tour.
 */
export type stepType = {
    /**
     * Identificador numérico del paso (opcional).
     */
    id?: number;

    /**
     * Selector o identificador del elemento asociado al paso (opcional).
     */
    target?: string;

    /**
     * Posición de la guía en relación con el elemento objetivo (opcional).
     */
    placement?: placementsType;

    /**
     * Contenido del paso, que puede ser un elemento de React (opcional).
     */
    content?: React.ReactNode;

    /**
     * Distancia del paso al elemento objetivo (opcional).
     */
    distance?: number;
}

/**
 * Tipo que define atributos ARIA (Accessible Rich Internet Applications) para la accesibilidad.
 */
export type ariaType = {
    /**
     * Rol del elemento en la interfaz de usuario (opcional).
     */
    role?: string;

    /**
     * Índice de tabulación del elemento (opcional).
     */
    tabIndex?: number;

    /**
     * Etiqueta ARIA para describir el propósito del elemento (opcional).
     */
    'aria-label'?: string;

    /**
     * Indicador booleano para especificar si el modal está activo o no (opcional).
     */
    'aria-modal'?: boolean;
}

/**
 * Enumeración que representa los estados del tour.
 */
export enum TourStateEnum {
    /**
     * Estado predeterminado.
     */
    default = 0,

    /**
     * Estado de inicio.
     */
    start = 1,
}
