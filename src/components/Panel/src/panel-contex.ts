import { createContext } from "@utils/createcontext";

import type { PanelContextType } from "../types/types";

export const [PanelProvider, usePanelContext] = createContext<PanelContextType>({
    name: 'PanelContext'
})