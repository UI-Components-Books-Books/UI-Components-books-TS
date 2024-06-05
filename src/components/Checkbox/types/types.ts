
/**
 * Propiedades para el componente de CheckBox.
 */
export interface CheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Identificador único para el CheckBox.
     */
    id?: string;

    /**
     * Etiqueta asociada al CheckBox.
     */
    label: string;

    /**
     * Estado del CheckBox (normal, correcto o incorrecto).
     */
    state?: 'normal' | 'right' | 'wrong';

    /**
     * Clase CSS adicional para el CheckBox.
     */
    addClass?: string;
}
