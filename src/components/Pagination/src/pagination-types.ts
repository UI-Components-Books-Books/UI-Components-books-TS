/**
 * Tipo para los elementos de la paginación.
 */
export type TypeElement = 'first' | 'last' | 'previous' | 'next' | 'page';

/**
 * Generador de etiquetas Aria para los elementos de la paginación.
 * 
 * @param {TypeElement} type - El tipo de elemento de la paginación.
 * @param {boolean} selected - Indica si el elemento está seleccionado.
 * @param {number} [page] - El número de la página (opcional).
 * @returns {string} - El label para la etiqueta aria generada.
 */
export type AriaLabelGenerator = (type: TypeElement, selected: boolean, page: number | null) => string;

/**
 * Tipo para los elementos de la paginación.
 */
export interface ItemType {
    /**
     * Función llamada al hacer clic en el elemento.
     */
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;

    /**
     * El tipo de elemento de la paginación.
     */
    type: string;

    /**
     * El número de la página (opcional).
     */
    page: number | null;

    /**
     * Indica si el elemento está seleccionado.
     */
    selected: boolean;

    /**
     * Indica si el elemento está deshabilitado.
     */
    disabled: boolean;

    /**
     * El valor de aria-current para el elemento.
     */
    'aria-current'?: string | undefined;

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
