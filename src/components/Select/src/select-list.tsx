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
  // Creamos una referencia mutable para el <ul> de la lista
  const ref = useRef<HTMLUListElement>(null);
  // Extraemos las props y el state del componente
  const { listBoxRef = ref, state, } = props;
  // Obtenemos las props de la lista usando useListBox
  const { listBoxProps } = useListBox(props, state, listBoxRef);

  return (
    <ul
      ref={listBoxRef}
      className='c-list-box'
      {...listBoxProps}
    >
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </ul>
  )
}

