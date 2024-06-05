/**
 * Tipo para los tipos de posiciones del toggletip.
 */
type placementsType =
    | 'auto'
    | 'auto-start'
    | 'auto-end'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end';


/**
 * Propiedades para el componente Toggletip.
 */
export interface ToggletipProps {
    /**
     * Identificador único para el Toggletip.
     */
    id?: string;
    
    /**
     * Etiqueta del Toggletip.
     */
    label: string;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Indica si el Toggletip tiene una flecha de dirección.
     */
    hasArrow?: boolean;
    
    /**
     * Indica si el Toggletip está deshabilitado.
     */
    isDisabled?: boolean;
    
    /**
     * La distancia entre el Toggletip y su elemento activador.
     */
    distance?: number;
    
    /**
     * La posición del Toggletip en relación con su elemento activador.
     */
    placement?: placementsType;
    
    /**
     * Los elementos hijos que se mostrarán dentro del Toggletip.
     */
    children: React.ReactNode;
    
    /**
     * Indica si la interacción fuera del Toggletip está deshabilitada cuando está activo.
     */
    disabledInteractOutside?: boolean;
}
