import { forwardRef } from 'react'

import { cn } from '@utils/cn';

import type { ColProps } from '../types/types';

import './col.css'

export const Col = forwardRef<HTMLDivElement, ColProps>(
    function Col({ addClass, ...props }, ref: React.Ref<HTMLDivElement>) {
        return (
            <div ref={ref} className={cn('c-col', addClass)} {...props} />
        );
    }
);

