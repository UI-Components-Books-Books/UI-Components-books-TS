import { useRef, useState, useEffect, useMemo } from 'react'

import { cn } from '@utils/cn'

import { usePanelContext } from './panel-contex'
import { ArrowLeft, ArrowRight } from './panel-icons'
import type { PanelAriaLabelGenerator, ListItemButtonType, ItemsType, ListItemType, NavSectionProps } from '../types/types'

import './panel.css'

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar las definiciones en español
 * de diferentes terminos usados en el aria-label.
 */
const getSpanishType = Object.freeze({
  previous: 'anterior',
  next: 'siguiente'
})

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar el keyCode de las teclas left y right.
 */
const KEYCODE = Object.freeze({
  LEFT: 37,
  RIGHT: 39
})


/**
 *
 * Se crea una función que permite definir el aria-label
 * de los elementos que son usados en la navegación de la secciones.
 *
 * @param {String} type - Tipo de elemento
 * @param {Number} section - Número de la sección
 * @param {Boolean} selected - Boolean que informa si está la sección seleccionada.
 * @returns {string} Message - Mensaje utiliado en el aria-label
 */
const defaultAriaLabel: PanelAriaLabelGenerator = (type, selected, section) => {
  if (type === 'section') {
    return `${selected ? '' : 'Ir a la '}sección ${section}`
  }
  return `Ir a la ${getSpanishType[type]} sección`
}


/**
  * Objeto que tiene como fin almacenar los diferentes
  * tipos de iconos que se usaran para los botones previous y next
  * de la navegación.
  */
const ICONS = {
  previous: <ArrowLeft />,
  next: <ArrowRight />
}

export const NavSection: React.FC<NavSectionProps> = ({
  label = 'Lista de secciones',
  showPrevButton,
  showNextButton,
  onValue,
  addClass,
  getItemAriaLabel = defaultAriaLabel
}) => {
  /**
   * Obtenemos las propiedaes validation,
   * onToggle, listId y currentSection del contexto.
   */
  const { validation, handleToggle, sectionsId, isOpen } = usePanelContext()


  /**
   * Creamos está referencia para almacenar
   * las referencias de los botones usados
   * para navegar entre secciones.
   */
  const refSections = useRef<HTMLButtonElement[]>([]);


  /**
   * Indice de la sección que está visible.
   */
  const currentSection = useMemo(() => sectionsId.findIndex((uid) => uid === isOpen), [isOpen, sectionsId])


  /**
   * Objeto que almacena el valor de la sección a la cual el botón
   * tiene que redirigir dependiendo el tipo de este.
   */
  const BUTTON_TYPE = useMemo(() => {
    const previous = currentSection - 1;
    const next = currentSection + 1;

    return {
      previous: previous >= 0 ? previous : 0, // Asegurarse de que no sea negativo
      next: next < sectionsId.length ? next : sectionsId.length - 1 // Asegurarse de que no sea mayor que el máximo índice
    };
  }, [currentSection, sectionsId]);


  // Tupla con los dos botones disponibles en la navegación
  const BUTTONS: [ListItemButtonType, ListItemButtonType] = ['next', 'previous']


  // Inicializamos el estado con un array vacío de ListItem.
  const [itemList, setItemList] = useState<string[]>([]);


  useEffect(() => {
    if (sectionsId.length === 0) return;

    // Construimos la nueva lista de elementos asegurándonos de que cada elemento sea del tipo ListItem.
    const newList: string[] = [
      // Botón para navegar a la sección anterior.
      ...(showPrevButton ? ['previous' as ListItemButtonType] : []),

      // Lista de todas las secciones, convertimos los elementos de listId a números.
      ...sectionsId,

      // Botón para navegar a la siguiente sección.
      ...(showNextButton ? ['next' as ListItemButtonType] : [])
    ];

    // Actualizamos el estado con la nueva lista.
    setItemList(newList);
  }, [sectionsId, showPrevButton, showNextButton]);


  /**
   * Función utilizada para obtener y almacenar las referencias de los botones.
   *
   * @param {HTMLButtonElement} ref - Referencia del botón.
   * @returns {HTMLButtonElement[]} - Arreglo de referencias actualizado.
   */
  const addNewRef = (ref: HTMLButtonElement): HTMLButtonElement[] => {
    if (!refSections.current.includes(ref) && ref) {
      // Agrega la nueva referencia al arreglo y actualiza refSections.current
      refSections.current = [...refSections.current, ref];
    }
    return refSections.current;
  }


  /**
   * Función utilizada en el evento KeyDown del botón,
   * permite decidir el focus del siguiente elemento
   * utilizando las teclas ArrowLeft o ArrowRight.
   *
   * @param {Event} event - Evento disparado por KeyDown
   */
  const onNavigation = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Obtenemos la primera sección.
    const FIRST_SECTION = refSections.current[0]
    // Obtenemos la última sección.
    const LAST_SECTION = refSections.current[refSections.current.length - 1]

    // Si la tecla pulsada ArrowLeft
    if ((event.keyCode || event.which) === KEYCODE.LEFT) {
      if (event.target === FIRST_SECTION) {
        LAST_SECTION.focus()
      } else {
        const prevFocusButton = refSections.current.indexOf(event.target as HTMLButtonElement) - 1
        // Agregamos el focus al botón anterior
        refSections.current[prevFocusButton].focus()
      }
    } else if ((event.keyCode || event.which) === KEYCODE.RIGHT) {
      // Si la tecla pulsada es ArrowRight
      if (event.target === LAST_SECTION) {
        FIRST_SECTION.focus()
      } else {
        const nextFocusButton = refSections.current.indexOf(event.target as HTMLButtonElement) + 1
        // Agregamos el focus al siguiente botón
        refSections.current[nextFocusButton].focus()
      }
    }
  }


  /**
   * Función del evento onClick utilizado
   * para mostrar la sección.
   * @param {Number} section - sección
   */
  const handleClick = (section: string) => {
    handleToggle(section)

    if (onValue !== undefined) {
      onValue(currentSection, sectionsId.length)
    }
  }


  // Convierte la lista de elementos básicos en objetos.
  const items: Array<ItemsType> = itemList.map((item: string | ListItemButtonType) => {
    // Encuentra los índices de las primeras y últimas secciones en sectionsId
    const lastSectionIndex = sectionsId.length - 1;
    const firstSectionIndex = 0;

    // Encuentra los índices de las secciones si el item es una sección
    let sectionIndex: number | undefined;
    if (!BUTTONS.includes(item as ListItemButtonType)) {
      sectionIndex = sectionsId.findIndex((uid) => uid === item);
    }

    return {
      onClick: () => {
        if (sectionIndex !== undefined) {
          handleClick(sectionsId[sectionIndex]);
          return;
        }

        const buttonType = BUTTON_TYPE[item as keyof typeof BUTTON_TYPE];
        handleClick(sectionsId[buttonType]);
      },
      type: sectionIndex !== undefined ? 'section' : item as ListItemType,
      section: sectionIndex,
      selected: sectionIndex !== undefined ? validation(sectionsId[sectionIndex]) : false,
      ref: addNewRef,
      onKeyDown: onNavigation,
      ...(sectionIndex === undefined && {
        disabled:
          true &&
          (item === 'next'
            ? currentSection >= (lastSectionIndex || 0)
            : currentSection <= firstSectionIndex)
      })
    };
  });


  return (
    <>
      <h2 id='section-list-navigation' className='u-sr-only'>
        {label}
      </h2>
      <ul
        role='tablist'
        aria-labelledby='section-list-navigation'
        aria-orientation="horizontal"
        className={cn('c-navigation', addClass)}
      >
        {
          items.map(({ section, type, selected, ...others }, index) => (
            <li
              key={`navigation-section-item-${index}`}
              role='presentation'
              data-class='c-navigation__item'
              className="c-navigation__item"
            >
              {type === 'section'
                ? (
                  <button
                    id={`navigation-section-tab-${section}`}
                    role='tab'
                    tabIndex={selected ? 0 : -1}
                    aria-selected={selected}
                    data-class='c-navigation__section'
                    className="c-navigation__section"
                    aria-label={getItemAriaLabel(type, selected, section)}
                    {...others}
                  />
                )
                : (
                  <button
                    type='button'
                    data-class='c-navigation__button'
                    className="c-navigation__button"
                    aria-label={getItemAriaLabel(type, selected)}
                    {...others}
                  >
                    {ICONS[type]}
                  </button>
                )}
            </li>
          ))
        }
      </ul>
    </>
  )
}

