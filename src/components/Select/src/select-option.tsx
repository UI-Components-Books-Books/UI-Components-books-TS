import { useRef } from "react"

import { useOption } from "@react-aria/listbox"
import type { ListState } from "react-stately";
import type { Node } from "react-stately";

interface Props {
  state: ListState<object>;
  item: Node<object>
}

export const Option: React.FC<Props>  = ({ item, state }) => {
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
  