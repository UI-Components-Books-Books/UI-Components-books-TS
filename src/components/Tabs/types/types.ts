import { Tab } from "../src/tab";
import { TabList } from "../src/tab-list";
import { TabPanel } from "../src/tab-panel";
import { TabPanels } from "../src/tab-panels";

/**
 * Propiedades para el componente de pestañas.
 */
export interface TabsProps {
    /**
     * Los elementos hijos que se mostrarán dentro del componente de pestañas.
     */
    children: JSX.Element | JSX.Element[];
    
    /**
     * El índice de la pestaña seleccionada por defecto.
     */
    defaultIndex?: number;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
}


/**
 * Submódulos para el componente de pestañas.
 */
export type TabsSubComponents = {
    Tab: typeof Tab;
    TabList: typeof TabList;
    TabPanel: typeof TabPanel;
    TabPanels: typeof TabPanels;
}


/**
 * Tipo para el contexto de las pestañas.
 */
export type TabsContextType = {
    isOpen: number | null;
    handleToggle: (value: number) => void;
    handleValidation: (value: number) => boolean;
}


/**
 * Tipo para el contexto de la lista de pestañas.
 */
export type TabListContexType = {
    addNewTabRef: (ref: HTMLButtonElement) => void;
    handleNavigationFocus: (e: React.KeyboardEvent) => void;
}


/**
 * Propiedades para el componente de pestaña.
 */
export interface TabProps {
    /**
     * Identificador único de la pestaña.
     */
    id?: number;
    
    /**
     * Los elementos hijos que se mostrarán dentro de la pestaña.
     */
    children: React.ReactNode;
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Función que devuelve el icono de la pestaña.
     */
    icon?: (isSelected: boolean) => React.ReactNode;
    
    /**
     * Función que se llama cuando se hace clic en la pestaña.
     */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}


/**
 * Propiedades para el componente de paneles de pestañas.
 */
export interface TabPanelsProps {
    /**
     * Los elementos hijos que se mostrarán dentro de los paneles de pestañas.
     */
    children: JSX.Element | JSX.Element[];
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
}


/**
 * Propiedades para el componente de panel de pestaña.
 */
export interface TabPanelProps {
    /**
     * Identificador único del panel de pestaña.
     */
    id?: number;
    
    /**
     * Los elementos hijos que se mostrarán dentro del panel de pestaña.
     */
    children: React.ReactNode | React.ReactNode[];
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
}


/**
 * Propiedades para el componente de lista de pestañas.
 */
export interface TabListProps {
    /**
     * Los elementos hijos que se mostrarán dentro de la lista de pestañas.
     */
    children: JSX.Element | JSX.Element[];
    
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Etiqueta de la lista de pestañas.
     */
    label: string;
    
    /**
     * Orientación de la lista de pestañas, horizontal o vertical.
     */
    orientation: "horizontal" | "vertical";
}

