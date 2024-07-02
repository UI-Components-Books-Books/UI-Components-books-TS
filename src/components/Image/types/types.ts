/**
 * Propiedades para el componente Image.
 */
export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    /**
     * URL de la imagen.
     */
    src?: string;

    /**
     * Texto alternativo para la imagen.
     */
    alt?: string;

    /**
     * Título de la imagen.
     */
    title?: string;

    /**
     * Tamaño de la imagen.
     */
    size?: string;

    /**
     * Clases adicionales para el componente.
     */
    addClass?: string;

    /**
     * Indica si la imagen no debe tener una leyenda.
     */
    noCaption?: boolean;
}
