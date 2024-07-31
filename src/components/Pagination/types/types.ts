import { ItemPaginationType, usePaginationProps } from "../../../hooks";
import { PaginationItem } from "../src/pagination-item";

/**
 * Tipo para los elementos de la paginación.
 */
export type TypeElement = 'first' | 'last' | 'previous' | 'next' | 'page';


/**
 * Generador de etiquetas Aria para los elementos de la paginación.
 */
export type PaginationAriaLabelGenerator = (type: TypeElement, selected: boolean, page: number | null) => string;


/**
 * Tipo para los elementos de la paginación.
 */
export interface PaginationItemType extends ItemPaginationType {
    /**
     * El valor de aria-label para el elemento.
     */
    'aria-label': string | undefined;
}


/**
 * Tipo para los iconos de la paginación.
 */
export type IconType = {
    /**
     * El icono para el botón "anterior".
     */
    previous?: React.ReactNode;
    
    /**
     * El icono para el botón "última página".
     */
    last?: React.ReactNode;
    
    /**
     * El icono para el botón "siguiente".
     */
    next?: React.ReactNode;
    
    /**
     * El icono para el botón "primera página".
     */
    first?: React.ReactNode;
};


/**
 * Propiedades para el componente de paginación.
 */
export interface PaginationProps extends usePaginationProps {
    /**
     * Función para renderizar un elemento de paginación.
     */
    renderItem?: (item: PaginationItemType) => React.ReactNode;
    
    /**
     * Función para generar etiquetas ARIA para los elementos de paginación.
     */
    getItemAriaLabel?: PaginationAriaLabelGenerator;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Aria label del elemento en la interfaz de usuario.
     */
    label?: string;
}


/**
 * Submódulos para el componente de paginación.
 */
export type PaginationSubModules = {
    /**
     * Componente para un ítem de paginación.
     */
    Item: typeof PaginationItem;
}


/**
 * Propiedades para el componente de ítem de paginación.
 */
export interface PaginationItemProps extends PaginationItemType {
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Elemento JSX opcional.
     */
    element?: JSX.Element;
    
    /**
     * Iconos para los botones de paginación.
     */
    icons?: IconType;
}

