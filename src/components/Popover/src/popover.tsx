import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { PopoverButton } from './popover-button'
import { PopoverContent } from './popover-content'
import { PopoverProvider } from './popover-context'
import type { PopoverProps, PopoverSubComponents } from '../types/types'

const Popover: React.FC<PopoverProps> & PopoverSubComponents = ({ children, isVisible = false }) => {
    // Estado que controla la apertura o cierre del popover
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);


    // Referencia del botón que abre el popover
    const popoverButtonRef = useRef<HTMLButtonElement>();


    // Id del contenido, que el propio contenido registra al montarse (puede venir de su prop `id`).
    // El botón lo usa en `aria-controls`.
    const [contentId, setContentId] = useState<string | undefined>();


    // Id que se le da al botón si no trae uno propio, para poder nombrar el popover con su texto.
    const triggerId = `${useId()}-trigger`;


    /**
     * Función para abrir y cerrar el popover
     */
    const togglePopover = useCallback(() => {
        setIsPopoverOpen(prevState => !prevState);
    }, []);


    /**
     * Función para cerrar el popover (no hace nada si ya está cerrado)
     */
    const closePopover = useCallback(() => {
        setIsPopoverOpen(false);
    }, []);


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
        <PopoverProvider
            value={{
                isPopoverOpen,
                togglePopover,
                closePopover,
                setPopoverButtonRef,
                popoverButtonRef,
                contentId,
                setContentId,
                triggerId,
            }}
        >
            {children}
        </PopoverProvider>
    )
}

Popover.Button = PopoverButton
Popover.Content = PopoverContent

export { Popover }
