import { useId } from 'react'

import { useDroppable } from '@dnd-kit/core'
import classnames from 'classnames'

import './drag-and-drop.css'

interface Props {
  id?: string;
  children: JSX.Element | JSX.Element[];
  addClass?: string;
  over?: string;
  label: string;
  __TYPE?: 'general-draggable'
}

export const ContainerDrag: React.FC<Props> = ({
  id,
  children,
  addClass,
  over,
  label = 'contendor inicial',
  __TYPE = 'general-draggable',
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
      className={classnames(`c-droppable`, {
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