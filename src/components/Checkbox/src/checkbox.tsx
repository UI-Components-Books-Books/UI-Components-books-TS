import { forwardRef, useId, useMemo, useRef } from "react";

import { cn } from '@utils/cn';
import { mergeRefs } from '@utils/mergeRefs';
import { DEFAULT_RESULT_MESSAGES } from '@utils/resultMessages';
import { useIsChecked } from '@utils/useIsChecked';

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

    // El icono del resultado solo se dibuja con la opción marcada, así que el resultado también
    // se anuncia solo entonces: quien usa un lector de pantalla recibe lo mismo que quien ve, y no
    // se revela cuáles de las opciones sin marcar eran correctas.
    const inputRef = useRef<HTMLInputElement>(null);
    const setRefs = useMemo(() => mergeRefs(inputRef, ref), [ref]);
    const isChecked = useIsChecked(inputRef, props.checked ?? props.defaultChecked ?? false);

    const stateText =
      state !== "normal" && isChecked
        ? (messages?.[state] ?? DEFAULT_RESULT_MESSAGES[state])
        : undefined;

    const describedBy =
      [ariaDescribedBy, stateText ? stateId : undefined].filter(Boolean).join(" ") || undefined;

    return (
      <div
        className={cn("c-input-check", addClass)}
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
            ref={setRefs}
            type="checkbox"
            data-state={state}
            className="c-input-check__check"
            aria-describedby={describedBy}
            {...props}
          />
          <div className="c-input-check__icon">{ICON_STATE[state]}</div>
        </div>

        {stateText && (
          <span id={stateId} className="u-sr-only">
            {stateText}
          </span>
        )}
      </div>
    );
  }
);
