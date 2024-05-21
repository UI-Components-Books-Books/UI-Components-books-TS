import { Children, cloneElement, isValidElement } from 'react'

import './icon.css'


interface Props {
    size?: 'small' | 'normal' | 'big';
    children: React.ReactElement;
}

export const Icon: React.FC<Props> = ({ children, size = 'normal' }) => {
    /**
     * Verificamos si children es un elemento válido antes de procesarlo.
     */
    if (!isValidElement(children)) {
        return <span>It isn&apos;t a valid element</span>;
    }

    /**
     * Verificamos si children tiene más de un hijo.
     */
    if (Children.count(children) > 1) {
        return <span>Only one child is allowed</span>;
    }

    // Utilizamos una aserción de tipo para decirle a TypeScript que esperamos que children.props no sea de tipo '{}'
    const childProps = children.props as React.HTMLAttributes<HTMLElement>;


    // Clonamos el elemento hijo y aplicamos estilos y atributos adicionales.
    return cloneElement(children as JSX.Element, {
        ...(children.props ?? {}),
        className: `c-icon c-${size} ${childProps.className ?? ''}`,
        'aria-hidden': true,
    })

};
