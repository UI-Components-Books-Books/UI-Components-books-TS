/**
 * Propiedades para el componente Portal.
 */
export interface PortalProps {
    /**
     * El ID opcional del portal.
     */
    id?: string;

    /**
     * Los elementos que se renderizarán dentro del portal.
     */
    children: React.ReactNode;
}