import { useId } from 'react'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@utils/cn'

import type { ContainerDragProps } from '../types/types'

import './drag-and-drop.css'

export const ContainerDrag: React.FC<ContainerDragProps> = ({
  id,
  children,
  addClass,
  over,
  label = 'contendor inicial',
  __TYPE,
  ...props
}) => {

  const reactId = useId();
  const uid = id || reactId;

  /**
   * Utilizamos el hook useDroppable
   * para poder agregar la funcionalidad
   * de "drop" al componente.
   */
  const { isOver, setNodeRef } = useDroppable({
    id: uid,
    data: {
      label,
      type: 'container'
    }
  })

  return (
    <div
      id={uid}
      ref={setNodeRef}
      data-type-component={__TYPE}
      className={cn(`c-droppable`, {
        [over ?? '']: isOver,
        [addClass ?? ""]: addClass
      })}
      {...props}
    >
      {children}
    </div>
  )
}


ContainerDrag.defaultProps = {
  __TYPE: 'general-draggable',
}