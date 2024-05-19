import { useRef, useEffect, useId } from 'react'

import classnames from 'classnames'
import { usePopper } from 'react-popper'

import { usePopoverContext } from './popover-context'
import { useInteractOutside } from '../../../hooks'
import { Portal } from '../../Portal'

import './popover.css'

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar el keyCode de la tecla "ESC".
 */
const KEYCODE = Object.freeze({
  ESC: 27,
  TAB: 9
} as const)


// Lista de elementos a los cuales se les puede hacer focus.
const SELECTOR_ELEMENTS =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed [tabindex="0"], [contenteditable], audio:not([tabindex="-1"])' as const


type placementsType =
  | 'auto'
  | 'auto-start'
  | 'auto-end'
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end';


interface Props {
  id?: string,
  children: React.ReactNode,
  addClass?: string,
  hasArrow?: boolean,
  isDisabled?: boolean,
  distance?: number,
  placement?: placementsType
  disabledInteractOutside?: boolean,
}


export const PopoverContent: React.FC<Props> = ({
  id,
  children,
  addClass,
  hasArrow = false,
  isDisabled,
  distance,
  placement = 'auto',
  disabledInteractOutside = false,
}) => {
  // Obtenemos la función isOpen y la referencia del botón del contexto
  const { togglePopover, isPopoverOpen, popoverButtonRef } = usePopoverContext();


  // Referencia del Popover
  const refPopover = useRef<HTMLDivElement>(null);
  const refPopoverSwitch = useRef<HTMLDivElement | null>(null);


  // Creamos el id para relacionar el tooltip con su elemento padre
  const reactId = useId();


  // Si `id` está definido, usa `id`; de lo contrario, usa `reactId`
  const uid = id ?? reactId;


  /**
   * Comprueba si el elemento del DOM es el botón que abrió el popover.
   * @param {HTMLElement} element - Elemento del DOM
   * @param {HTMLButtonElement | undefined} refButton - Ref del botón
   * @returns {Boolean}
   */
  const shouldCloseOnInteractOutside = (element: HTMLElement, refButton: HTMLButtonElement | undefined) => {
    return element === refButton;
  };


  /**
    * Maneja el evento al presionar o tocar fuera del popover.
    * @param {MouseEvent} event - Evento mousedown | touchstart
    */
  const onInteractionOutside = (event: MouseEvent) => {
    if (!disabledInteractOutside && !shouldCloseOnInteractOutside(event.target as HTMLElement, popoverButtonRef?.current)) {
      togglePopover();
      event.stopPropagation();
      event.preventDefault();
    }
  };


  /**
   * Custom hook que ejecuta un método cuando se interactúa fuera del popover.
   */
  useInteractOutside({ ref: refPopoverSwitch, onInteractionOutside });


  /**
  * Función para manejar el evento keydown del popover.
  * @param {React.KeyboardEvent} e - Evento de teclado
  */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!refPopover.current || !popoverButtonRef.current) return;

    // Obtemos un array de elementos que se puede ::focus.
    const focusableElements =
      refPopover.current.querySelectorAll(SELECTOR_ELEMENTS)
    // Obtemos la referencia del elemento padre.
    const buttonElement = popoverButtonRef.current

    // Sacamos el primer elemento de la lista.
    const FIRST_ELEMENT = focusableElements[0]
    // Sacamos el último elemento de la lista.
    const LAST_ELEMENT = focusableElements[focusableElements.length - 1]

    // Si va hacia adelante usando tab y el último elemento está activo, entonces agregar el focus al elemento padre.
    if (
      (e.keyCode || e.which) === KEYCODE.TAB &&
      document.activeElement === LAST_ELEMENT
    ) {
      buttonElement?.focus()
      return e.preventDefault()
    }

    // Si va hacia atrás usando shift + tab y el primer elemento está activo, entonces agregar el focus al elemento padre.
    if (
      e.shiftKey &&
      (e.keyCode || e.which) === KEYCODE.TAB &&
      document.activeElement === FIRST_ELEMENT
    ) {
      buttonElement.focus()
      e.preventDefault()
    }

    // Retorna el focus al buttonElement al presionar Esc
    if ((e.keyCode || e.which) === KEYCODE.ESC) {
      buttonElement.focus()
    }
  }


  // Hook para controlar el posicionamiento del PopoverModal con respecto a su elemento padre.
  const { styles, attributes } = usePopper(
    popoverButtonRef.current,
    refPopover.current,
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
        { name: 'eventListeners', enabled: isPopoverOpen }
      ]
    }
  )


  useEffect(() => {
    const popoverModalRef = refPopover.current;

    if (isPopoverOpen && popoverModalRef) {
      // Agrega el focus al PopoverModal cuando está abierto
      popoverModalRef.focus();
      refPopoverSwitch.current = popoverModalRef;
    } else {
      refPopoverSwitch.current = null;
    }
  }, [isPopoverOpen, refPopover]);


  if (isDisabled) {
    // Si el popover está deshabilitado, simplemente renderiza los children
    return <>{children}</>;
  }


  return (
    <Portal id='js-popover-modal-portal'>
      <div
        id={uid}
        ref={refPopover}
        role='status'
        tabIndex={-1}
        style={styles.popper}
        className={classnames('c-popover-modal', {
          'c-popover-modal--active': isPopoverOpen,
          [addClass ?? ""]: addClass
        })}
        onKeyDown={onKeyDown}
        data-hidden={!isPopoverOpen}
        data-popper
        {...(!isPopoverOpen && { hidden: true })}
        {...attributes.popper}
      >
        {children}
        {hasArrow && (
          <div
            className="c-popover-modal__arrow"
            data-class='c-popover-modal__arrow'
            data-popper-arrow
            style={styles.arrow}
          />
        )}
      </div>
    </Portal>
  )
}

