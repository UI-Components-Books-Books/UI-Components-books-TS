import { forwardRef } from 'react'

import classnames from 'classnames';

import type { ColProps } from '../types/types';

import './col.css'

export const Col = forwardRef<HTMLDivElement, ColProps>(
    function Col({ addClass, ...props }, ref: React.Ref<HTMLDivElement>) {
        return (
            <div ref={ref} className={classnames('c-col', { [addClass ?? ""]: addClass })} {...props} />
        );
    }
);

