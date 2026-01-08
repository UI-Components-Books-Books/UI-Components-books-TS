
import { useEffect, useId, useMemo } from 'react'

import { cn } from '@utils/cn'

import { useAccordionContext, AccordionItemProvider } from './accordion-context'
import type { AccordionItemProps } from '../types/types'

import './accordion.css'

export const AccordionItem: React.FC<AccordionItemProps> = ({ id, children, addClass }) => {
    const { isOpen, handleToggle, addAccordionId } = useAccordionContext();

    /**
     * Genera identificadores únicos para todos los componentes de los elementos de acordeón (botón y panel).
     */
    const reactId: string = useId();
    const uid = id ?? reactId;


    /**
     * Esta función se crea para manejar la expansión del componente de acordeón.
     * Invoca la función handleToggle con el UID correspondiente para alternar el estado de apertura.
     *
     * @returns void
     */
    const handleExpanded = (): void => {
        handleToggle(uid);
    }


    /**
    * Determina si el componente de acordeón está expandido.
    * Calcula si el UID actual está presente en el estado de apertura.
    */
    const isExpanded = useMemo(() => {
        return isOpen.includes(uid);
    }, [isOpen, uid]);


    useEffect(() => {
        addAccordionId(uid)
    }, [uid, addAccordionId])


    return (
        <AccordionItemProvider value={{ uid, isExpanded, handleExpanded }}>
            <div className={cn('c-accordion__item', addClass)}>
                {children}
            </div>
        </AccordionItemProvider>
    )
}
