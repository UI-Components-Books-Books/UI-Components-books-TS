import {
  useRef,
  useMemo,
  Children,
  cloneElement,
  isValidElement,
  useState,
  useId
} from 'react'

import { Portal } from '@components'
import { callAll } from '@utils/callAll'
import { cn } from '@utils/cn'
import { getChildRef } from '@utils/getChildRef'
import { mergeRefs } from '@utils/mergeRefs'
import { usePopper } from 'react-popper'

import type { TooltipProps } from '../types/types'

import './tooltip.css'

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar el keyCode de la tecla "ESC".
 */
const KEYCODE = Object.freeze({
  ESC: 27
})

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  id,
  label,
  placement = 'auto',
  addClass,
  hasArrow,
  distance,
  isDisabled
}) => {
  // Estado que contrala la apertura o cierra del tooltip
  const [isOpen, setIsOpen] = useState(false)

  // Referencia del elemento que va a tener el tooltip
  const refElement = useRef<HTMLElement>(null)

  // Ref propia combinada con la que el hijo ya traiga, para no dejar sin ref a quien usa el hijo.
  const childRef = getChildRef<HTMLElement>(children)
  const mergedRef = useMemo(() => mergeRefs(refElement, childRef), [childRef])

  // Referencia del tooltip
  const refTooltip = useRef(null)

  // Almacenamos el ID del setTimeout
  const timeoutID = useRef<number>()

  // Creamos el id relacionar el tooltip con su elemento padre
  const reactId = useId()

  // Si `id` está definido, usa `id`; de lo contrario, usa `reactId`
  const uid = id ?? reactId;


  /**
  * Función para manejar el evento focus del elemento padre.
  */
  const onFocus = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  }


  /**
   * Función para manejar el evento blur (leave focus) del elemento padre.
   */
  const onBlur = () => {
    setIsOpen(false);
  }


  /**
   * Función para manejar el evento mouseover del elemento padre.
   */
  const onMouseEnter = () => {
    // Abrir el tooltip si no está abierto o si el elemento activo es diferente al elemento del tooltip
    if (!isOpen || document.activeElement !== refElement.current) {
      setIsOpen(true);
    }
  }


  /**
  * Función que permite que el texto dentro del tooltip se pueda interactuar.
  * Se utiliza para limpiar el timeout cuando el cursor entra al tooltip.
  */
  const onMouseEnterTooltip = () => {
    window.clearTimeout(timeoutID.current);
  }


  /**
   * Función para manejar el evento mouseout del elemento padre.
   * Cierra el tooltip después de un retraso si el cursor sale del área del tooltip.
   */
  const onMouseLeave = () => {
    // Establecer un timeout para cerrar el tooltip después de 150ms
    timeoutID.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }


  /**
   * Función para manejar el evento keydown del elemento padre.
   * Cierra el tooltip al presionar la tecla Escape (ESC).
   * @param {React.KeyboardEvent} e - El evento de teclado.
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.keyCode || e.which) === KEYCODE.ESC && isOpen) {
      setIsOpen(false);
    }
  }


  // Hook para controlar el posicionamiento del tooltip con respecto a su elemento padre.
  const { styles, attributes } = usePopper(
    refElement.current,
    refTooltip.current,
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


  const updateChildren = Children.map(children, (child) => {
    // Si el hijo no es un elemento React válido, lo ignoramos
    if (!isValidElement(child)) return null;

    // Obtenemos los props del hijo
    const { props } = child as React.ReactElement<Record<string, any>>;

    // Creamos un nuevo objeto combinando los props del hijo con los eventos y atributos adicionales.
    // Los manejadores del hijo no se reemplazan: se llaman primero y luego los del tooltip.
    const componentProperties = {
      ...props,
      // Siempre se relaciona con el tooltip (usa el `uid`, que existe aunque no se pase `id`),
      // conservando lo que el hijo ya describiera.
      'aria-describedby': [props['aria-describedby'], uid].filter(Boolean).join(' '),
      ref: mergedRef,
      onFocus: callAll(props.onFocus, onFocus),
      onBlur: callAll(props.onBlur, onBlur),
      onMouseEnter: callAll(props.onMouseEnter, onMouseEnter),
      onMouseLeave: callAll(props.onMouseLeave, onMouseLeave),
      onKeyDown: callAll(props.onKeyDown, onKeyDown),
    };

    // Creamos un nuevo elemento clonado con los componentProperties actualizados
    return cloneElement(child, componentProperties);
  });


  // Si no hay label, está deshabilitado o tiene más de 1 hijo no mostrar el tooltip
  if (!label || Children.count(children) > 1 || isDisabled) {
    return <>{children}</>
  }

  return (
    <>
      {updateChildren}
      <Portal id="js-tooltip-portal">
        <div
          id={uid}
          ref={refTooltip}
          role='tooltip'
          data-open={isOpen}
          onMouseEnter={onMouseEnterTooltip}
          onMouseLeave={onMouseLeave}
          style={styles.popper}
          className={cn('c-tooltip', {
            'c-tooltip--active': isOpen ,
            [addClass ?? ""]: addClass
          })}
          {...attributes.popper}
        >
          <span dangerouslySetInnerHTML={{__html: label }}></span>
          {hasArrow && (
            <div
              className="c-tooltip__arrow"
              data-popper-arrow
              style={styles.arrow}
            />
          )}
        </div>
      </Portal>
    </>
  )
}

