// Definimos el tipo para los tipos de botón posibles
export type ListItemButtonType = 'previous' | 'next';

// Definimos el tipo para el tipo de elemento de lista 'section'
type ListItemElementType = 'section';

// Creamos una unión de los tipos de botón y el tipo de elemento de lista
export type ListItemType = ListItemButtonType | ListItemElementType;

/**
 * Generador de etiquetas Aria para los elementos de la lista.
 * @param {ListItemType} type - El tipo de elemento de la lista.
 * @param {boolean} selected - Indica si el elemento está seleccionado.
 * @param {number} [section] - El número de la sección (opcional).
 * @returns {string} - El label para la etiqueta aria generada.
 */
export type AriaLabelGenerator = (type: ListItemType, selected: boolean, section?: number) => string;

/**
 * Tipo para los elementos de la lista.
 */
export interface ItemsType {
    /**
     * Función llamada al hacer clic en el elemento.
     */
    onClick: () => void;

    /**
     * El tipo de elemento de la lista.
     */
    type: ListItemType;

    /**
     * El número de la sección (opcional).
     */
    section?: number;

    /**
     * Indica si el elemento está seleccionado.
     */
    selected: boolean;

    /**
     * Referencia a los elementos de botón (opcional).
     */
    ref?: (ref: HTMLButtonElement) => HTMLButtonElement[];

    /**
     * Función llamada al presionar una tecla (opcional).
     */
    onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;

    /**
     * Indica si el elemento está deshabilitado (opcional).
     */
    disabled?: boolean;
}