import { createContext } from "../../../utils/createcontex";

type PanelContextType = {
    isOpen: string | null,
    validation: (uid: string) => boolean;
    handleToggle: (uid: string) => void;
    sectionsId: string[];
    getSectionIndex: (uid: string) => number;
    addSectionId: (uid: string) => void;
    type?: string;
}

export const [PanelProvider, usePanelContext] = createContext<PanelContextType>({
    name: 'PanelContext'
})