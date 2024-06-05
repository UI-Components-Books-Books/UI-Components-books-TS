import type { AriaButtonOptions } from "@react-aria/button"
import type { AriaListBoxOptions } from "@react-aria/listbox"
import type { AriaPopoverProps } from "@react-aria/overlays"
import type { SelectStateOptions } from "react-stately"
import type { OverlayTriggerState } from "react-stately"
import type { ListState } from "react-stately";
import type { Node } from "react-stately";

/**
 * Propiedades para el componente de selección.
 */
export interface SelectProps extends SelectStateOptions<HTMLSelectElement> {
    /**
     * Etiqueta del campo de selección.
     */
    label: string;
    
    /**
     * Nombre del campo de selección.
     */
    name: string;
    
    /**
     * Placeholder para el campo de selección.
     */
    placeholder?: string;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
}


/**
 * Propiedades para el componente de popover de selección.
 */
export interface SelectPopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
    /**
     * Los elementos hijos que se mostrarán dentro del popover.
     */
    children: React.ReactNode;
    
    /**
     * Estado del popover.
     */
    state: OverlayTriggerState;
}


/**
 * Propiedades para el componente de opción de selección.
 */
export interface SelectOptionProps {
    /**
     * Estado de la lista de opciones.
     */
    state: ListState<object>;
    
    /**
     * Nodo de la opción.
     */
    item: Node<object>;
}


/**
 * Propiedades para el componente de lista de opciones de selección.
 */
export interface SelectListBoxProps extends AriaListBoxOptions<unknown> {
    /**
     * Estado de la lista de opciones.
     */
    state: ListState<object>;
    
    /**
     * Referencia al elemento de lista.
     */
    listBoxRef?: React.MutableRefObject<HTMLUListElement | null>;
}


/**
 * Propiedades para el botón de selección.
 */
export interface SelectButton extends AriaButtonOptions<'button'> {
    /**
     * Referencia al botón.
     */
    buttonRef: React.RefObject<HTMLButtonElement>;
    
    /**
     * Los elementos hijos que se mostrarán dentro del botón.
     */
    children: JSX.Element[];
}
