import { useId, forwardRef } from 'react'

import { cn } from '@utils/cn'

import { useNumberInputContext } from './number-input-context'
import type { NumberInputFieldProps } from '../types/types'

import './number-input.css'

/**
* Se crea un objeto que no se puede cambiar para
* almacenar el keyCode de las teclas up, down, end y home.
*/
const KEYCODE = Object.freeze({
  UP: 38,
  DOWN: 40,
  END: 35,
  HOME: 36
})

export const NumberInputField = forwardRef<HTMLInputElement, NumberInputFieldProps>(
  function NumberInputField({
    id,
    name = 'number-input-field',
    label = 'Default input number',
    pattern = '[0-9]*(.[0-9]+)?',
    addClass,
    isLabelVisible
  }, ref) {


    /**
     * Se obtienen las propiedades counter, onChangeValue, onIncrementValue, onDecrementValue,
     * min y max del contexto generado por el componente NumberInput.
     */
    const {
      counter,
      onChangeValue,
      onIncrementValue,
      onDecrementValue,
      min,
      max
    } = useNumberInputContext();


    /**
     * Se crea un ID para identificar el input.
     * Se usa `useId` para generar un identificador único, y si `id` está definido lo utiliza,
     * de lo contrario usa el identificador generado por `useId`.
     */
    const reactId = useId();
    const uid = id ?? reactId;


    /**
     * Función que se ejecuta al cambio del input.
     * Además envía el valor actual del input al método
     * `onChangeValue`.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - Evento del cambio del input.
     */
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      // Verifica si el valor es un número y no está vacío
      if (!isNaN(parseInt(value)) && value !== "") {
        onChangeValue(parseInt(value));
      } else {
        // Si el valor no es un número o está vacío, establece el valor en 0
        onChangeValue(0);
      }
    };


    /**
     * Función que se ejecuta con el evento `onKeyDown`,
     * utilizada para controlar el NumberInput con las teclas
     * cumpliendo con la accesibilidad del componente.
     *
     * @param {React.KeyboardEvent<HTMLInputElement>} e - Evento del teclado.
     */
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.keyCode || e.which) {
        case KEYCODE.UP:
          // Si se presiona la flecha hacia arriba, incrementa el valor
          onIncrementValue();
          break;

        case KEYCODE.DOWN:
          // Si se presiona la flecha hacia abajo, decrementa el valor
          onDecrementValue();
          break;

        case KEYCODE.END:
          // Si se presiona la tecla End, establece el valor en el máximo
          onChangeValue(max);
          break;

        case KEYCODE.HOME:
          // Si se presiona la tecla Home, establece el valor en el mínimo
          onChangeValue(min);
          break;

        default:
          return null;
      }
    };


    return (
      <label
        htmlFor={uid}
        className={cn('c-number-input__label', addClass)}
      >
        <span className={`${!isLabelVisible && 'u-sr-only'}`}> {label} </span>
        <input
          id={uid}
          ref={ref}
          type='text'
          name={name}
          role='spinbutton'
          inputMode='decimal'
          pattern={pattern}
          autoCorrect='off'
          autoComplete='off'
          className="c-number-input__input"
          onChange={onChange}
          onKeyDown={onKeyDown}
          {...(counter || counter === 0
            ? {
              value: counter,
              'aria-valuemax': max,
              'aria-valuemin': min,
              'aria-valuenow': counter,
              'aria-valuetext': `${counter}`
            }
            : { value: '' })}
        />
      </label>
    )
  }
)

