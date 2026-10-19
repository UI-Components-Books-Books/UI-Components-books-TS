
/**
 * Textos que se leen en voz alta cuando el CheckBox marcado tiene un resultado.
 */
export interface CheckBoxMessages {
    /**
     * Texto para el estado `right`. Por defecto «Correcto».
     */
    right?: string;

    /**
     * Texto para el estado `wrong`. Por defecto «Incorrecto».
     */
    wrong?: string;
}

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
     * Estado del CheckBox (normal, correcto o incorrecto). El resultado se muestra con un icono y
     * se anuncia a los lectores de pantalla («Correcto» o «Incorrecto») cuando la opción está
     * marcada. Pásalo solo a las opciones cuyo resultado quieras mostrar.
     */
    state?: 'normal' | 'right' | 'wrong';

    /**
     * Textos que se leen cuando el CheckBox está marcado y `state` es `right` o `wrong`.
     */
    messages?: CheckBoxMessages;

    /**
     * Clase CSS adicional para el CheckBox.
     */
    addClass?: string;
}
