import { Children, cloneElement } from 'react'

import { usePanelContext } from './panel-contex'
import type { ButtonSectionProps } from '../types/types';

export const ButtonSection: React.FC<ButtonSectionProps> = ({ children, section }) => {
  const { sectionsId, handleToggle } = usePanelContext()

  /**
   * Maneja el cambio de sección al hacer clic en un elemento.
   * Llama a la función handleToggle para cambiar el estado de apertura de la sección.
   */
  const handleChangeSection = () => {
    // Verifica si `section` es un índice válido y si hay IDs de secciones disponibles
    if (section === undefined || section < 0 || section >= sectionsId.length) {
      return;
    }

    // Llama a `handleToggle` con el ID de la sección correspondiente
    handleToggle(sectionsId[section]);
  };


  /**
  * Agregamos el evento onClick al children pasado por
  * medio del componente.
  */
  return Children.map(children, (child) => {
    // Clonamos el elemento hijo y agregamos un nuevo onClick que llama al onClick original y a handleChangeSection
    return cloneElement(child, {
      ...child.props,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        if (child.props.onClick) {
          child.props.onClick(e);
        }
        handleChangeSection();
      }
    });
  });
}

