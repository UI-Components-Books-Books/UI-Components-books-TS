import { useId, forwardRef } from 'react'

import classNames from 'classnames'
import './switch.css'

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    id: string;
    size?: 'small' | 'normal' | 'big';
    label: string;
    addClass?: string;
    isLabelVisible?: boolean;
}

export const Switch: React.FC<Props> = forwardRef<HTMLInputElement, Props>(
    function Switch({ id, size = 'normal', label = 'Default switch label', addClass, isLabelVisible = false, ...props }, ref) {
        /**
        * Genera identificadores únicos para el componente.
        */
        const reactId: string = useId();
        const uid = id ?? reactId;

        return (
            <div className={classNames(`c-switch c-switch--${size}`, { [addClass ?? ""]: addClass })}>
                <label htmlFor={uid}>
                    <span className={`${!isLabelVisible && 'u-sr-only'}`}> {label} </span>
                </label>
                <input
                    id={uid}
                    ref={ref}
                    role='switch'
                    type='checkbox'
                    className="c-switch__check"
                    {...props}
                />
            </div>
        );
    }
);


