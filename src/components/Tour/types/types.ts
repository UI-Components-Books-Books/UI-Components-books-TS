import { TourElement } from "../src/tour-element";
import { TourHelpLayer } from "../src/tour-layer";

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
export type StepType = {
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
export type AriaType = {
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


/**
 * Propiedades para el componente Tour.
 */
export interface TourProps {
    /**
     * Array de pasos que conforman el tour.
     */
    steps: Array<StepType>;
    
    /**
     * Indica si el tour está abierto.
     */
    isOpen: boolean;
    
    /**
     * Función que se llama para cerrar el tour.
     */
    onClose: () => void;
    
    /**
     * Referencia al elemento que debe recibir el foco al cerrar el tour.
     */
    finalFocusRef: string | string[];
    
    /**
     * Elementos hijos que se mostrarán dentro del tour.
     */
    children: JSX.Element[] | JSX.Element;
}


/**
 * Submódulos para el componente Tour.
 */
export type TourSubComponents = {
    /**
     * Componente para la capa de ayuda del tour.
     */
    Layer: typeof TourHelpLayer;
    
    /**
     * Componente para el elemento modal del tour.
     */
    Modal: typeof TourElement;
}


/**
 * Propiedades para el componente TourElement.
 */
export interface TourElementProps {
    /**
     * Clase adicional para la capa de ayuda del tour.
     */
    helpLayerClass?: string;
    
    /**
     * Indica si se oculta el botón de cerrar.
     */
    hideCloseButton?: boolean;
    
    /**
     * Indica si se oculta el botón de retroceder.
     */
    hideBackButton?: boolean;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Atributos ARIA para el elemento del tour.
     */
    ariaAttributes?: AriaType;
}


/**
 * Tipo para el contexto del tour.
 */
export interface TourContextType extends StepType {
    /**
     * Indica si el tour está abierto.
     */
    isOpen: boolean;
    
    /**
     * Identificador del último paso.
     */
    lastId: number;
    
    /**
     * Métodos para manejar el tour.
     */
    methods: MethodsType;
}

