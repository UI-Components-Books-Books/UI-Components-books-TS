import { forwardRef } from 'react'

import './row.css'

interface Props extends React.HTMLProps<HTMLDivElement> {
  addClass?: string;
  justifyContent?: string;
  alignItems?: string;
}

export const Row = forwardRef<HTMLDivElement, Props>(
  function Row({ addClass, ...props }, ref: React.Ref<HTMLDivElement>) {
    return (
      <div ref={ref} className={`c-row ${addClass ?? ''}`} {...props} />
    );
  }
);