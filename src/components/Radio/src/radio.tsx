import { forwardRef, useId } from 'react';

import classNames from 'classnames';

import { RightIcon, WrongIcon } from './radio-icons';

import './radio.css';


const ICON_STATE = Object.freeze({
    right: <RightIcon />,
    wrong: <WrongIcon />
})


interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    id?: string,
    label: string,
    state?: 'right' | 'wrong',
    addClass?: string
}

export const Radio: React.FC<Props> = forwardRef<HTMLInputElement, Props>(
    function Radio({ id, label = 'Default radio label', state, addClass, ...props }, ref) {

        /**
         * Genera identificadores únicos para el componente.
         */
        const reactId: string = useId();
        const uid = id ?? reactId;

        return (
            <div className={classNames('c-input-radio', { addClass: addClass })}>
                <label htmlFor={uid} data-state={state} className='c-input-label'>
                    {label}
                </label>

                <div className="c-input-radio__box">
                    <input
                        id={uid}
                        ref={ref}
                        type="radio"
                        data-state={state}
                        className="c-input-radio__check"
                        {...props}
                    />
                    <div className="c-input-radio__icon">
                        {state && ICON_STATE[state]}
                    </div>
                </div>
            </div>
        );
    }
);
