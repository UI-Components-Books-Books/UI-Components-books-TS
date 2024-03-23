import { createContext } from "../../../utils/createcontext";

type TabsContextType = {
    isOpen: number | null;
    handleToggle: (value: number) => void;
    handleValidation: (value: number) => boolean;
}

type TabListContexType = {
    addNewTabRef: (ref: HTMLButtonElement) => void;
    handleNavigationFocus: (e: React.KeyboardEvent) => void;
}

export const [TabsProvider, useTabsContext] = createContext<TabsContextType>({
    name: 'TabsContext',
})

export const [TabListProvider, useTabListContext] = createContext<TabListContexType>({
    name: 'TabListContext',
})


