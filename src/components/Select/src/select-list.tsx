import { useRef } from "react"

import { useListBox } from "@react-aria/listbox"
import type { AriaListBoxOptions } from "@react-aria/listbox"
import type { ListState } from "react-stately";

import { Option } from "./select-option";

import './select.css'

interface Props extends AriaListBoxOptions<unknown> {
  state: ListState<object>;
  listBoxRef?: React.MutableRefObject<HTMLUListElement | null>;
}

export const ListBox: React.FC<Props> = (props) => {
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

