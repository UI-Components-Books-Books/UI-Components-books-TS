import { createContext } from "../../../utils/createcontext";
import type { PopoverContextType } from "../types/types";

export const [PopoverProvider, usePopoverContext] = createContext<PopoverContextType>({
    name: 'PopoverContext',
})

