import type { MethodsType, stepType } from "./tour-types";
import { createContext } from "../../../utils/createcontext";

interface TourContextType extends stepType {
    isOpen: boolean;
    lastId: number;
    methods: MethodsType;
}

export const [TourProvider, useTourContext] = createContext<TourContextType>({
    name: 'TourContext',
})

