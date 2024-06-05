import { useState, useEffect, useRef } from 'react'

import classnames from 'classnames'

import { ButtonSection } from './panel-button';
import { PanelProvider } from './panel-contex'
import { NavSection } from './panel-nav';
import { Section } from './panel-section';
import type { PanelProps, PanelSubComponents } from '../types/types';

import './panel.css'

const Panel: React.FC<PanelProps> & PanelSubComponents = ({ children, defaultIndex = 0, addClass, type }) => {
    //Estado que controla el estado de apertura/cierre de los componentes <Section>.
    const [isOpen, setIsOpen] = useState<string | null>(null)

    /**
     * Referencia mutable utilizada para almacenar los identificadores únicos
     * de cada componente <Section/>.
     */
    const sectionsId = useRef<string[]>([])

    /**
     * Función utilizada para agregar el ID de una sección al estado `sectionsId`.
     *
     * @param {string} uid - El ID de la sección que se va a agregar.
     * @returns {void}
     */
    const addSectionId = (uid: string): void => {
        // Verifica si el ID de la sección ya está en `sectionsId.current`
        if (!sectionsId.current.includes(uid)) {
            // Si no está, agrega el ID a `sectionsId.current`
            sectionsId.current = [...sectionsId.current, uid];
        }
    };


    /**
     * Función utilizada para cambiar el estado de la sección abierta.
     * Actualiza el estado setIsOpen con el ID de la sección a mostrar.
     *
     * @param {string} uid - El ID de la sección a mostrar.
     */
    const handleToggle = (uid: string): void => {
        setIsOpen(uid);
    };


    /**
     * Devuelve "true" o "false" después de comparar
     * el ID de la sección con el ID de la sección
     * que está visible.
     *
     * @param {string} uid - El ID de la sección a comparar.
     * @returns {boolean} - `true` si el ID de la sección es igual al ID de la sección abierta.
     */
    const validation = (uid: string): boolean => uid === isOpen;


    /**
     * Obtiene el índice de una sección a partir de su ID.
     * Este índice se utiliza en la variable currentSection.
     *
     * @param {string} uid - El ID de la sección para obtener el índice.
     * @returns {number} - El índice de la sección más 1, o 0 si no se encuentra.
     */
    const getSectionIndex = (uid: string): number => sectionsId.current.indexOf(uid) + 1;


    useEffect(() => {
        // Verifica si `defaultIndex` es un índice válido y si hay IDs de secciones disponibles
        if (defaultIndex === undefined || defaultIndex < 0 || defaultIndex >= sectionsId.current.length) {
            return;
        }
    
        // Actualiza el estado `isOpen` con el ID de la sección en `defaultIndex`
        const childIds = sectionsId.current;
        setIsOpen(childIds[defaultIndex]);
    
    }, [defaultIndex, sectionsId.current.length]);


    return (
        <PanelProvider
            value={{
                isOpen,
                validation,
                handleToggle,
                sectionsId: sectionsId.current,
                getSectionIndex,
                addSectionId,
                type
            }}
        >
            <div
                className={classnames('c-panel', { [addClass ?? ""]: addClass })}
                data-value={isOpen}
                {...(type === 'carrousel' && {
                    role: 'group',
                    'aria-roledescription': 'Slider'
                })}
            >
                {children}
            </div>
        </PanelProvider>
    )
}


Panel.Button = ButtonSection
Panel.Section = Section
Panel.Nav = NavSection

export { Panel }