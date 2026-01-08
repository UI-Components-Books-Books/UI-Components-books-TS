import { Children, cloneElement, isValidElement } from 'react'

import { cn } from '@utils/cn'

import type { TabPanelsProps } from '../types/types';

import './tabs.css'

export const TabPanels: React.FC<TabPanelsProps> = ({
  children: childrenProp,
  addClass,
  ...props
}) => {

  // Necesitamos agregar la prop index en los hijos.
  const children = Children.map(childrenProp, (child, index) => {
    // Si el hijo no es un elemento React válido, lo ignoramos
    if (!isValidElement(child)) return null;

    // Obtenemos los props del hijo
    const { props } = child as React.ReactElement;

    // Creamos un nuevo elemento clonado con los componentProperties actualizados
    return cloneElement(child, { id: index, ...props });
  })

  return (
    <div
      className={cn('c-tab__panels', addClass)}
      {...props}
    >
      {children}
    </div>
  )
}