import { forwardRef, useId } from "react";

import { cn } from '@utils/cn';

import { RightIcon, WrongIcon } from "./text-field-icons";
import type { TextFieldMessages, TextFieldProps } from "../types/types";

import "./text-field.css";

const DEFAULT_MESSAGES: Required<TextFieldMessages> = Object.freeze({
  right: "Correcto",
  wrong: "Incorrecto",
});

const ICON_STATE = Object.freeze({
  right: <RightIcon />,
  wrong: <WrongIcon />,
});

/**
 * Indica si un `ReactNode` tiene algo que mostrar. `0` cuenta como contenido; `false`, `null`,
 * `undefined` y el texto vacío no.
 */
const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      id,
      label,
      isLabelVisible = true,
      hint,
      error,
      state = "normal",
      messages,
      type = "text",
      size = "normal",
      inline = false,
      addClass,
      className,
      required,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref
  ) {
    /**
     * Genera identificadores únicos para el componente. Los de la ayuda, el error y el resultado se
     * derivan del id del campo, así no se repiten si hay más de un campo en la página.
     */
    const reactId: string = useId();
    const uid = id ?? reactId;
    const hintId = `${uid}-hint`;
    const errorId = `${uid}-error`;
    const stateId = `${uid}-state`;

    const hasHint = hasContent(hint);
    const hasError = hasContent(error);

    // Un error o un resultado incorrecto marcan el campo como inválido y se ven igual.
    const isInvalid = hasError || state === "wrong";
    const visualState = isInvalid ? "wrong" : state;

    const stateText =
      state === "normal" ? undefined : (messages?.[state] ?? DEFAULT_MESSAGES[state]);

    const describedBy =
      [
        ariaDescribedBy,
        hasHint ? hintId : undefined,
        hasError ? errorId : undefined,
        stateText ? stateId : undefined,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <span
        className={cn(
          `c-text-field c-text-field--${size}`,
          { "c-text-field--inline": inline },
          addClass
        )}
        data-state={visualState}
      >
        <label
          htmlFor={uid}
          className={cn("c-text-field__label", { "u-sr-only": !isLabelVisible })}
        >
          {label}
          {required && (
            <span className="c-text-field__required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>

        {hasHint && (
          <span id={hintId} className="c-text-field__hint">
            {hint}
          </span>
        )}

        <span className="c-text-field__control">
          <input
            {...props}
            id={uid}
            ref={ref}
            type={type}
            required={required}
            aria-invalid={isInvalid ? true : ariaInvalid}
            aria-describedby={describedBy}
            className={cn("c-text-field__input", className)}
          />
          {visualState !== "normal" && (
            <span className="c-text-field__icon">{ICON_STATE[visualState]}</span>
          )}
        </span>

        {hasError && (
          <span id={errorId} className="c-text-field__error">
            {error}
          </span>
        )}

        {stateText && (
          <span id={stateId} className="u-sr-only">
            {stateText}
          </span>
        )}
      </span>
    );
  }
);
