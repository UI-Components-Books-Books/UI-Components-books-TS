/**
 * Propiedades para el componente Icon.
 */
export interface IconProps {
    /**
     * Tamaño del ícono.
     */
    size?: 'small' | 'normal' | 'big';

    /**
     * Elemento React que representa el contenido del ícono.
     */
    children: React.ReactElement;
}
