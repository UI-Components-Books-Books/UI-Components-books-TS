import { cloneElement, Children, useMemo } from 'react'

import { getChildRef } from '@utils/getChildRef'
import { mergeRefs } from '@utils/mergeRefs'

import { usePopoverContext } from './popover-context'

export const PopoverButton = ({ children }: { children: JSX.Element }) => {
  // Obtenemos las funciones y los ids del contexto
  const {
    togglePopover,
    closePopover,
    setPopoverButtonRef,
    popoverButtonRef,
    isPopoverOpen,
    contentId,
    triggerId,
  } = usePopoverContext();

  // Ref del popover combinada con la que el botón ya traiga, para no dejarlo sin ref.
  const childRef = getChildRef<HTMLButtonElement>(children);
  const mergedRef = useMemo(
    () => mergeRefs<HTMLButtonElement>((node) => { if (node) setPopoverButtonRef(node) }, childRef),
    [childRef, setPopoverButtonRef]
  );


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
      // Necesita un id para que el popover pueda nombrarse con el texto del botón.
      id: child.props.id ?? triggerId,
      ref: mergedRef, // Asignamos la referencia del botón (y la que él ya traiga)
      // El botón abre un diálogo, que está abierto o cerrado. Si el botón ya declara
      // `aria-haspopup` o `aria-controls` se respetan; `aria-expanded` siempre refleja el estado real.
      'aria-haspopup': child.props['aria-haspopup'] ?? 'dialog',
      'aria-controls': child.props['aria-controls'] ?? contentId,
      'aria-expanded': isPopoverOpen,
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        if (child.props.onBlur) {
          child.props.onBlur(event);
        }
        handleClosePopoverWithoutFocus(event);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
        if (child.props.onKeyDown) {
          child.props.onKeyDown(event);
        }
        // Con el popover abierto, Escape lo cierra y no llega a cerrar también lo que lo contenga (p. ej. un Modal).
        if (event.key === 'Escape' && isPopoverOpen && !event.defaultPrevented) {
          event.stopPropagation();
          closePopover();
        }
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
