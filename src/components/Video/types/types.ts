/**
 * Tipo para representar una duración de tiempo en segundos.
 */
export type Duration = number;


/**
 * Estado del reproductor de vídeo.
 */
export interface PlayerState {
    /**
     * Indica si el vídeo está reproduciéndose.
     */
    isPlaying: boolean;

    /**
     * Indica si el audio está silenciado.
     */
    muted: boolean;

    /**
     * Volumen actual del reproductor.
     */
    volume: number;

    /**
     * Duración total del vídeo en segundos.
     */
    totalDuration: Duration;

    /**
     * Tiempo actual de reproducción del vídeo en segundos.
     */
    currentTime: Duration;

    /**
     * Indica si se está buscando en el vídeo.
     */
    isSeeking: boolean;

    /**
     * Indica si el vídeo ha sido cargado.
     */
    hasVideoLoaded: boolean;

    /**
     * Indica si los subtítulos están activos.
     */
    activeCaption: boolean;

    /**
     * Indica si el reproductor está en modo pantalla completa.
     */
    isFullScreen: boolean;

    /**
     * Indica si el audio descripción está activo.
     */
    isActiveAD: boolean;

    /**
     * Indica si el video transcription esta activo.
     */
    activeVideoTranscription: boolean;
}


/**
 * Tipo para representar un objeto de subtítulos.
 */
export type CaptionType = {
    /**
     * URL del archivo de subtítulos.
     */
    src: string;

    /**
     * Idioma de los subtítulos.
     */
    lang: "en" | "es";
}


/**
 * Etiquetas para los idiomas de los subtítulos.
 */
export enum CaptionLangLabel {
    en = "English captions",
    es = "Subtítulos en español"
}


/**
 * Enumeración de los tipos de acciones del reproductor.
 */
export enum PlayerActionKind {
    PLAY_PAUSE = "PLAY_PAUSE",
    ON_MUTE = "ON_MUTE",
    VOLUME_CHANGE = "VOLUME_CHANGE",
    UPDATE_VIDEO_CURRENT_TIME = 'UPDATE_VIDEO_CURRENT_TIME',
    UPDATE_SEEKING = 'UPDATE_SEEKING',
    HAS_VIDEO_LOADED = 'HAS_VIDEO_LOADED',
    TOGGLE_CAPTION = 'TOGGLE_CAPTION',
    FULLSCREEN = 'FULLSCREEN',
    AUDIO_DESCRIPTION_CHANGE = 'AUDIO_DESCRIPTION_CHANGE',
    TOGGLE_VIDEO_TRANSCRIPTION = 'TOGGLE_VIDEO_TRANSCRIPTION',
}


/**
 * Tipo para representar una acción del reproductor.
 */
export interface PlayerAction {
    /**
     * Tipo de acción del reproductor.
     */
    type: PlayerActionKind;

    /**
     * Carga útil de la acción del reproductor.
     */
    payload?: string | number | boolean | Partial<PlayerState>;
}


/**
 * Propiedades para el componente VideoPlayer.
 */
export interface VideoPlayerProps {
    /**
     * Identificador opcional para el reproductor de video.
     */
    id?: string;
    
    /**
     * URL de la fuente del video.
     */
    src: string;
    
    /**
     * Ancho del video.
     */
    width?: string;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Configuración de la leyenda del video.
     */
    caption?: CaptionType;
    
    /**
     * URL de la imagen del póster del video.
     */
    poster?: string;
    
    /**
     * URL de la pista de audio del video.
     */
    audio?: string;
}


/**
 * Tipo para el contexto del VideoPlayer.
 */
export interface VideoPlayerContextType extends PlayerState {
    /**
     * Identificador único para el reproductor de video.
     */
    uid: string;

    /**
     * URL de la fuente del video.
     */
    src: string;

    /**
     * Configuración de la leyenda del video.
     */
    caption?: CaptionType;

    /**
     * URL de la imagen del póster del video.
     */
    poster?: string;

    /**
     * URL de la pista de audio del video.
     */
    audio?: string;
}
