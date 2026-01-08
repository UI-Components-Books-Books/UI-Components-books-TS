import { Icon } from "@components";
import { cn } from '@utils/cn';

import { useNumberInputContext } from "./number-input-context";
import { ArrowDownIcons } from "./number-input-icons";
import type { NumberDecrementStepperProps } from "../types/types";

import "./number-input.css";

export const NumberDecrementStepper: React.FC<NumberDecrementStepperProps> = ({
  children,
  addClass,
  label = "Decrementar valor",
}) => {
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
      className={cn("c-number-input__button", addClass)}
    >
      {children || (
        <Icon>
          <ArrowDownIcons />
        </Icon>
      )}
    </button>
  );
};
