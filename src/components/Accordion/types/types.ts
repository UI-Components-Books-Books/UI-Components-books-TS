import { AccordionButton } from "../src/accordion-button";
import { AccordionItem } from "../src/accordion-item";
import { AccordionPanel } from "../src/accordion-panel";


/**
 * Propiedades para el componente Accordion.
 */
export interface AccordionProps {
    /**
     * Los elementos hijos del Accordion.
     */
    children: React.ReactNode[] | React.ReactNode;

    /**
     * Indica si se permite abrir múltiples paneles a la vez.
     */
    allowMultiple?: boolean;

    /**
     * El índice del panel que debe estar abierto por defecto.
     */
    defaultIndex?: number;
}


/**
 * Subcomponentes del Accordion.
 */
export type AccordionSubComponents = {
    /**
     * El subcomponente Panel del Accordion.
     */
    Panel: typeof AccordionPanel;

    /**
     * El subcomponente Button del Accordion.
     */
    Button: typeof AccordionButton;

    /**
     * El subcomponente Item del Accordion.
     */
    Item: typeof AccordionItem;
}


/**
 * Propiedades para el subcomponente AccordionPanel.
 */
export interface AccordionPanelProps {
    /**
     * Los elementos hijos del AccordionPanel.
     */
    children: React.ReactNode;

    /**
     * Clase CSS adicional para el AccordionPanel.
     */
    addClass?: string;
}


/**
 * Propiedades para el subcomponente AccordionItem.
 */
export interface AccordionItemProps {
    /**
     * Identificador único para el AccordionItem.
     */
    id?: string;

    /**
     * Los elementos hijos del AccordionItem.
     */
    children: React.ReactNode;

    /**
     * Clase CSS adicional para el AccordionItem.
     */
    addClass?: string;
}


/**
 * Contexto del Accordion.
 */
export type AccordionContextType = {
    /**
     * Array de identificadores de los paneles abiertos.
     */
    isOpen: string[];

    /**
     * Función para alternar el estado abierto/cerrado de un panel.
     */
    handleToggle: (value: string) => void;

    /**
     * Función para agregar un identificador único al Accordion.
     */
    addAccordionId: (uid: string) => void;
}


/**
 * Contexto de un item del Accordion.
 */
export type AccordionItemContextType = {
    /**
     * Identificador único del item.
     */
    uid: string;

    /**
     * Estado que indica si el item está expandido.
     */
    isExpanded: boolean;

    /**
     * Función para manejar la expansión del item.
     */
    handleExpanded: () => void;
}


/**
 * Propiedades para el subcomponente AccordionButton.
 */
export interface AccordionButtonProps {
    /**
     * Los elementos hijos del AccordionButton.
     */
    children: React.ReactNode;

    /**
     * Clase CSS adicional para el AccordionButton.
     */
    addClass?: string;

    /**
     * Ícono que invita a expandir el item: se muestra mientras el item está **cerrado**.
     * Por defecto, una flecha hacia abajo.
     */
    expandedIcon?: React.ReactNode;

    /**
     * Ícono que invita a cerrar el item: se muestra mientras el item está **expandido**.
     * Por defecto, una flecha hacia arriba.
     */
    closedIcon?: React.ReactNode;

    /**
     * Función que se ejecuta al hacer clic en el botón.
     * @param event El evento de clic.
     */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
