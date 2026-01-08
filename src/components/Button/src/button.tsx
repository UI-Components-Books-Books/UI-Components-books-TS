import { forwardRef } from "react";

import { cn } from '@utils/cn';

import type { ButtonProps } from "../types/types";

import "./button.css";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      label,
      size = "normal",
      variant = "primary",
      hasAriaLabel = false,
      children,
      addClass,
      ...others
    } = props;

    return (
      <button
        ref={ref}
        className={cn(
          "c-button",
          `c-button--${variant}`,
          `c-button--${size}`,
          addClass
        )}
        {...(hasAriaLabel && { "aria-label": `${label}` })}
        {...others}
      >
        {children}
        {!hasAriaLabel ? label : null}
      </button>
    );
  }
);
