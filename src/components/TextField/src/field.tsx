import { useId } from "react";

import { cn } from '@utils/cn';

import { RightIcon, WrongIcon } from "./text-field-icons";
import type { TextFieldBaseProps } from "../types/types";

import "./text-field.css";

const DEFAULT_MESSAGES = Object.freeze({
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

/**
 * Atributos que el control (`<input>` o `<textarea>`) debe llevar para quedar enlazado con su
 * etiqueta, su ayuda, su error y su resultado.
 */
export interface FieldControlProps {
  id: string;
  required?: boolean;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
}

interface FieldProps extends Omit<TextFieldBaseProps, "isLabelVisible" | "state" | "size"> {
  isLabelVisible: boolean;
  state: NonNullable<TextFieldBaseProps["state"]>;
  size: NonNullable<TextFieldBaseProps["size"]>;
  required?: boolean;
  /** `aria-describedby` y `aria-invalid` que pasó el consumidor: se combinan con los propios. */
  ariaDescribedBy?: string;
  ariaInvalid?: React.AriaAttributes["aria-invalid"];
  /** Clases del contenedor que dependen del tipo de control (`c-text-field--inline`, etc.). */
  wrapperClass?: string;
  /** Pinta el control con los atributos que lo enlazan al resto del campo. */
  children: (control: FieldControlProps) => React.ReactNode;
}

/**
 * Estructura común de `TextField` y `TextArea`: etiqueta, ayuda, control, error y resultado, con
 * los ids derivados y los `aria-*` que los enlazan.
 */
export const Field = ({
  id,
  label,
  isLabelVisible,
  hint,
  error,
  state,
  messages,
  size,
  required,
  ariaDescribedBy,
  ariaInvalid,
  wrapperClass,
  children,
}: FieldProps) => {
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
      className={cn(`c-text-field c-text-field--${size}`, wrapperClass)}
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
        {children({
          id: uid,
          required,
          "aria-invalid": isInvalid ? true : ariaInvalid,
          "aria-describedby": describedBy,
        })}
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
};
