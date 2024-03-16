import classNames from 'classnames'

import './number-input.css'

interface Props {
  children: JSX.Element[],
  addClass?: string
}

export const NumberInputStepper: React.FC<Props> = ({ children, addClass }) => {
  return (
    <div className={classNames('c-number-input__stepper', { [addClass ?? ""]: addClass })}>
      {children}
    </div>
  )
}


