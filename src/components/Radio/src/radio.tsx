import { forwardRef, useId, useMemo, useRef } from "react";

import { cn } from '@utils/cn';
import { mergeRefs } from '@utils/mergeRefs';
import { DEFAULT_RESULT_MESSAGES } from '@utils/resultMessages';
import { useIsChecked } from '@utils/useIsChecked';

import { RightIcon, WrongIcon } from "./radio-icons";
import type { RadioProps } from "../types/types";

import "./radio.css";

const ICON_STATE = Object.freeze({
  right: <RightIcon />,
  wrong: <WrongIcon />,
});

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    id,
    label = "Default radio label",
    state,
    messages,
    addClass,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref
) {
  /**
   * Genera identificadores únicos para el componente.
   */
  const reactId: string = useId();
  const uid = id ?? reactId;
  const stateId = `${uid}-state`;

  // El icono del resultado solo se dibuja con la opción marcada, así que el resultado también se
  // anuncia solo entonces: quien usa un lector de pantalla recibe lo mismo que quien ve, y no se
  // revela cuál de las opciones sin marcar era la correcta.
  const inputRef = useRef<HTMLInputElement>(null);
  const setRefs = useMemo(() => mergeRefs(inputRef, ref), [ref]);
  const isChecked = useIsChecked(inputRef, props.checked ?? props.defaultChecked ?? false);

  const stateText =
    state && isChecked ? (messages?.[state] ?? DEFAULT_RESULT_MESSAGES[state]) : undefined;

  const describedBy =
    [ariaDescribedBy, stateText ? stateId : undefined].filter(Boolean).join(" ") || undefined;

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
          ref={setRefs}
          type="radio"
          data-state={state}
          className="c-input-radio__check"
          aria-describedby={describedBy}
          {...props}
        />
        <div className="c-input-radio__icon">{state && ICON_STATE[state]}</div>
      </div>

      {stateText && (
        <span id={stateId} className="u-sr-only">
          {stateText}
        </span>
      )}
    </div>
  );
});
