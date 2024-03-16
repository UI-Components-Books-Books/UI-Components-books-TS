import classNames from 'classnames'

import { useNumberInputContext } from './number-input-context'
import { ArrowUpIcons } from './number-input-icons'
import { Icon } from '../../Icon'

import './number-input.css'

interface Props {
  addClass?: string,
  label?: string,
  children?: React.ReactNode
}

export const NumberIncrementStepper: React.FC<Props> = ({ children, addClass, label = 'Incrementar valor' }) => {
  /**
    * Se obtienen las propiedades onDecrementValue, validate y min
    * del contexto generado por el componente NumberInput.
    */
  const { onIncrementValue, validate, max } = useNumberInputContext()

  return (
    <button
      tabIndex={-1}
      onClick={onIncrementValue}
      disabled={validate(max)}
      aria-label={label}
      className={classNames('c-number-input__button', { [addClass ?? ""]: addClass })}
    >
      {children ||
        <Icon>
          <ArrowUpIcons />
        </Icon>
      }
    </button>
  )
}