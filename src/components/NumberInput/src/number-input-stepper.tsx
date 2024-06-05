import classNames from 'classnames'

import type { NumberInputStepperProps } from '../types/types'

import './number-input.css'

export const NumberInputStepper: React.FC<NumberInputStepperProps> = ({ children, addClass }) => {
  return (
    <div className={classNames('c-number-input__stepper', { [addClass ?? ""]: addClass })}>
      {children}
    </div>
  )
}


