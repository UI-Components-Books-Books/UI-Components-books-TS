import { useRef } from "react"

import { Overlay } from "@react-aria/overlays"
import { DismissButton } from "@react-aria/overlays"
import { usePopover } from "@react-aria/overlays"

import type { SelectPopoverProps } from '../types/types';

import './select.css'

export const Popover: React.FC<SelectPopoverProps> = ({ state, children, ...props }) => {
    const popoverRef = useRef<HTMLDivElement>(null)
    const { popoverProps, underlayProps } = usePopover(
        {
            ...props,
            popoverRef
        },
        state
    )

    return (
        <Overlay>
            <div {...underlayProps} style={{ position: 'fixed', inset: 0 }} />
            <div
                ref={popoverRef}
                className="c-select-popover"
                style={{
                    ...popoverProps.style
                }}
                {...popoverProps}
            >
                {children}
                <DismissButton onDismiss={state.close} />
            </div>
        </Overlay>
    )
}