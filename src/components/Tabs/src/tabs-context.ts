import { createContext } from "@utils/createcontext";

import type { TabsContextType, TabListContexType } from "../types/types";

export const [TabsProvider, useTabsContext] = createContext<TabsContextType>({
    name: 'TabsContext',
})

export const [TabListProvider, useTabListContext] = createContext<TabListContexType>({
    name: 'TabListContext',
})


