import { useRef } from "react"

import { Overlay } from "@react-aria/overlays"
import { DismissButton } from "@react-aria/overlays"
import { usePopover } from "@react-aria/overlays"
import type { AriaPopoverProps } from "@react-aria/overlays"
import type { OverlayTriggerState } from "react-stately"

import './select.css'

interface Props extends Omit<AriaPopoverProps, 'popoverRef'> {
    children: React.ReactNode;
    state: OverlayTriggerState;
}

export const Popover: React.FC<Props> = ({ state, children, ...props }) => {
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
                {...popoverProps}
                ref={popoverRef}
                className="c-popover"
                style={{
                    ...popoverProps.style
                }}
            >
                {children}
                <DismissButton onDismiss={state.close} />
            </div>
        </Overlay>
    )
}