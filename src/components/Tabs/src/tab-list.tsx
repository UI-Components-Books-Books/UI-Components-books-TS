import React, { cloneElement, Children, isValidElement, useRef } from 'react'

import { cn } from '@utils/cn'

import { TabListProvider } from './tabs-context'
import type { TabListProps } from '../types/types'

import './tabs.css'

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar el keyCode de las teclas up, down, end y home.
 */
const KEYCODE = Object.freeze({
  LEFT: 37,
  RIGHT: 39
})

export const TabList: React.FC<TabListProps> = ({
  children: ChildrenProps,
  addClass,
  label = 'Simple tabs',
  orientation = 'horizontal',
  ...props
}) => {
  /**
   * Usado para almacenar las referencias
   * de todos los botones usados como Tab.
   */
  const refTabs = useRef<HTMLButtonElement[]>([])


  /**
   * Función para utilizada para agregar una nueva referencia
   * al arreglo de referencias refTabs.
   *
   * @param {HTMLButtonElement} ref - Referencia del botón usado en el Tab.
   * @returns {void}
   */
  const addNewTabRef = (ref: HTMLButtonElement): void => {
    refTabs.current = [...refTabs.current, ref];
  };


  /**
   * Función utilizada en el evento KeyDown del botón,
   * permite decidir el focus del siguiente elemento
   * utilizando las teclas ArrowLeft o ArrowRight.
   *
   * @param {React.KeyboardEvent} e - Evento disparado por KeyDown
   * @returns {void}
   */
  const handleNavigationFocus = (e: React.KeyboardEvent): void => {
    // Obtenemos la primera Tab
    const FIRST_TAB = refTabs.current[0];
    // Obtenemos la última Tab
    const LAST_TAB = refTabs.current[refTabs.current.length - 1] as HTMLButtonElement;

    // Si la tecla pulsada ArrowLeft
    if (e.keyCode === KEYCODE.LEFT) {
      if (e.target === FIRST_TAB) {
        LAST_TAB.focus();
      } else {
        const prevFocusButton = refTabs.current.indexOf(e.target as HTMLButtonElement) - 1;
        // Agregamos el focus al botón anterior
        refTabs.current[prevFocusButton].focus();
      }
    } else if (e.keyCode === KEYCODE.RIGHT) {
      // Si la tecla pulsada es ArrowRight
      if (e.target === LAST_TAB) {
        FIRST_TAB.focus();
      } else {
        const nextFocusButton = refTabs.current.indexOf(e.target as HTMLButtonElement) + 1;
        // Agregamos el focus al siguiente botón
        refTabs.current[nextFocusButton].focus();
      }
    }
  };


  const children = Children.map(ChildrenProps, (child, index) => {
    // Si el hijo no es un elemento React válido, lo ignoramos
    if (!isValidElement(child)) return null;

    // Obtenemos los props del hijo
    const { props } = child as React.ReactElement;

    // Creamos un nuevo elemento clonado con los componentProperties actualizados
    return cloneElement(child, { id: index, ...props });
  });

  return (
    <TabListProvider value={{ addNewTabRef, handleNavigationFocus }}>
      <div
        role='tablist'
        aria-label={label}
        aria-orientation={orientation}
        className={cn('c-tab__list', addClass)}
        {...props}
      >
        {children}
      </div>
    </TabListProvider>
  )
}
