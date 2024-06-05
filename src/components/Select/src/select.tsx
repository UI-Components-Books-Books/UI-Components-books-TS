import { useRef } from "react"

import { useSelect } from "@react-aria/select"
import { HiddenSelect } from "@react-aria/select"
import classNames from 'classnames';
import { useSelectState } from "react-stately"

import { Button } from "./select-button";
import { ArrowDownIcon } from "./select-icons"
import { ListBox } from "./select-list"
import { Popover } from "./select-popover"
import { Icon } from "../../Icon"
import type { SelectProps } from "../types/types";

import './select.css'

const Select: React.FC<SelectProps> = (props) => {
  const { label, name, placeholder = 'Seleccionar', addClass } = props

  // Create state based on the incoming props
  const state = useSelectState({ ...props })

  // Get props for child elements from useSelect
  const ref = useRef(null)
  const { labelProps, triggerProps, valueProps, menuProps } = useSelect(
    props,
    state,
    ref
  )

  return (
    <div className={classNames('c-select', { [addClass ?? ""]: addClass })}>
      <div {...labelProps} className='u-sr-only'>
        {label}
      </div>
      <HiddenSelect state={state} triggerRef={ref} label={label} name={name} />

      <Button buttonRef={ref} {...triggerProps}>
        <span className='c-select-button__text' {...valueProps}>
          {state.selectedItem ? state.selectedItem.rendered : placeholder}
        </span>

        <span className="c-select-button__icon">
          <Icon>
            <ArrowDownIcon />
          </Icon>
        </span>
      </Button>

      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement='bottom start'>
          <ListBox {...menuProps} state={state} />
        </Popover>
      )}
    </div>
  )
}



export { Select }