import { createContext } from "../../../utils/createcontext";
import type { AccordionContextType, AccordionItemContextType } from "../types/types";

export const [AccordionProvider, useAccordionContext] = createContext<AccordionContextType>({
    name: 'AccordionContext',
})

export const [AccordionItemProvider, useAccordionItemContext] = createContext<AccordionItemContextType>({
    name: 'AccordionItemContext',
})