import { useButton } from "@react-aria/button"

import type { SelectButton } from "../types/types"

export const Button: React.FC<SelectButton> = (props) => {
    const ref = props.buttonRef
    const { buttonProps } = useButton(props, ref)

    return (
        <button ref={ref} className='c-select-button' {...buttonProps}>
            {props.children}
        </button>
    )
}