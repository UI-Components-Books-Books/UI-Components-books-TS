import { useState, useRef, useEffect } from "react";

import { AccordionButton } from "./accordion-button";
import { AccordionProvider } from "./accordion-context";
import { AccordionItem } from './accordion-item';
import { AccordionPanel } from "./accordion-panel";
import type { AccordionProps, AccordionSubComponents } from "../types/types";

const Accordion: React.FC<AccordionProps> & AccordionSubComponents = ({ children, allowMultiple = false, defaultIndex }) => {
    // Estado que controla el estado de apertura/cierre de los componentes <AccordionItem>.
    const [isOpen, setIsOpen] = useState<string[]>([]);


    /**
     * Referencia mutable utilizada para almacenar los identificadores únicos
     * de cada componente <AccordionItem/>.
     */
    const accordionChildIds = useRef<string[]>([])


    /**
     * Agrega un identificador único al conjunto de identificadores del acordeón
     * si aún no está presente.
     *
     * @param {string} uid - El identificador único que se va a agregar.
     * @returns {void}
     */
    const addAccordionId = (uid: string): void => {
        if (!accordionChildIds.current.includes(uid)) {
            accordionChildIds.current = [...accordionChildIds.current, uid];
        }
    }


    /**
     * Alternar el estado de apertura de los componentes <AccordionItem>.
     * Actualiza el estado de isOpen con el nuevo valor.
     *
     * @param {string} value - El ID del AccordionItem que se va a alternar.
     */
    const handleToggle = (value: string) => {
        setIsOpen(prev => {
            // Si allowMultiple es falso, establecemos isOpen con un array que contenga solo el valor proporcionado.
            if (!allowMultiple) {
                return prev.includes(value) ? [] : [value];
            }

            // Si allowMultiple es verdadero, alternamos el estado del ID proporcionado.
            return prev.includes(value) ? prev.filter(uid => uid !== value) : [...prev, value];
        });
    };


    useEffect(() => {
        // Verificamos si defaultIndex es un índice válido y si hay IDs de hijos disponibles
        if (defaultIndex === undefined || defaultIndex < 0 || defaultIndex >= accordionChildIds.current.length) return;

        const childIds = accordionChildIds.current;
        setIsOpen([childIds[defaultIndex]]);

    }, [defaultIndex, accordionChildIds.current.length]);


    return (
        <AccordionProvider value={{ isOpen, handleToggle, addAccordionId }}>
            {children}
        </AccordionProvider>
    )
}

Accordion.Panel = AccordionPanel;
Accordion.Button = AccordionButton;
Accordion.Item = AccordionItem;

export { Accordion }