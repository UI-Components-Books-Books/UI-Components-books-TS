import { forwardRef, useId } from 'react';

import classNames from 'classnames';

import { NormalIcon, RightIcon, WrongIcon } from './checkbox-icons';

import './checkbox.css';


const ICON_STATE = Object.freeze({
    normal: <NormalIcon />,
    right: <RightIcon />,
    wrong: <WrongIcon />
})


interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    id?: string,
    label: string,
    state?: 'normal' | 'right' | 'wrong',
    addClass?: string
}

export const CheckBox: React.FC<Props> = forwardRef<HTMLInputElement, Props>(
    function CheckBox({ id, label = 'Default checkbox label', state = 'normal', addClass, ...props }, ref) {

        /**
         * Genera identificadores únicos para el componente.
         */
        const reactId: string = useId();
        const uid = id ?? reactId;

        return (
            <div className={classNames('c-input-checkbox', { [addClass ?? ""]: addClass })}>
                <label htmlFor={uid} data-state={state} className='c-input-label'>
                    {label}
                </label>

                <div className="c-input-checkbox__box">
                    <input
                        id={uid}
                        ref={ref}
                        type="checkbox"
                        data-state={state}
                        className="c-input-checkbox__check"
                        {...props}
                    />
                    <div className="c-input-checkbox__icon">
                        {ICON_STATE[state]}
                    </div>
                </div>
            </div>
        );
    }
);
