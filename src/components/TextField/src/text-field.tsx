import { forwardRef } from "react";

import { cn } from '@utils/cn';

import { Field } from "./field";
import type { TextFieldProps } from "../types/types";

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
        wrapperClass={cn({ "c-text-field--inline": inline }, addClass)}
      >
        {(control) => (
          <input
            {...props}
            {...control}
            ref={ref}
            type={type}
            className={cn("c-text-field__input", className)}
          />
        )}
      </Field>
    );
  }
);
