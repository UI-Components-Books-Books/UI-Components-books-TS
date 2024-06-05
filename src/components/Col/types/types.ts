/**
 * Tipos de rangos disponibles para las propiedades de tamaño.
 *
 * @typedef {'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'} range
 */
type range =
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12';

    
/**
 * Propiedades para el componente de Div.
 */
export interface ColProps extends React.HTMLProps<HTMLDivElement> {
    /**
     * Clase CSS adicional para el Div.
     */
    addClass?: string;

    /**
     * Tamaño del Div en dispositivos extra pequeños.
     */
    xs?: range;

    /**
     * Tamaño del Div en dispositivos extra medianos.
     */
    xm?: range;

    /**
     * Tamaño del Div en dispositivos pequeños.
     */
    sm?: range;

    /**
     * Tamaño del Div en dispositivos medianos.
     */
    mm?: range;

    /**
     * Tamaño del Div en dispositivos medianos a grandes.
     */
    md?: range;

    /**
     * Tamaño del Div en dispositivos grandes.
     */
    lg?: range;

    /**
     * Tamaño del Div en dispositivos de alta definición.
     */
    hd?: range;
}
