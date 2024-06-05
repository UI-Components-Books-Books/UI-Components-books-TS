import { useRef, useEffect } from 'react'

import classnames from 'classnames'

import { useTabListContext, useTabsContext } from './tabs-context'
import type { TabProps } from '../types/types'

import './tabs.css'

export const Tab: React.FC<TabProps> = ({
  id,
  children,
  addClass,
  icon,
  onClick,
  ...props
}) => {
  // Referencia mutable al botón para poder interactuar con el DOM
  const refButton = useRef<HTMLButtonElement | null>(null);

  // Obtenemos las funciones necesarias del contexto de Tabs
  const { handleValidation, handleToggle } = useTabsContext();

  // Obtenemos la función para agregar una nueva referencia del contexto de la lista de Tabs
  const { addNewTabRef, handleNavigationFocus } = useTabListContext();

  // Determina si este tab está seleccionado
  const isSelected = handleValidation(id!);


  /**
   * Manejador para el evento de click en el botón de tab.
   * Llama a la función onClick proporcioanda (si existe) y activa el tab.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} event - Evento de click
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    }
    handleToggle(id!);
  };


  // Efecto para agregar y limpiar la referencia al botón
  useEffect(() => {
    if (refButton.current) {
      addNewTabRef(refButton.current); // Agrega la referencia al contexto de la lista de Tabs
    }

    return () => {
      // Limpiamos la referencia al desmontar el componente
      refButton.current = null
    };
  }, [addNewTabRef]);

  return (
    <button
      id={`tab-${id}`}
      role='tab'
      ref={refButton}
      tabIndex={isSelected ? 0 : -1}
      aria-controls={`panel-${id}`}
      aria-selected={isSelected}
      onKeyDown={handleNavigationFocus}
      onClick={handleClick}
      className={classnames('c-tab__button', {
        [addClass ?? ""]: addClass,
      })}
      {...props}
    >
      {children}
      {icon && icon(isSelected)}
    </button>
  )
}
