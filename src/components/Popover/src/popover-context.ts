import { createContext } from "../../../utils/createcontext";

type PopoverContextType = {
    isPopoverOpen: boolean, 
    togglePopover: () => void,
    setPopoverButtonRef: (button: HTMLButtonElement) => void, 
    popoverButtonRef: React.MutableRefObject<HTMLButtonElement | undefined>
}

export const [PopoverProvider, usePopoverContext] = createContext<PopoverContextType>({
    name: 'PopoverContext',
})

