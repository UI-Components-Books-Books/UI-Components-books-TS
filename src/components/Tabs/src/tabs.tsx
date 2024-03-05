import { useState, useEffect, useRef } from 'react'

import { TabsProvider } from './tabs-context'

import './tabs.css'

interface Props {
    children: React.ReactNode[]
    defaultIndex?: number,
    addClass?: string
}

export const Tabs: React.FC<Props> = ({ children, defaultIndex = 0, addClass, ...props }) => {
    // Controla el estado de abierto/cerrado del TabPanel.
    const [isOpen, setIsOpen] = useState<string | null>(null);


    /**
     * Referencia mutable utilizada para almacenar los identificadores únicos
     * de cada componente <Section/>.
     */
    const tabsId = useRef<string[]>([]);


    /**
     * Función utilizada para agregar el ID de un tab a la referencia `tabsId`.
     *
     * @param {string} uid - El ID del tab que se va a agregar.
     * @returns {void}
     */
    const addTabIndex = (uid: string): void => {
        // Verifica si el ID del tab ya está en `tabsId.current`
        if (!tabsId.current.includes(uid)) {
            // Si no está, agrega el ID a `tabsId.current`
            tabsId.current = [...tabsId.current, uid];
        }
    };


    /**
     * Función para abrir o cerrar el TabPanel.
     *
     * @param {string} uid - El ID correspondiente del TabPanel.
     * @returns {void}
     */
    const handleToggle = (uid: string): void => {
        setIsOpen(uid);
    };


    useEffect(() => {
        // Verificamos si defaultIndex es un índice válido y si hay IDs de hijos disponibles
        if (defaultIndex === undefined || defaultIndex < 0 || defaultIndex >= tabsId.current.length) return;

        const childIds = tabsId.current;
        setIsOpen(childIds[defaultIndex]);

    }, [defaultIndex, tabsId.current.length]);

    return (
        <TabsProvider value={{
            isOpen,
            handleToggle,
            addTabIndex
        }}>
            <div {...(addClass && { className: `${addClass}` })} {...props}>
                {children}
            </div>
        </TabsProvider>
    )
}

