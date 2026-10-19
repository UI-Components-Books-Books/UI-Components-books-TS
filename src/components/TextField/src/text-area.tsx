import { forwardRef } from "react";

import { cn } from '@utils/cn';

import { Field } from "./field";
import type { TextAreaProps } from "../types/types";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      id,
      label,
      isLabelVisible = true,
      hint,
      error,
      state = "normal",
      messages,
      size = "normal",
      rows = 4,
      addClass,
      className,
      required,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref
  ) {
    return (
      <Field
        id={id}
        label={label}
        isLabelVisible={isLabelVisible}
        hint={hint}
        error={error}
        state={state}
        messages={messages}
        size={size}
        required={required}
        ariaDescribedBy={ariaDescribedBy}
        ariaInvalid={ariaInvalid}
        wrapperClass={cn("c-text-field--area", addClass)}
      >
        {(control) => (
          <textarea
            {...props}
            {...control}
            ref={ref}
            rows={rows}
            className={cn("c-text-field__input", className)}
          />
        )}
      </Field>
    );
  }
);
