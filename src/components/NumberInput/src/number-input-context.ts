import { createContext } from "../../../utils/createcontext";

type NumberInputContextType = {
    counter: number;
    min: number;
    max: number;
    validate: (prop: number) => boolean;
    onChangeValue: (value: number) => void;
    onIncrementValue: () => void;
    onDecrementValue: () => void;
}


export const [NumberInputProvider, useNumberInputContext] = createContext<NumberInputContextType>({
    name: 'NumberInputContext',
})

