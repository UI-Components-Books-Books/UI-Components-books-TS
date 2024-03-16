import { useId } from 'react'

import { useDroppable } from '@dnd-kit/core'
import classnames from 'classnames'

import './drag-and-drop.css'

interface Props {
  id?: string;
  children: React.ReactNode | React.ReactNode[];
  validate: string[];
  addClass?: string;
  over?: string; 
  label: string;
  __TYPE?: 'droppable'
}

export const Droppable: React.FC<Props> = ({
  id,
  children,
  validate,
  addClass,
  over = 'c-droppable--active',
  label,
  __TYPE = 'droppable',
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