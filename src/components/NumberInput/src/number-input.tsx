import { useState, useEffect } from 'react'

import { cn } from '@utils/cn'

import { NumberDecrementStepper } from './number-decrement-stepper';
import { NumberIncrementStepper } from './number-increment-stepper';
import { NumberInputProvider } from './number-input-context'
import { NumberInputField } from './number-input-field';
import { NumberInputStepper } from './number-input-stepper';
import type { NumberInputProps, NumberInputSubComponents } from '../types/types';

import './number-input.css'

const NumberInput: React.FC<NumberInputProps> & NumberInputSubComponents = ({
  children,
  addClass,
  keepWithinRange = false,
  defaultValue = 0,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onValue
}) => {
  // Utilizado para controlar el valor del input.
  const [counter, setCounter] = useState<number>(defaultValue)


  /**
   * Función que se usa para incrementar el valor del input.
   * El valor a incrementar depende del valor del `step`.
   */
  const onIncrementValue = () => {
    // Incrementa el contador por el valor de `step`. Si se debe mantener dentro del rango, el valor
    // nunca supera el máximo: ni cuando el siguiente paso se pasaría (p. ej. 4 + 2 con max = 5),
    // ni cuando el contador ya lo superaba (por ejemplo porque se escribió a mano).
    setCounter((value) => (keepWithinRange ? Math.min(value + step, max) : value + step));
  };


  /**
    * Función que se usa para disminuir el valor del input.
    * El valor a decrementar depende del valor del `step`.
    */
  const onDecrementValue = () => {
    // Decrementa el contador por el valor de `step`. Si se debe mantener dentro del rango, el valor
    // nunca baja del mínimo (mismo criterio que el incremento con el máximo).
    setCounter((value) => (keepWithinRange ? Math.max(value - step, min) : value - step));
  };


  /**
    * Función callback que se utiliza para cambiar el valor del input
    * a partir del valor pasado como argumento.
    *
    * @param {number} value - Valor del contador
    */
  const onChangeValue = (value: number) => setCounter(value);


  /**
    * Función que se utiliza para comprobar si el valor de las propiedades `min` o `max` es igual al valor del contador.
    *
    * @param {number} prop - Valor de `min` o `max` para comparar con el contador
    * @returns {boolean} - Retorna un valor booleano que indica si `counter` es igual a `prop`
    */
  const validate = (prop: number): boolean => keepWithinRange && counter === prop;


  useEffect(() => {
    // Si existe la propiedad `onValue`, llama a `onValue` con el valor actual de `counter`
    if (onValue) {
      onValue(counter);
    }
  }, [counter, onValue]);


  return (
    <NumberInputProvider
      value={{
        counter,
        min,
        max,
        validate,
        onChangeValue,
        onIncrementValue,
        onDecrementValue
      }}
    >
      <div className={cn('c-number-input', addClass)}>{children}</div>
    </NumberInputProvider>
  )
}

NumberInput.IncrementStepper = NumberIncrementStepper;
NumberInput.DecrementStepper = NumberDecrementStepper;
NumberInput.Field = NumberInputField;
NumberInput.Stepper = NumberInputStepper

export { NumberInput }