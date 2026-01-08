import { forwardRef } from "react";

import { cn } from '@utils/cn';

import { RowProps } from "../types/types";

import "./row.css";


export const Row = forwardRef<HTMLDivElement, RowProps>(function Row(
  { addClass, justifyContent, alignItems, flexDirection, ...props },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={cn("c-row", {
        [addClass ?? ""]: addClass,
        [`c-row--align-items-${alignItems}`]: alignItems,
        [`c-row--justify-content-${justifyContent}`]: justifyContent,
        [`c-row--flex-direction-${flexDirection}`]: flexDirection,
      })}
      {...props}
    />
  );
});
