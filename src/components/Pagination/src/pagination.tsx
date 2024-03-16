import classnames from 'classnames'


import { PaginationItem } from './pagination-item'
import type { AriaLabelGenerator, ItemType, TypeElement } from './pagination-types'
import { usePagination } from '../../../hooks'
import type { usePaginationProps } from '../../../hooks/usePagination'

import './pagination.css'


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
const defaultAriaLabel: AriaLabelGenerator = (type, selected, page) => {
    if (type === 'page') {
        return `${selected ? '' : 'Ir a la '}página ${page}`
    }
    return `Ir a la ${getSpanishType[type]} página`
}

interface Props extends usePaginationProps {
    renderItem?: (item: ItemType) => React.ReactNode;
    getItemAriaLabel?: AriaLabelGenerator;
    addClass?: string;
}

type subModules = {
    Item: typeof PaginationItem
}

const Pagination: React.FC<Props> & subModules = ({
    renderItem = (item) => <PaginationItem {...item} />,
    getItemAriaLabel = defaultAriaLabel,
    addClass,
    ...props
}) => {
    /**
     * Se utiliza el custom hook usePagination para
     * obtener la paginación.
     */
    const { items } = usePagination({ ...props })

    return (
        <nav
            className={classnames('c-pagination', { [addClass ?? ""]: addClass })}
        >
            <ul
                className='c-pagination__ul'
                data-class='c-pagination__ul'
            >
                {items.map((item, index) => (
                    <li key={`pagination-item-${index}`} data-class='c-pagination__ul-li'>
                        {/* Utilizamos la render-prop para agregar el elemento que va a estar dentro del tag li */}
                        {renderItem({
                            ...item,
                            'aria-label': getItemAriaLabel ? getItemAriaLabel(item.type as TypeElement, item.selected, item.page) : ''
                        })}
                    </li>
                ))}
            </ul>
        </nav>
    )
}


Pagination.Item = PaginationItem

export { Pagination }
