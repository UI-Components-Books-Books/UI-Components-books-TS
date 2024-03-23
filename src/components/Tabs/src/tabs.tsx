import { useState, useEffect } from 'react'

import { Tab } from './tab'
import { TabList } from './tab-list'
import { TabPanel } from './tab-panel'
import { TabPanels } from './tab-panels'
import { TabsProvider } from './tabs-context'

import './tabs.css'


interface Props {
    children: JSX.Element | JSX.Element[];
    defaultIndex?: number,
    addClass?: string
}

type subComponents = {
    Tab: typeof Tab;
    TabList: typeof TabList;
    TabPanel: typeof TabPanel;
    TabPanels: typeof TabPanels;
}

const Tabs: React.FC<Props> & subComponents = ({ children, defaultIndex = 0, addClass, ...props }) => {
    // Controla el estado de abierto/cerrado del TabPanel.
    const [isOpen, setIsOpen] = useState<number | null>(null);

    /**
     * Función para abrir o cerrar el TabPanel.
     *
     * @param {string} uid - El ID correspondiente del TabPanel.
     * @returns {void}
     */
    const handleToggle = (uid: number): void => {
        setIsOpen(uid);
    };

    const handleValidation = (uid: number): boolean => isOpen === uid


    useEffect(() => {
        // Verificamos si defaultIndex es un índice válido y si hay IDs de hijos disponibles
        if (defaultIndex === undefined || defaultIndex < 0) return;

        setIsOpen(defaultIndex);
    }, [defaultIndex]);

    return (
        <TabsProvider value={{ isOpen, handleValidation, handleToggle }}>
            <div {...(addClass && { className: addClass })} {...props}>
                {children}
            </div>
        </TabsProvider>
    )
}

Tabs.Tab = Tab;
Tabs.TabList = TabList;
Tabs.TabPanel = TabPanel;
Tabs.TabPanels = TabPanels;

export { Tabs }