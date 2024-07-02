import { createElement, isValidElement, useRef } from 'react'

import classnames from 'classnames'
import { motion } from 'framer-motion';
import { usePopper } from 'react-popper'

import { useTourContext } from './tour-context'
import { CloseIcon, LeftArrowIcon, RightArrowIcon } from './tour-icons';
import { Button } from '../../Button'
import { Icon } from '../../Icon';
import type { TourElementProps } from '../types/types'

import './tour.css'

export const TourElement: React.FC<TourElementProps> = ({
  hideCloseButton = false,
  hideBackButton = false,
  ariaAttributes = {
    role: 'dialog',
    tabIndex: -1,
    'aria-label': 'Tour por la plataforma',
    'aria-modal': true
  },
  addClass
}) => {
  // Propiedad obtenidas a través del contexto.
  const {
    isOpen,
    lastId,
    methods,
    id,
    target,
    content,
    placement,
    distance,
  } = useTourContext();

  // Obtenemos la referencia del contenedor.
  const refContainer = useRef<HTMLDivElement>(null)

  /**
   * Desestructuramos el objeto "methods" que
   * contiene las diferentes funciones usada
   * en los botones.
   */
  const { onClose, onPrev, onNext } = methods

  // Hook para controlar el posicionamiento del TourElement con respecto a su elemento padre.
  const { styles, attributes } = usePopper(
    document.querySelector(target!),
    refContainer.current,
    {
      placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, distance || 8]
          }
        },
        {
          name: 'computeStyles',
          options: {
            adaptive: false
          }
        },
        { name: 'eventListeners', enabled: isOpen }
      ]
    }
  )

  /**
   * Función utilizada para distiguir que renderizar,
   * si es un texto crea un elemento "p", si no
   * devuelve el elemento contenido en la propiedad content.
   *
   * @returns {ReactNode} - Elemento react.
   */
  const renderContent = (): JSX.Element => {
    if (isValidElement(content)) {
      return content
    }
    return createElement('p', { role: 'status', 'aria-live': 'polite', className: 'tour-description' }, [
      content
    ])
  }

  return (
    <>
      <div
        className='c-layout'
        data-class='c-layout'
      />
      <motion.div
        ref={refContainer}
        id={`unique-id-tour-element-${id}`}
        style={styles.popper}
        className={classnames('c-tour-content', { [addClass ?? ""]: addClass })}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        {...ariaAttributes}
        {...attributes.popper}
      >
        <span className='u-sr-only'>
          Parte {id} de {lastId}.
        </span>

        <div
          aria-hidden
          className='c-tour-progress'
          data-class='c-tour-progress'
        >
          <div
            className='c-tour-progress-bar'
            data-class='c-tour-progress__bar'
            style={{ transform: `scaleX(${(id || 0) / lastId})` }}
          />
        </div>

        {renderContent()}

        <div
          className='c-tour-button-container'
          data-class='c-tour-button-container'
        >
          {!hideCloseButton && (
            <Button
              hasAriaLabel
              label='Salir'
              data-class='c-button__close'
              onClick={onClose}
            >
              <Icon>
                <CloseIcon />
              </Icon>
            </Button>
          )}

          {!hideBackButton && (
            <Button
              disabled={id === 1}
              hasAriaLabel
              label='Anterior'
              data-class='c-button__before'
              onClick={onPrev}
            >
              <Icon>
                <LeftArrowIcon />
              </Icon>
            </Button>
          )}

          <Button
            disabled={id === lastId}
            hasAriaLabel
            label='Siguiente'
            data-class='c-button__after'
            onClick={onNext}
          >
            <Icon>
              <RightArrowIcon />
            </Icon>
          </Button>
        </div>
      </motion.div>
    </>
  )
}
