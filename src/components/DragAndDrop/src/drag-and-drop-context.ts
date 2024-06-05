import { createContext } from "../../../utils/createcontext";
import type { DragAndDropContextType } from "../types/types";

export const [DragAndDropProvider, useDragAndDropContext] = createContext<DragAndDropContextType>({
    name: 'DragAndDropContext',
})

