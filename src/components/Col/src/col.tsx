import { forwardRef } from 'react'

import classnames from 'classnames';

import './col.css'

type range =
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12';

interface Props extends React.HTMLProps<HTMLDivElement> {
    addClass?: string;
    xs?: range;
    xm?: range;
    sm?: range;
    mm?: range;
    md?: range;
    lg?: range;
    hd?: range;
}

export const Col = forwardRef<HTMLDivElement, Props>(
    function Col({ addClass, ...props }, ref: React.Ref<HTMLDivElement>) {
        return (
            <div ref={ref} className={classnames('c-col', { [addClass ?? ""]: addClass })} {...props} />
        );
    }
);

