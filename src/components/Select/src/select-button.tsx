import { useButton } from "@react-aria/button"


export const Button = (props) => {
    const ref = props.buttonRef
    const { buttonProps } = useButton(props, ref)

    return (
        <button ref={ref} className='c-select__button' {...buttonProps}>
            {props.children}
        </button>
    )
}