import {  useId } from 'react'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import classnames from 'classnames'

import { useDragAndDropContext } from './drag-and-drop-context'
import type { DraggableProps } from '../types/types'

import './drag-and-drop.css'

export const Draggable: React.FC<DraggableProps> = ({
  id,
  children,
  addClass,
  dragging,
  label,
  attribute,
  __TYPE,
  ...props
}) => {
  const reactId = useId();
  const uid = id || reactId;


  /**
   * Obtenemos las diferentes propiedades
   * pasadas a través del contexto generado
   * en el componente DragAndDrop.
   */
  const { listId, propValidate, validate, isDragging } = useDragAndDropContext();
  const isDraggingElement = isDragging === uid

  /**
   * Utilizamos el hook useDraggable
   * para poder agregar la funcionalidad
   * de "drag" al componente.
   */
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: uid,
    disabled: validate,
    data: {
      label
    },
    ...({ attributes: attribute } || {})
  })


  return (
    <button
      id={uid}
      ref={setNodeRef}
      data-type-component={__TYPE}
      className={classnames('c-draggable', {
        [dragging ?? ""]: isDraggingElement,
        [addClass ?? ""]: addClass
      })}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...(validate && { [propValidate]: !!listId.includes(uid) })}
      { ...attributes }
      {...listeners}
      {...props}
    >
      {children}
    </button>
  )
}


Draggable.defaultProps = {
  __TYPE: 'draggable',
}