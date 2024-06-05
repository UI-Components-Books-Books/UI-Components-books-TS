import { useRef } from "react"

import { useOption } from "@react-aria/listbox"

import type { SelectOptionProps } from "../types/types";

export const Option: React.FC<SelectOptionProps>  = ({ item, state }) => {
    const ref = useRef<HTMLLIElement>(null)
    const { optionProps, isSelected, isFocused, isDisabled } = useOption(
      { key: item.key },
      state,
      ref
    )
  
    return (
      <li
        ref={ref}
        data-option-focus={isFocused}
        data-option-disabled={isDisabled}
        data-option-select={isSelected}
        {...optionProps}
      >
        {item.rendered}
        
      </li>
    )
  }
  