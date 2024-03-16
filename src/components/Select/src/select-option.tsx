import { useRef } from "react"

import { useOption } from "@react-aria/listbox"
import classNames from "classnames"
import type { ListState } from "react-stately";
import type { Node } from "react-stately";

import './select.css'

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
        className={classNames('c-option', {
          'c-option--focus': isFocused,
          'c-option--disabled': isDisabled
        })}
        {...optionProps}
      >
        {item.rendered}
        {isSelected ? <span>✓</span> : null}
      </li>
    )
  }
  