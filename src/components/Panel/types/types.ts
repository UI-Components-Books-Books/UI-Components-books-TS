import { ButtonSection } from '../src/panel-button';
import { NavSection } from '../src/panel-nav';
import { Section } from '../src/panel-section';

// Definimos el tipo para los tipos de botón posibles
export type ListItemButtonType = 'previous' | 'next';


// Definimos el tipo para el tipo de elemento de lista 'section'
type ListItemElementType = 'section';


// Creamos una unión de los tipos de botón y el tipo de elemento de lista
export type ListItemType = ListItemButtonType | ListItemElementType;


/**
 * Generador de etiquetas Aria para los elementos de la lista.
 */
export type PanelAriaLabelGenerator = (type: ListItemType, selected: boolean, section?: number) => string;


/**
 * Tipo para los elementos de la lista.
 */
export interface ItemsType {
    /**
     * Función llamada al hacer clic en el elemento.
     */
    onClick: () => void;

    /**
     * El tipo de elemento de la lista.
     */
    type: ListItemType;

    /**
     * El número de la sección (opcional).
     */
    section?: number;

    /**
     * Indica si el elemento está seleccionado.
     */
    selected: boolean;

    /**
     * Referencia a los elementos de botón (opcional).
     */
    ref?: (ref: HTMLButtonElement) => HTMLButtonElement[];

    /**
     * Función llamada al presionar una tecla (opcional).
     */
    onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;

    /**
     * Indica si el elemento está deshabilitado (opcional).
     */
    disabled?: boolean;
}


/**
 * Propiedades para el componente de panel.
 */
export interface PanelProps {
    /**
     * Los elementos hijos del panel.
     */
    children: React.ReactNode[] | React.ReactNode;
    
    /**
     * El índice del panel que debe estar abierto por defecto.
     */
    defaultIndex?: number;
    
    /**
     * Clase CSS adicional para el panel.
     */
    addClass?: string;
    
    /**
     * Tipo de panel.
     */
    type?: 'carrousel';
}


/**
 * Submódulos para el componente de panel.
 */
export type PanelSubComponents = {
    /**
     * Componente para la sección de botones del panel.
     */
    Button: typeof ButtonSection;
    
    /**
     * Componente para la sección del panel.
     */
    Section: typeof Section;
    
    /**
     * Componente para la sección de navegación del panel.
     */
    Nav: typeof NavSection;
};


/**
 * Propiedades para el componente de sección.
 */
export interface SectionProps {
    /**
     * Identificador único opcional para la sección.
     */
    id?: string;
    
    /**
     * Los elementos hijos que se mostrarán dentro de la sección.
     */
    children?: React.ReactNode;
    
    /**
     * Clase CSS adicional para la sección.
     */
    addClass?: string;
}


/**
 * Propiedades para el componente de navegación de sección.
 */
export interface NavSectionProps {
    /**
     * Etiqueta de la navegación de sección.
     */
    label?: string;
    
    /**
     * Indica si se debe mostrar el botón siguiente.
     */
    showNextButton?: boolean;
    
    /**
     * Indica si se debe mostrar el botón anterior.
     */
    showPrevButton?: boolean;
    
    /**
     * Función llamada cuando cambia la sección.
     */
    onValue?: (section: number, sections: number) => void;
    
    /**
     * Clase CSS adicional para la navegación de sección.
     */
    addClass?: string;
    
    /**
     * Función para generar etiquetas ARIA para los elementos de la navegación de sección.
     */
    getItemAriaLabel?: PanelAriaLabelGenerator;
}


/**
 * Tipo para el contexto del panel.
 */
export type PanelContextType = {
    /**
     * ID de la sección abierta actualmente o null si ninguna sección está abierta.
     */
    isOpen: string | null;
    
    /**
     * Función para validar si una sección está abierta.
     */
    validation: (uid: string) => boolean;
    
    /**
     * Función para alternar la apertura/cierre de una sección.
     */
    handleToggle: (uid: string) => void;
    
    /**
     * Lista de IDs de las secciones.
     */
    sectionsId: string[];
    
    /**
     * Función para obtener el índice de una sección en la lista de IDs.
     */
    getSectionIndex: (uid: string) => number;
    
    /**
     * Función para agregar un ID de sección a la lista.
     */
    addSectionId: (uid: string) => void;
    
    /**
     * Tipo de panel (opcional).
     */
    type?: string;
};


/**
 * Propiedades para el componente de botón de sección.
 */
export interface ButtonSectionProps {
    /**
     * Elemento JSX que representa el botón de sección.
     */
    children: JSX.Element;
    
    /**
     * Número de la sección asociada al botón.
     */
    section: number;
}

