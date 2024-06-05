/**
 * Propiedades para el componente de radio.
 */
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Identificador opcional para el radio.
     */
    id?: string,
    
    /**
     * Etiqueta del radio.
     */
    label: string,
    
    /**
     * Estado del radio (correcto o incorrecto).
     */
    state?: 'right' | 'wrong',
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string
}
