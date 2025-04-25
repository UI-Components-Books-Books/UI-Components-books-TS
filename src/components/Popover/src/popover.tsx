import { useRef, useState, useEffect } from 'react'

import { PopoverButton } from './popover-button'
import { PopoverContent } from './popover-content'
import { PopoverProvider } from './popover-context'
import type { PopoverProps, PopoverSubComponents } from '../types/types'

const Popover: React.FC<PopoverProps> & PopoverSubComponents = ({ children, isVisible = false }) => {
    // Estado que controla la apertura o cierre del popover
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);


    // Referencia del botón que abre el popover
    const popoverButtonRef = useRef<HTMLButtonElement>();


    /**
     * Función para abrir y cerrar el popover
     */
    const togglePopover = () => {
        setIsPopoverOpen(prevState => !prevState);
    };


    /**
     * Función para establecer la referencia del botón
     *
     * @param {HTMLButtonElement} button - Referencia del botón padre.
     */
    const setPopoverButtonRef = (button: HTMLButtonElement) => {
        // Verifica si la referencia actual es nula y asigna la nueva referencia
        if (!popoverButtonRef.current && button) {
            popoverButtonRef.current = button;
        }
    };


    useEffect(() => {
        // Actualiza el estado isOpen si cambia la prop isVisible
        if (isVisible !== undefined) setIsPopoverOpen(isVisible);
    }, [isVisible]);


    return (
        <PopoverProvider value={{ isPopoverOpen, togglePopover, setPopoverButtonRef, popoverButtonRef }}>
            {children}
        </PopoverProvider>
    )
}

Popover.Button = PopoverButton
Popover.Content = PopoverContent

export { Popover }