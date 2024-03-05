import { createContext } from "../../../utils/createcontex";

type AccordionContextType = {
    isOpen: string[];
    handleToggle: (value: string) => void;
    addAccordionId: (uid: string) => void;
}

type AccordionItemContextType = {
    uid: string,
    isExpanded: boolean,
    handleExpanded: () => void
}

export const [AccordionProvider, useAccordionContext] = createContext<AccordionContextType>({
    name: 'AccordionContext',
})

export const [AccordionItemProvider, useAccordionItemContext] = createContext<AccordionItemContextType>({
    name: 'AccordionItemContext',
})