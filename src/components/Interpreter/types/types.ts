/**
 * Propiedades para el componente Interpreter.
 */
export interface InterpreterProps {
    /**
     * URL de accesibilidad para el intérprete.
     */
    accesibilityURL?: string;

    /**
     * URL del contenido para el intérprete.
     */
    contentURL?: string;

    /**
     * Clases adicionales para el componente.
     */
    addClass?: string;

    /**
     * Elemento JSX que representa el ícono del intérprete.
     */
    icon?: JSX.Element;
}


/**
 * Propiedades para el componente Video.
 */
export interface InterpreterVideoProps {
    /**
     * URLs asociadas al video.
     */
    URLs: {
        accesibilityURL?: string;
        contentURL?: string;
    };

    /**
     * Función para reiniciar la posición de arrastre.
     */
    resetDragPosition: () => void;

    /**
     * Elemento JSX que representa el ícono del video.
     */
    icon: JSX.Element;
}


/**
 * Propiedades para el componente VideoPlayer.
 */
export interface InterpreterVideoPlayerProps {
    /**
     * URL del video a mostrar, o null si no hay video.
     */
    displayVideo: string | null;

    /**
     * URLs asociadas al video.
     */
    URLs: {
        accesibilityURL?: string;
        contentURL?: string;
    };
}
