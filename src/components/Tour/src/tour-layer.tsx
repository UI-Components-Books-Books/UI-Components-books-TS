import { useState, useEffect } from 'react'

import { cn } from '@utils/cn'
import gsap from 'gsap';

import { useTourContext } from './tour-context'

import './tour.css'

const useResize = (delay: number = 500) => {
  const [isResizing, setIsResizing] = useState<boolean>(false)

  /**
  * Efecto utilizado para agregar el evento
  * resize en el objeto global window.
  */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    /**
     * Maneja el evento de redimensionamiento con un temporizador.
     */
    const handleResize = () => {
      if (timer !== null) {
        clearTimeout(timer)
      }

      // Si no se está ya redimensionando, marca como redimensionando y configura un temporizador
      if (!isResizing) setIsResizing(true)

      timer = setTimeout(() => {
        setIsResizing(false);
      }, delay);
    }

    // Agrega el evento de redimensionamiento al objeto global window
    window.addEventListener('resize', handleResize)

    // Limpia el temporizador y remueve el evento al desmontar el componente
    return () => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      window.removeEventListener('resize', handleResize);
    }
  }, [isResizing, delay])

  return isResizing
}


/**
 * Obtiene la posición y el tamaño del elemento objetivo en el DOM
 * y los devuelve como propiedades de estilo para la capa de ayuda.
 *
 * @param {string | undefined} target - Selector CSS del elemento objetivo.
 * @returns {React.CSSProperties | undefined} Estilos de la capa, o `undefined` si no hay objetivo o no existe.
 */
const getTargetPosition = (target?: string): React.CSSProperties | undefined => {
  // Verifica si hay un objetivo para calcular la posición
  if (!target) return;

  // Busca el elemento en el DOM que coincide con el selector proporcionado
  const element = document.querySelector(target);
  if (!element) return;

  // Obtiene las dimensiones y la posición del elemento
  const { x, y, width, height } = element.getBoundingClientRect();

  // Devuelve un objeto con propiedades de estilo para el componente
  return {
    width: `${width}px`,
    height: `${height}px`,
    top: 0,
    left: 0,
    transform: `translate(${x}px, ${y}px)`
  };
}


export const TourHelpLayer = ({ addClass }: { addClass?: string }) => {
  // Propiedad obtenidas a través del contexto.
  const { id, target } = useTourContext()

  // No se usa su valor: el hook guarda el estado de redimensionamiento, así que cuando empieza y
  // cuando termina un cambio de tamaño de la ventana este componente se vuelve a renderizar y la
  // posición de abajo se vuelve a medir.
  useResize();

  // Se mide en cada render (es barato): así sigue al objetivo al cambiar de paso y al redimensionar.
  const position = getTargetPosition(target);

  return (
    <div
      ref={(el) => {
        if (el) {
          gsap.fromTo(
            el,
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: 'power2.out' }
          );
        }
      }}
      className={cn('c-tour-help', addClass)}
      style={position}
    >
      <p className='c-tour-number' data-class='c-tour-number'>
        {id}
      </p>
    </div>
  )
}
