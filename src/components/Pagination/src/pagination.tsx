import classnames from 'classnames'

import { PaginationItem } from './pagination-item'
import type { AriaLabelGenerator, ItemType, TypeElement } from './pagination-types'
import { usePagination } from '../../../hooks'
import type { usePaginationProps } from '../../../hooks/usePagination'
import { defaultAriaLabel } from '../utils/defaultAriaLabel'

import './pagination.css'

interface Props extends usePaginationProps {
    renderItem?: (item: ItemType) => React.ReactNode;
    getItemAriaLabel?: AriaLabelGenerator;
    addClass?: string;
    role?: string;
}

type subModules = {
    Item: typeof PaginationItem
}

const Pagination: React.FC<Props> & subModules = ({
    renderItem = (item) => <PaginationItem {...item} />,
    getItemAriaLabel = defaultAriaLabel,
    addClass,
    role = 'navigation',
    ...props
}) => {
    /**
     * Se utiliza el custom hook usePagination para
     * obtener la paginación.
     */
    const { items } = usePagination({ ...props })

    return (
        <nav role={role} className={classnames('c-pagination', { [addClass ?? ""]: addClass })}>
            <ul className='c-pagination__ul'>
                {items.map((item, index) => (
                    <li key={`pagination-item-${index}`}>
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
