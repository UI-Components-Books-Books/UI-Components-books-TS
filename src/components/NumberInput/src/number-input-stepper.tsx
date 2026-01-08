import { cn } from '@utils/cn'

import type { NumberInputStepperProps } from '../types/types'

import './number-input.css'

export const NumberInputStepper: React.FC<NumberInputStepperProps> = ({ children, addClass }) => {
  return (
    <div className={cn('c-number-input__stepper', addClass)}>
      {children}
    </div>
  )
}


