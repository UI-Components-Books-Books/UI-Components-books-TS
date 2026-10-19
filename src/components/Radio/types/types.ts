/**
 * Textos que se leen en voz alta cuando el radio marcado tiene un resultado.
 */
export interface RadioMessages {
    /**
     * Texto para el estado `right`. Por defecto «Correcto».
     */
    right?: string,

    /**
     * Texto para el estado `wrong`. Por defecto «Incorrecto».
     */
    wrong?: string
}

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
     * Estado del radio (correcto o incorrecto). El resultado se muestra con un icono y se anuncia
     * a los lectores de pantalla («Correcto» o «Incorrecto») cuando la opción está marcada.
     * Pásalo solo a las opciones cuyo resultado quieras mostrar.
     */
    state?: 'right' | 'wrong',

    /**
     * Textos que se leen cuando el radio está marcado y `state` es `right` o `wrong`.
     */
    messages?: RadioMessages,
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string
}
