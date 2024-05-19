import { useState, useEffect, useMemo } from 'react'

import classnames from 'classnames'
import { motion } from 'framer-motion';

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

interface Props {
  addClass?: string;
}

export const TourHelpLayer: React.FC<Props> = ({ addClass }) => {
  // Propiedad obtenidas a través del contexto.
  const { id, target } = useTourContext()

  // Obtiene el estado de redimensionamiento
  const isResizing = useResize();

  /**
   * Función que obtiene la posición del elemento en el DOM,
   * crea un objecto con eso valores y actualiza el estado position.
   * 
   */
  const getPosition = useMemo(() => {
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
  }, [target, isResizing])

  return (
    <motion.div
      className={classnames('c-tour-help', { [addClass ?? ""]: addClass })}
      style={getPosition}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <p className='c-tour-number' data-class='c-tour-number'>
        {id}
      </p>
    </motion.div>
  )
}
