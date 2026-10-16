import { PopoverButton } from "../src/popover-button"
import { PopoverContent } from "../src/popover-content"

/**
 * Propiedades para el componente de popover.
 */
export interface PopoverProps {
    /**
     * El elemento que activa el popover.
     */
    children: JSX.Element;
    
    /**
     * Indica si el popover está visible.
     */
    isVisible?: boolean;
}


/**
 * Submódulos para el componente de popover.
 */
export type PopoverSubComponents = {
    /**
     * Componente para el contenido del popover.
     */
    Content: typeof PopoverContent;
    
    /**
     * Componente para el botón del popover.
     */
    Button: typeof PopoverButton;
}


/**
 * Tipo para el contexto del popover.
 */
export type PopoverContextType = {
    /**
     * Indica si el popover está abierto.
     */
    isPopoverOpen: boolean; 
    
    /**
     * Función para alternar la visibilidad del popover.
     */
    togglePopover: () => void;

    /**
     * Función para cerrar el popover (no hace nada si ya está cerrado).
     */
    closePopover: () => void;
    
    /**
     * Establece una referencia al botón que activa el popover.
     */
    setPopoverButtonRef: (button: HTMLButtonElement) => void; 
    
    /**
     * Referencia al botón que activa el popover.
     */
    popoverButtonRef: React.MutableRefObject<HTMLButtonElement | undefined>;

    /**
     * Id del contenido del popover, que el botón declara en `aria-controls`.
     * Es undefined mientras el contenido no está montado.
     */
    contentId: string | undefined;

    /**
     * Registra el id del contenido del popover.
     */
    setContentId: (id: string | undefined) => void;

    /**
     * Id que recibe el botón si no trae uno propio.
     */
    triggerId: string;
}


/**
 * Tipo para los tipos de posiciones de popover.
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
 * Propiedades para el componente de contenido del popover.
 */
export interface PopoverContentProps {
    /**
     * Identificador opcional para el contenido del popover.
     */
    id?: string;
    
    /**
     * Elementos hijos que se mostrarán dentro del popover.
     */
    children: React.ReactNode;
    
    /**
     * Clase adicional para aplicar estilos personalizados al contenido del popover.
     */
    addClass?: string;
    
    /**
     * Indica si el popover tiene una flecha.
     */
    hasArrow?: boolean;
    
    /**
     * Indica si el popover está deshabilitado.
     */
    isDisabled?: boolean;
    
    /**
     * Distancia entre el popover y su activador.
     */
    distance?: number;
    
    /**
     * Posicionamiento del popover.
     */
    placement?: placementsType;
    
    /**
     * Indica si se deshabilita la interacción fuera del popover.
     */
    disabledInteractOutside?: boolean;

    /**
     * Nombre accesible del popover. Si no se indica ni este ni `aria-labelledby`,
     * el popover se nombra con el texto del botón que lo abre.
     */
    'aria-label'?: string;

    /**
     * Id del elemento que nombra al popover.
     */
    'aria-labelledby'?: string;

    /**
     * Id del elemento que describe al popover.
     */
    'aria-describedby'?: string;
}
