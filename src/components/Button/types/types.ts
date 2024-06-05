
/**
 * Propiedades para el componente de botón.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Etiqueta del botón.
     */
    label?: string;

    /**
     * Tamaño del botón.
     */
    size?: 'small' | 'normal' | 'big';

    /**
     * Variante del botón.
     */
    variant?: 'primary' | 'secondary' | 'no-line';

    /**
     * Indica si el botón tiene una etiqueta aria.
     */
    hasAriaLabel?: boolean;

    /**
     * Clase CSS adicional para el botón.
     */
    addClass?: string;

    /**
     * Elementos hijos que serán renderizados dentro del botón.
     */
    children?: React.ReactNode;
}
