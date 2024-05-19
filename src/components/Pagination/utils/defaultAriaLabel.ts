import type { AriaLabelGenerator } from '../src/pagination-types'

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar las definiciones en español
 * de diferentes terminos usados en el aria-label.
 */
const getSpanishType = Object.freeze({
    first: 'primera',
    last: 'última',
    previous: 'anterior',
    next: 'siguiente'
} as const)


/**
 *
 * Se crea una función que permite definir el aria-label
 * de los elementos que son usados para crear la paginación.
 *
 * @param {String} type - Tipo de elemento
 * @param {Number} page - Número de la página
 * @param {Boolean} selected - Boolean que informa si está la página seleccionada.
 * @returns {string} Message - Mensaje utiliado en el aria-label
 */
export const defaultAriaLabel: AriaLabelGenerator = (type, selected, page) => {
    if (type === 'page') {
        return `${selected ? '' : 'Ir a la '}página ${page}`
    }
    return `Ir a la ${getSpanishType[type]} página`
}