import {
    useRef,
    Children,
    cloneElement,
    isValidElement,
    useState,
    useId
} from 'react'

import { Portal } from '@components'
import { cn } from '@utils/cn';
import { usePopper } from 'react-popper'

import type { ToggletipProps } from '../types/types';

import './toggletip.css'

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar el keyCode de la tecla "ESC".
 */
const KEYCODE = Object.freeze({
    ESC: 27
})

export const Toggletip: React.FC<ToggletipProps> = ({
    id,
    label,
    addClass,
    hasArrow,
    distance,
    placement = "auto",
    children,
    disabledInteractOutside,
}) => {
    // Estado que controla la apertura o cierre del Toggletip
    const [isOpen, setIsOpen] = useState(false);


    // Referencia del elemento que va a tener el Toggletip
    const refElement = useRef<HTMLElement>(null);


    // Referencia del Toggletip
    const refToggletip = useRef<HTMLDivElement>(null);


    // Creamos el id para relacionar el Toggletip con su elemento padre
    const reactId = useId();


    // Si `id` está definido, usa `id`; de lo contrario, usa `reactId`
    const uid = id ?? reactId;


    /**
     * Función para manejar el evento blur del refElement.
     */
    const onBlur = () => {
        setIsOpen(false);
    };


    /**
     * Función para manejar el evento click del refElement.
     */
    const onClick = () => {
        setIsOpen(!isOpen);

        // Si ya está abierto y se hace clic en el mismo elemento, ciérralo
        if (isOpen && document.activeElement === refElement.current && !disabledInteractOutside) {
            setTimeout(() => {
                setIsOpen((prev) => !prev);
            }, 100);
        }
    };


    /**
     * Función para manejar el evento keydown del refElement.
     * Cierra el Toggletip si está abierto y se presiona ESC.
     * @param {React.KeyboardEvent} event - Evento de teclado
     */
    const onKeyDown = (event: React.KeyboardEvent) => {
        if ((event.keyCode | event.which) === KEYCODE.ESC && isOpen) {
            setIsOpen(!isOpen)
        }
    }


    // Actualiza los children con los eventos necesarios
    const updatedChildren = Children.map(children, (child) => {
        if (!isValidElement(child)) return null;

        // Agregamos todos los eventos al refElement.
        return cloneElement(child, {
            ...child.props,
            'aria-describedby': id,
            ref: refElement,
            onClick: (event: React.MouseEvent<HTMLElement>) => {
                if (child.props.onClick) {
                    child.props.onClick(event);
                }
                onClick();
            },
            'data-open': isOpen,
            ...(disabledInteractOutside ? {} : { onBlur, onKeyDown }),
        });
    });


    // Hook para controlar el posicionamiento del Toggletip con respecto a su refElement.
    const { styles, attributes } = usePopper(
        refElement.current,
        refToggletip.current,
        {
            placement,
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, distance || 8]
                    }
                },
                {
                    name: 'flip',
                    options: {
                        padding: 10
                    }
                },
                { name: 'eventListeners', enabled: isOpen }
            ]
        }
    )


    // Si no hay label, está deshabilitado o tiene más de 1 hijo no mostrar el Toggletip
    if (!label || Children.count(children) > 1) {
        return <>{children}</>
    }

    return (
        <>
            {updatedChildren}
            <Portal id='js-toggletip-portal'>
                <div
                    id={uid}
                    ref={refToggletip}
                    role='status'
                    style={styles.popper}
                    className={cn('c-toggletip', {
                        'c-toggletip--active': isOpen,
                        [addClass ?? ""]: addClass
                    })}
                    {...attributes.popper}
                >
                    {label}
                    {hasArrow && (
                        <div
                            className="c-toggletip__arrow"
                            data-popper-arrow
                            style={styles.arrow}
                        />
                    )}
                </div>
            </Portal>
        </>
    )
}

