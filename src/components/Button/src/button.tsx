import { ButtonHTMLAttributes, forwardRef } from 'react'

import classnames from 'classnames'

import './button.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    size?: 'small' | 'normal' | 'big';
    variant?: 'primary' | 'secondary' | 'no-line';
    hasAriaLabel?: boolean;
    addClass?: string;
    children?: React.ReactNode;
}

export const Button: React.FC<Props> = forwardRef<HTMLButtonElement, Props>(function Button(props, ref) {
    const {
        label,
        size = 'normal',
        variant = 'primary',
        hasAriaLabel = false,
        children,
        addClass,
        ...others
    } = props


    return (
        <button
            ref={ref}
            className={classnames(
                'c-button', `c-button--${variant}`, `c-button--${size}`,
                {
                    [addClass ?? ""]: addClass
                }
            )}
            {...(hasAriaLabel && { 'aria-label': `${label}` })}
            {...others}
        >
            {children}
            {!hasAriaLabel ? label : null}
        </button>
    )
})


