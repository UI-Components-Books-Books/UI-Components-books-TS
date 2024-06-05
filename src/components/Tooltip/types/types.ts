/**
 * Tipo para los tipos de posiciones del Tooltip.
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
 * Propiedades para el componente Tooltip.
 */
export interface TooltipProps {
    /**
     * Identificador único para el Tooltip.
     */
    id?: string;
    
    /**
     * Etiqueta del Tooltip.
     */
    label: string;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Indica si el Tooltip tiene una flecha de dirección.
     */
    hasArrow?: boolean;
    
    /**
     * Indica si el Tooltip está deshabilitado.
     */
    isDisabled?: boolean;
    
    /**
     * La distancia entre el Tooltip y su elemento activador.
     */
    distance?: number;
    
    /**
     * La posición del Tooltip en relación con su elemento activador.
     */
    placement?: placementsType;
    
    /**
     * Los elementos hijos que se mostrarán dentro del Tooltip.
     */
    children: React.ReactNode;
}
