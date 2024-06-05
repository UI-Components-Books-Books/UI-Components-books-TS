/**
 * Propiedades para el componente de interruptor.
 */
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * Identificador único para el interruptor.
     */
    id?: string;
    
    /**
     * Tamaño del interruptor.
     */
    size?: 'small' | 'normal' | 'big';
    
    /**
     * Etiqueta asociada al interruptor.
     */
    label: string;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Indica si la etiqueta es visible.
     */
    isLabelVisible?: boolean;
}
