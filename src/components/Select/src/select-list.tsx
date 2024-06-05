import { useRef } from "react"

import { useListBox } from "@react-aria/listbox"

import { Option } from "./select-option";
import type { SelectListBoxProps } from "../types/types";

import './select.css'

export const ListBox: React.FC<SelectListBoxProps> = (props) => {
  const ref = useRef<HTMLUListElement>(null);
  const { listBoxRef = ref, state, } = props;

  const { listBoxProps } = useListBox(props, state, listBoxRef);

  return (
    <ul
      ref={listBoxRef}
      className='c-select-list'
      {...listBoxProps}
    >
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </ul>
  )
}

