import { useState, useEffect } from 'react'

import classNames from 'classnames'

import { NumberDecrementStepper } from './number-decrement-stepper';
import { NumberIncrementStepper } from './number-increment-stepper';
import { NumberInputProvider } from './number-input-context'
import { NumberInputField } from './number-input-field';
import { NumberInputStepper } from './number-input-stepper';

import './number-input.css'

interface Props {
  addClass?: string,
  max?: number,
  min?: number,
  defaultValue?: number,
  step?: number,
  onValue?: (counter: number) => void,
  keepWithinRange?: boolean,
  children: JSX.Element | JSX.Element[]
}

type subComponents = {
  IncrementStepper: typeof NumberIncrementStepper,
  DecrementStepper: typeof NumberDecrementStepper,
  Field: typeof NumberInputField,
  Stepper: typeof NumberInputStepper
}

const NumberInput: React.FC<Props> & subComponents = ({
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
    if (keepWithinRange && counter > max) {
      // Si se debe mantener dentro del rango y el contador supera el máximo, establece el contador en el máximo.
      return setCounter(max);
    }
    // Incrementa el contador por el valor de `step`
    setCounter((value) => value + step);
  };


  /**
    * Función que se usa para disminuir el valor del input.
    * El valor a decrementar depende del valor del `step`.
    */
  const onDecrementValue = () => {
    if (keepWithinRange && counter < min) {
      // Si se debe mantener dentro del rango y el contador es menor que el mínimo, establece el contador en el mínimo.
      return setCounter(min);
    }
    // Decrementa el contador por el valor de `step`
    setCounter((value) => value - step);
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
      <div className={classNames('c-number-input', { [addClass ?? ""]: addClass })}>{children}</div>
    </NumberInputProvider>
  )
}

NumberInput.IncrementStepper = NumberIncrementStepper;
NumberInput.DecrementStepper = NumberDecrementStepper;
NumberInput.Field = NumberInputField;
NumberInput.Stepper = NumberInputStepper

export { NumberInput }