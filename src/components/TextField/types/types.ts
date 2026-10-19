/**
 * Resultado de una actividad para el campo, con la misma convención que `CheckBox` y `Radio`.
 */
export type TextFieldState = 'normal' | 'right' | 'wrong';

/**
 * Textos que se leen en voz alta cuando el campo tiene un resultado.
 */
export interface TextFieldMessages {
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
 * Propiedades para el componente de campo de texto.
 *
 * El resto de atributos de `<input>` (`value`, `defaultValue`, `onChange`, `name`, `required`,
 * `maxLength`, `autoComplete`, `inputMode`, `placeholder`, etc.) se pasan al `<input>`.
 */
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
    /**
     * Identificador único del campo. Los ids de la ayuda, el error y el resultado se derivan de él.
     */
    id?: string;

    /**
     * Etiqueta del campo. Es obligatoria: siempre da el nombre accesible, aunque no se vea.
     */
    label: React.ReactNode;

    /**
     * Indica si la etiqueta es visible. Si es `false` se oculta visualmente pero se sigue leyendo.
     * @default true
     */
    isLabelVisible?: boolean;

    /**
     * Texto de ayuda: formato esperado o un ejemplo.
     */
    hint?: React.ReactNode;

    /**
     * Mensaje de error. Si existe, el campo se marca como inválido.
     */
    error?: React.ReactNode;

    /**
     * Resultado de una actividad: `right` (correcto), `wrong` (incorrecto) o `normal`.
     * `wrong` también marca el campo como inválido.
     * @default 'normal'
     */
    state?: TextFieldState;

    /**
     * Textos que se leen cuando `state` es `right` o `wrong`.
     */
    messages?: TextFieldMessages;

    /**
     * Tipo de campo. Para números usa `NumberInput`.
     * @default 'text'
     */
    type?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'password';

    /**
     * Tamaño del campo.
     * @default 'normal'
     */
    size?: 'small' | 'normal' | 'big';

    /**
     * Muestra el campo en línea, para completar una frase. Normalmente se combina con
     * `isLabelVisible={false}`: el texto que rodea el campo le da contexto.
     * @default false
     */
    inline?: boolean;

    /**
     * Clase adicional para el contenedor del campo.
     */
    addClass?: string;
}
