import classNames from 'classnames'

import { useNumberInputContext } from './number-input-context'
import { ArrowDownIcons } from './number-input-icons'
import { Icon } from '../../Icon'

import './number-input.css'

interface Props {
  addClass?: string,
  label?: string,
  children?: React.ReactNode
}

export const NumberDecrementStepper: React.FC<Props> = ({ children, addClass, label = "Decrementar valor" }) => {
  /**
    * Se obtienen las propiedades onDecrementValue, validate y min
    * del contexto generado por el componente NumberInput.
    */
  const { onDecrementValue, validate, min } = useNumberInputContext();

  return (
    <button
      tabIndex={-1}
      onClick={onDecrementValue}
      disabled={validate(min)}
      aria-label={label}
      className={classNames('c-number-input__button', { addClass: addClass })}
    >
      {children ||
        <Icon>
          <ArrowDownIcons />
        </Icon>
      }
    </button>
  )
}

