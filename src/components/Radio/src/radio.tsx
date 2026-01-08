import { forwardRef, useId } from "react";

import { cn } from '@utils/cn';

import { RightIcon, WrongIcon } from "./radio-icons";
import type { RadioProps } from "../types/types";

import "./radio.css";

const ICON_STATE = Object.freeze({
  right: <RightIcon />,
  wrong: <WrongIcon />,
});

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { id, label = "Default radio label", state, addClass, ...props },
  ref
) {
  /**
   * Genera identificadores únicos para el componente.
   */
  const reactId: string = useId();
  const uid = id ?? reactId;

  return (
    <div
      className={cn("c-input-radio", addClass)}
      data-state={state}
    >
      <label
        htmlFor={uid}
        data-state={state}
        dangerouslySetInnerHTML={{ __html: label }}
        className="c-input-radio__label"
      ></label>

      <div className="c-input-radio__box">
        <input
          id={uid}
          ref={ref}
          type="radio"
          data-state={state}
          className="c-input-radio__check"
          {...props}
        />
        <div className="c-input-radio__icon">{state && ICON_STATE[state]}</div>
      </div>
    </div>
  );
});
