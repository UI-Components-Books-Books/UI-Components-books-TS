export { Tabs } from "./src/tabs";

export type {
    TabsProps,
    TabsSubComponents,
    TabsContextType,
    TabListContexType,
    TabProps,
    TabPanelsProps,
    TabPanelProps,
    TabListProps
} from './types/types'

export {
    TabsProvider,
    useTabsContext,
    TabListProvider,
    useTabListContext
} from './src/tabs-context'