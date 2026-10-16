import { forwardRef, useEffect, useId, useMemo } from 'react'

import { cn } from '@utils/cn'

import { usePanelContext } from './panel-contex'
import type { SectionProps } from '../types/types'

import './panel.css'

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  function Section({ id, children, addClass, ...props }, ref) {
    const { validation, addSectionId, getSectionIndex, type } = usePanelContext();

    // Referencia para almacenar el valor del ID de la sección.
    const reactId: string = useId();
    // Si `id` está definido, usa `id`; de lo contrario, usa `reactId`
    const uid = id ?? reactId;

    // Id del texto que nombra la sección. Se deriva del id propio de React y no de `uid`, que puede
    // venir del usuario y repetirse en otro Panel de la misma página.
    const labelId = `${reactId}-label`;

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
        aria-labelledby={labelId}
        className={cn('c-section', addClass)}
        {...(type === 'carrousel' && {
          'aria-roledescription': 'Sección'
        })}
        {...props}
      >
        <span id={labelId} className='u-sr-only'>
          Sección {getSectionIndex(uid)}
        </span>
        {children}
      </section>
    )
  }
)

