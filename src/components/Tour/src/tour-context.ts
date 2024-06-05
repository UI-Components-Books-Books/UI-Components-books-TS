
import { createContext } from "../../../utils/createcontext";
import { TourContextType } from "../types/types";

export const [TourProvider, useTourContext] = createContext<TourContextType>({
    name: 'TourContext',
})

