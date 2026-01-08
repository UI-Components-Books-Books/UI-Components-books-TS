import { createContext } from "@utils/createcontext";

import { ModalContextType } from "../types/types";

export const [ModalProvider, useModalContext] = createContext<ModalContextType>({
    name: 'ModalContext',
})
