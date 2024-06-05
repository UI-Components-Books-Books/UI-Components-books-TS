import {forwardRef } from 'react'

import classnames from 'classnames'

import type { ButtonProps } from '../types/types'

import './button.css'


export const Button: React.FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
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


