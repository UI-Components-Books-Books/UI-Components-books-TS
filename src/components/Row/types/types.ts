/**
 * Propiedades para el componente de fila.
 */
export interface RowProps extends React.HTMLProps<HTMLDivElement> {
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Alineación del contenido principal a lo largo del eje principal.
     */
    justifyContent?:
      | "center"
      | "flex-start"
      | "flex-end"
      | "space-between"
      | "space-around"
      | "space-evenly";
    
    /**
     * Alineación del contenido a lo largo del eje secundario.
     */
    alignItems?: "center" | "flex-start" | "flex-end" | "baseline" | "stretch";
    
    /**
     * Dirección en la que se apilan los elementos secundarios.
     */
    flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
}
