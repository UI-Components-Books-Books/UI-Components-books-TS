import { useId } from 'react'

import { useDroppable } from '@dnd-kit/core'
import classnames from 'classnames'

import type { DroppableProps } from '../types/types'

import './drag-and-drop.css'

export const Droppable: React.FC<DroppableProps> = ({
  id,
  children,
  validate,
  addClass,
  over = 'c-droppable--active',
  label,
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
      validate,
      label,
      type: 'container'
    }
  })

  return (
    <div
      id={uid}
      ref={setNodeRef}
      data-type-component={__TYPE}
      className={classnames('c-droppable', {
        [over]: isOver,
        [addClass ?? ""]: addClass
      })}
      {...props}
    >
      {children}
    </div>
  )
}

Droppable.defaultProps  = {
  __TYPE: 'droppable',
}