import { cloneElement } from 'react'

import { Icon } from '@components';
import { cn } from '@utils/cn'

import { ArrowLeftIcon, ArrowRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from './pagination-icons';
import type { PaginationItemProps } from '../types/types';

import './pagination.css'

export const PaginationItem: React.FC<PaginationItemProps> = ({
    page,
    type,
    addClass,
    disabled,
    selected,
    element = <button type="button" aria-label="default aria" />,
    icons = {
        first: <DoubleArrowLeftIcon />,
        last: <DoubleArrowRightIcon />,
        next: <ArrowRightIcon />,
        previous: <ArrowLeftIcon />
    },
    ...props
}) => {
    /**
      * Se crea un objeto con el fin de almacenar los diferentes
      * tipos de iconos que se usaran para los botones previus,
      * next, last y first de la páginación.
      */

    const normalizedIcons: { [key: string]: React.ReactNode } = {
        previous: icons.previous,
        next: icons.next,
        last: icons.last,
        first: icons.first,
    }

    // Variable que contiene el icono a utilizar dependiendo de la propiedad type.
    const icon = normalizedIcons[type]

    return (type === 'start-ellipsis' || type === 'end-ellipsis')
        ? (
            // Devolvemos '...' si es de tipo ellipsis.
            <div className='c-pagination-item__ellipsis'>...</div>
        )
        : (
            cloneElement(
                element,
                {
                    disabled,
                    ...element.props,
                    ...props,
                    // La clase propia del `element` se suma a las del item (incluida la de página
                    // seleccionada) en lugar de reemplazarlas.
                    className: cn('c-pagination-item', {
                        'c-pagination-item--selected': selected,
                        [addClass ?? ""]: addClass
                    }, element.props.className)
                },
                [
                    // Si es de tipo página colocar la página e.g 1,2,3.
                    type === 'page' && page,
                    // Si existe el icono agregarlo e.g icon = 'last_page'
                    icon ? <Icon key={type}>{icon as JSX.Element}</Icon> : null
                ]
            )
        )
}

