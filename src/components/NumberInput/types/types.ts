import { NumberDecrementStepper } from '../src/number-decrement-stepper';
import { NumberIncrementStepper } from '../src/number-increment-stepper';
import { NumberInputField } from '../src/number-input-field';
import { NumberInputStepper } from '../src/number-input-stepper';

/**
 * Propiedades para el componente de entrada numérica.
 */
export interface NumberInputProps {
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;

    /**
     * Valor máximo permitido.
     */
    max?: number;

    /**
     * Valor mínimo permitido.
     */
    min?: number;

    /**
     * Valor por defecto.
     */
    defaultValue?: number;

    /**
     * Incremento de valor para cada paso.
     */
    step?: number;

    /**
     * Función que se llama cuando cambia el valor.
     */
    onValue?: (counter: number) => void;

    /**
     * Indica si el valor debe mantenerse dentro del rango definido.
     */
    keepWithinRange?: boolean;

    /**
     * Elementos hijos que se mostrarán dentro del componente.
     */
    children: JSX.Element | JSX.Element[];
}


/**
 * Submódulos para el componente de entrada numérica.
 */
export type NumberInputSubComponents = {
    /**
     * Componente para incrementar el valor.
     */
    IncrementStepper: typeof NumberIncrementStepper;

    /**
     * Componente para decrementar el valor.
     */
    DecrementStepper: typeof NumberDecrementStepper;

    /**
     * Componente para el campo de entrada numérica.
     */
    Field: typeof NumberInputField;

    /**
     * Componente para el stepper de entrada numérica.
     */
    Stepper: typeof NumberInputStepper;
}


/**
 * Propiedades para el componente de stepper de entrada numérica.
 */
export interface NumberInputStepperProps {
    /**
     * Elementos hijos que se mostrarán dentro del stepper.
     */
    children: JSX.Element[];

    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
}


/**
 * Propiedades para el componente de campo de entrada numérica.
 */
export interface NumberInputFieldProps {
    /**
     * Identificador opcional para el campo.
     */
    id?: string;

    /**
     * Nombre del campo.
     */
    name?: string;

    /**
     * Etiqueta del campo.
     */
    label: string;

    /**
     * Patrón de validación para el valor del campo.
     */
    pattern?: string;

    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;

    /**
     * Indica si la etiqueta es visible.
     */
    isLabelVisible?: boolean;
}


/**
 * Contexto para el componente de entrada numérica.
 */
export type NumberInputContextType = {
    /**
     * Valor actual del contador.
     */
    counter: number;
    
    /**
     * Valor mínimo permitido.
     */
    min: number;
    
    /**
     * Valor máximo permitido.
     */
    max: number;
    
    /**
     * Función para validar el valor del contador.
     */
    validate: (prop: number) => boolean;
    
    /**
     * Función que se llama cuando cambia el valor.
     */
    onChangeValue: (value: number) => void;
    
    /**
     * Función que se llama para incrementar el valor.
     */
    onIncrementValue: () => void;
    
    /**
     * Función que se llama para decrementar el valor.
     */
    onDecrementValue: () => void;
}


/**
 * Propiedades para el componente de stepper de incremento.
 */
export interface NumberIncrementStepperProps {
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Etiqueta del stepper de incremento.
     */
    label?: string;
    
    /**
     * Elementos hijos que se mostrarán dentro del stepper de incremento.
     */
    children?: React.ReactNode;
}


/**
 * Propiedades para el componente de stepper de decremento.
 */
export interface NumberDecrementStepperProps {
    /**
     * Clase adicional para aplicar estilos personalizados.
     */
    addClass?: string;
    
    /**
     * Etiqueta del stepper de decremento.
     */
    label?: string;
    
    /**
     * Elementos hijos que se mostrarán dentro del stepper de decremento.
     */
    children?: React.ReactNode;
}
