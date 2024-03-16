import { forwardRef } from 'react'

import './row.css'
import classnames from 'classnames';

interface Props extends React.HTMLProps<HTMLDivElement> {
  addClass?: string;
  justifyContent?: string;
  alignItems?: string;
}

export const Row = forwardRef<HTMLDivElement, Props>(
  function Row({ addClass, ...props }, ref: React.Ref<HTMLDivElement>) {
    return (
      <div ref={ref} className={classnames('c-row', { [addClass ?? ""]: addClass })} {...props} />
    );
  }
);