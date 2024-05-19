import { useButton } from "@react-aria/button"
import type { AriaButtonOptions } from "@react-aria/button"
interface Props extends AriaButtonOptions<'button'> {
    buttonRef: React.RefObject<HTMLButtonElement>;
    children: JSX.Element[];
}

export const Button: React.FC<Props> = (props) => {
    const ref = props.buttonRef
    const { buttonProps } = useButton(props, ref)

    return (
        <button ref={ref} className='c-select-button' {...buttonProps}>
            {props.children}
        </button>
    )
}