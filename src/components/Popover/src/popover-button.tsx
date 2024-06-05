import { cloneElement, Children } from 'react'

import { usePopoverContext } from './popover-context'

export const PopoverButton = ({ children }: { children: JSX.Element }) => {
  // Obtenemos la función togglePopover y setPopoverButtonRef del contexto
  const { togglePopover, setPopoverButtonRef, popoverButtonRef, isPopoverOpen } = usePopoverContext();


  // Si tiene más de un hijo no retornar nada.
  if (Children.count(children) > 1) {
    return null;
  }


  /**
   * Función que determina si el usuario interactuó
   * con algo fuera del popover y del botón, por lo tanto, debería cerrarse.
   *
   * @param {React.MouseEvent<HTMLElement>} event - Evento onBlur
   */
  const shouldCloseOnInteractOutside = (element: HTMLElement | null) => {
    return !!(element && !element.dataset?.popper && element !== popoverButtonRef?.current);
  };


  /**
   * Función para manejar el cierre del popover cuando se interactúa fuera de él.
   *
   * @param {React.FocusEvent<HTMLElement>} event - Evento onBlur
   */
  const handleClosePopoverWithoutFocus = (event: React.FocusEvent<HTMLElement>) => {
    if (isPopoverOpen && shouldCloseOnInteractOutside(event.relatedTarget as HTMLElement)) {
      togglePopover();
    }
  };


  return Children.map(children, (child) => {
    // Clonamos el elemento hijo y agregamos eventos
    return cloneElement(child, {
      ...child.props,
      ref: setPopoverButtonRef, // Asignamos la referencia del botón
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        if (child.props.onBlur) {
          child.props.onBlur(event);
        }
        handleClosePopoverWithoutFocus(event);
      },
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (child.props.onClick) {
          child.props.onClick(event);
        }
        togglePopover(); // Alternamos el estado del popover al hacer clic
      }
    });
  })
}


