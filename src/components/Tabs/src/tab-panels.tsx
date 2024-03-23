import { Children, cloneElement, isValidElement } from 'react'

import classnames from 'classnames'

import './tabs.css'

interface Props {
  children: JSX.Element | JSX.Element[];
  addClass?: string;
}

export const TabPanels: React.FC<Props> = ({
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
      className={classnames('c-tab__panels', { [addClass ?? ""]: addClass })}
      {...props}
    >
      {children}
    </div>
  )
}