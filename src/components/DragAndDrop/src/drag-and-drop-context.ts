import { createContext } from "../../../utils/createcontext";

type DragAndDropContextType = {
    listId: string[];
    propValidate: string;
    validate: boolean;
    isDragging: string | null;
    handleResetDnd: () => void;
}

export const [DragAndDropProvider, useDragAndDropContext] = createContext<DragAndDropContextType>({
    name: 'DragAndDropContext',
})

