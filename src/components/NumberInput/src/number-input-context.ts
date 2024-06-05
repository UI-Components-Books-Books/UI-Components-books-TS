import { createContext } from "../../../utils/createcontext";
import type { NumberInputContextType } from "../types/types";

export const [NumberInputProvider, useNumberInputContext] = createContext<NumberInputContextType>({
    name: 'NumberInputContext',
})

