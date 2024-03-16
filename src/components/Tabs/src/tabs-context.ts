import { createContext } from "../../../utils/createcontext";

type TabsContextType = {
    isOpen: string | null;
    handleToggle: (value: string) => void;
    addTabIndex: (uid: string) => void;
}



export const [TabsProvider, useTabsContext] = createContext<TabsContextType>({
    name: 'TabsContext',
})

