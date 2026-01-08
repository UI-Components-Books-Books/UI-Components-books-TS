import { ModalCloseButton } from '../src/modal-close-button'
import { ModalContent } from '../src/modal-content'
import { ModalOverlay } from '../src/modal-overlay'

/**
 * Propiedades para el componente de Modales.
 */
export interface ModalProps {
    /**
     * Identificador opcional para el modal.
     */
    id?: string;

    /**
     * Elementos hijos que se mostrarán dentro del modal.
     */
    children?: JSX.Element | JSX.Element[];

    /**
     * Indica si el modal está abierto.
     */
    isOpen: boolean;

    /**
     * Función que se llama para cerrar el modal.
     */
    onClose: () => void;

    /**
     * Referencia al elemento que debe recibir el foco al cerrar el modal.
     * Si no se especifica, el focus volverá al elemento que lo tenía antes de abrir el modal.
     */
    finalFocusRef?: string | string[];
}


/**
 * Submódulos para el componente de Modales.
 */
export type ModalSubModules = {
    /**
     * Componente para el contenido del modal.
     */
    Content: typeof ModalContent;

    /**
     * Componente para la superposición del modal.
     */
    Overlay: typeof ModalOverlay;

    /**
     * Componente para el botón de cerrar el modal.
     */
    CloseButton: typeof ModalCloseButton;
}


/**
 * Propiedades para el componente de Superposición del Modal.
 */
export interface ModalOverlayProps {
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;

    /**
     * Función que se llama cuando se hace clic en la superposición.
     */
    onClick?: (event: React.MouseEvent) => void;
}


/**
 * Contexto para el Modal.
 */
export type ModalContextType = {
    /**
     * Función que se llama para cerrar el modal.
     */
    onClose: () => void;

    /**
     * Referencia al elemento del overlay del modal (opcional).
     */
    refOverlay?: React.Ref<HTMLDivElement> | undefined;
}


/**
 * Propiedades para el componente de Contenido del Modal.
 */
export interface ModalContentProps {
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;

    /**
     * Elementos hijos que se mostrarán dentro del contenido del modal.
     */
    children?: JSX.Element | JSX.Element[];
}


