/**
 * Tipo que define las formas del componente audio disponibles.
 */
type AudioTypes = 'button' | 'bar';


/**
 * Propiedades para el componente de audio.
 */
export interface AudioProps {
    /**
     * Identificador único para el componente de audio.
     */
    id?: string;

    /**
     * Fuente del archivo de audio.
     */
    src: string;

    /**
     * Indica si el componente debe ser accesible.
     */
    a11y?: boolean;

    /**
     * Tamaño del componente de audio (actualmente solo 'small' está disponible).
     */
    size?: 'small';

    /**
     * Tipo de audio ('button' o 'bar').
     */
    type?: AudioTypes;

    /**
     * Descripción del audio para accesibilidad.
     */
    description?: string;

    /**
     * Clase CSS adicional para el componente de audio.
     */
    addClass?: string;
}
