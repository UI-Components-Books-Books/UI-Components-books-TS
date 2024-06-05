import {
  useRef,
  Children,
  cloneElement,
  isValidElement,
  useState,
  useId
} from 'react'

import classNames from 'classnames'
import { usePopper } from 'react-popper'

import { Portal } from '../../Portal'
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
  const refElement = useRef(null)

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
    const { props } = child;

    // Creamos un nuevo objeto combinando los props del hijo con los eventos y atributos adicionales
    const componentProperties = Object.assign({}, {
      'aria-describedby': id,
      ref: refElement,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      onKeyDown,
      ...props
    });

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
          className={classNames('c-tooltip', {
            'c-tooltip--active': isOpen ,
            [addClass ?? ""]: addClass
          })}
          {...attributes.popper}
        >
          {label}
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

