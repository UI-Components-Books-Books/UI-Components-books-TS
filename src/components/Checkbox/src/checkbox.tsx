import { forwardRef, useId } from "react";

import classNames from "classnames";

import { NormalIcon, RightIcon, WrongIcon } from "./checkbox-icons";
import type { CheckBoxProps } from "../types/types";

import "./checkbox.css";

const ICON_STATE = Object.freeze({
  normal: <NormalIcon />,
  right: <RightIcon />,
  wrong: <WrongIcon />,
});

export const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  function CheckBox(
    {
      id,
      label = "Default checkbox label",
      state = "normal",
      addClass,
      ...props
    },
    ref
  ) {
    /**
     * Genera identificadores únicos para el componente.
     */
    const reactId: string = useId();
    const uid = id ?? reactId;

    return (
      <div
        className={classNames("c-input-check", { [addClass ?? ""]: addClass })}
        data-state={state}
      >
        <label
          htmlFor={uid}
          data-state={state}
          className="c-input-check__label"
          dangerouslySetInnerHTML={{ __html: label }}
        >
        </label>

        <div className="c-input-check__box">
          <input
            id={uid}
            ref={ref}
            type="checkbox"
            data-state={state}
            className="c-input-check__check"
            {...props}
          />
          <div className="c-input-check__icon">{ICON_STATE[state]}</div>
        </div>
      </div>
    );
  }
);
