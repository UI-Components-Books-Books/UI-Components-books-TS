import { forwardRef, useEffect, useId, useMemo } from 'react'

import classnames from 'classnames'

import './panel.css'
import { usePanelContext } from './panel-contex'

interface Props {
  id?: string;
  children?: React.ReactNode,
  addClass?: string,
}


export const Section: React.FC<Props> = forwardRef<HTMLDivElement, Props>(
  function Section({ id, children, addClass, ...props }, ref) {
    const { validation, addSectionId, getSectionIndex, type } = usePanelContext();

    // Referencia para almacenar el valor del ID de la sección.
    const reactId: string = useId();
    // Si `id` está definido, usa `id`; de lo contrario, usa `reactId`
    const uid = id ?? reactId;

    /**
     * Obtiene todos los elementos <audio>,
     * y los pausa si están reproduciéndose,
     * para evitar la superposición de audios.
     */
    const pauseAllAudios = () => {
      const audios = document.querySelectorAll('audio');
      audios.forEach((audio) => {
        if (!audio.paused) {
          audio.pause();
        }
      });
    };

    /**
     * Devuelve "true" o "false" después de evaluar
     * el ID de la sección con el que está en el estado.
     *
     * @returns {boolean} - `true` si la sección está seleccionada, `false` si no.
     */
    const isSelected = useMemo(() => {
      const isSelected = validation(uid);

      // Pausa todos los audios si la sección está seleccionada
      if (isSelected) {
        pauseAllAudios();
      }

      return isSelected;
    }, [uid, validation]);


    useEffect(() => {
      addSectionId(uid)
    }, [uid, addSectionId])

    return (
      <section
        ref={ref}
        role={type === 'carrousel' ? 'group' : 'tabpanel'}
        hidden={!isSelected}
        aria-hidden={!isSelected}
        data-value={uid}
        aria-labelledby={`section-${uid}`}
        className={classnames('c-section', { [addClass ?? ""]: addClass })}
        {...(type === 'carrousel' && {
          'aria-roledescription': 'Sección'
        })}
        {...props}
      >
        <span id={`section-${uid}`} className='u-sr-only'>
          Sección {getSectionIndex(uid)}
        </span>
        {children}
      </section>
    )
  }
)

