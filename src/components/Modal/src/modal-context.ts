import { createContext } from "../../../utils/createcontex";

type ModalContextType = {
    onClose: () => void;
    refModal: React.Ref<HTMLDivElement> | undefined;
}

export const [ModalProvider, useModalContext] = createContext<ModalContextType>({
    name: 'ModalContext',
})
