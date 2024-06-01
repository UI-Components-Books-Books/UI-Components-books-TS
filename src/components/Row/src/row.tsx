import { forwardRef } from "react";

import "./row.css";
import classnames from "classnames";

interface Props extends React.HTMLProps<HTMLDivElement> {
  addClass?: string;
  justifyContent?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "center" | "flex-start" | "flex-end" | "baseline" | "stretch";
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
}

export const Row = forwardRef<HTMLDivElement, Props>(function Row(
  { addClass, justifyContent, alignItems, flexDirection, ...props },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={classnames("c-row", {
        [addClass ?? ""]: addClass,
        [`c-row--align-items-${alignItems}`]: alignItems,
        [`c-row--justify-content-${justifyContent}`]: justifyContent,
        [`c-row--flex-direction-${flexDirection}`]: flexDirection,
      })}
      {...props}
    />
  );
});
