import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { NumberInput } from '../index'
import type { NumberInputProps } from '../types/types'

const setup = (props: Partial<NumberInputProps> = {}, fieldProps = {}) => {
  render(
    <NumberInput {...props}>
      <NumberInput.Field label="Cantidad" {...fieldProps} />
      <NumberInput.Stepper>
        <NumberInput.IncrementStepper />
        <NumberInput.DecrementStepper />
      </NumberInput.Stepper>
    </NumberInput>
  )
  return {
    input: screen.getByRole('spinbutton') as HTMLInputElement,
    increment: screen.getByRole('button', { name: 'Incrementar valor' }),
    decrement: screen.getByRole('button', { name: 'Decrementar valor' }),
  }
}

describe('NumberInput', () => {
  describe('estructura y accesibilidad', () => {
    it('renderiza un spinbutton accesible por su label', () => {
      render(
        <NumberInput>
          <NumberInput.Field label="Cantidad" />
          <NumberInput.Stepper>
            <NumberInput.IncrementStepper />
            <NumberInput.DecrementStepper />
          </NumberInput.Stepper>
        </NumberInput>
      )

      expect(screen.getByRole('spinbutton', { name: 'Cantidad' })).toBeInTheDocument()
    })

    it('muestra el valor por defecto 0 y los atributos aria-value*', () => {
      const { input } = setup({ min: 0, max: 10 })

      expect(input).toHaveValue('0')
      expect(input).toHaveAttribute('aria-valuenow', '0')
      expect(input).toHaveAttribute('aria-valuemin', '0')
      expect(input).toHaveAttribute('aria-valuemax', '10')
      expect(input).toHaveAttribute('aria-valuetext', '0')
    })

    it('usa defaultValue como valor inicial', () => {
      const { input } = setup({ defaultValue: 7 })

      expect(input).toHaveValue('7')
    })

    it('los steppers tienen aria-label por defecto y se pueden personalizar', () => {
      render(
        <NumberInput>
          <NumberInput.Field label="Cantidad" />
          <NumberInput.Stepper>
            <NumberInput.IncrementStepper label="Sumar uno" />
            <NumberInput.DecrementStepper label="Restar uno" />
          </NumberInput.Stepper>
        </NumberInput>
      )

      expect(screen.getByRole('button', { name: 'Sumar uno' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Restar uno' })).toBeInTheDocument()
    })

    it('los steppers no entran en el orden de tabulación', () => {
      const { increment, decrement } = setup()

      expect(increment).toHaveAttribute('tabindex', '-1')
      expect(decrement).toHaveAttribute('tabindex', '-1')
    })

    it('el label es solo para lectores de pantalla salvo que isLabelVisible sea true', () => {
      const { unmount } = render(
        <NumberInput>
          <NumberInput.Field label="Oculto" />
        </NumberInput>
      )
      expect(screen.getByText('Oculto')).toHaveClass('u-sr-only')
      unmount()

      render(
        <NumberInput>
          <NumberInput.Field label="Visible" isLabelVisible />
        </NumberInput>
      )
      expect(screen.getByText('Visible')).not.toHaveClass('u-sr-only')
    })

    it('no deja la clase literal "false" cuando el label es visible', () => {
      render(
        <NumberInput>
          <NumberInput.Field label="Visible" isLabelVisible />
        </NumberInput>
      )

      expect(screen.getByText('Visible')).not.toHaveClass('false')
      expect(screen.getByText('Visible')).not.toHaveAttribute('class')
    })

    it('usa el name por defecto y permite personalizarlo', () => {
      const { input } = setup()
      expect(input).toHaveAttribute('name', 'number-input-field')
    })

    it('agrega addClass al contenedor y al stepper', () => {
      const { container } = render(
        <NumberInput addClass="mi-input">
          <NumberInput.Field label="C" />
          <NumberInput.Stepper addClass="mi-stepper">
            <NumberInput.IncrementStepper addClass="mi-mas" />
            <NumberInput.DecrementStepper addClass="mi-menos" />
          </NumberInput.Stepper>
        </NumberInput>
      )

      expect(container.querySelector('.c-number-input')).toHaveClass('mi-input')
      expect(container.querySelector('.c-number-input__stepper')).toHaveClass('mi-stepper')
      expect(screen.getByRole('button', { name: 'Incrementar valor' })).toHaveClass('mi-mas')
      expect(screen.getByRole('button', { name: 'Decrementar valor' })).toHaveClass('mi-menos')
    })
  })

  describe('steppers', () => {
    it('incrementa y decrementa de a 1 por defecto', async () => {
      const { input, increment, decrement } = setup({ defaultValue: 5 })

      await userEvent.click(increment)
      await userEvent.click(increment)
      expect(input).toHaveValue('7')

      await userEvent.click(decrement)
      expect(input).toHaveValue('6')
    })

    it('respeta el valor de step', async () => {
      const { input, increment, decrement } = setup({ step: 5 })

      await userEvent.click(increment)
      expect(input).toHaveValue('5')

      await userEvent.click(decrement)
      await userEvent.click(decrement)
      expect(input).toHaveValue('-5')
    })

    it('sin keepWithinRange permite superar min y max', async () => {
      const { input, increment, decrement } = setup({ min: 0, max: 1, defaultValue: 1 })

      await userEvent.click(increment)
      expect(input).toHaveValue('2')
      expect(increment).toBeEnabled()

      await userEvent.click(decrement)
      await userEvent.click(decrement)
      await userEvent.click(decrement)
      expect(input).toHaveValue('-1')
      expect(decrement).toBeEnabled()
    })

    it('con keepWithinRange deshabilita el incremento al llegar al máximo', async () => {
      const { input, increment } = setup({ keepWithinRange: true, min: 0, max: 2, defaultValue: 1 })

      await userEvent.click(increment)

      expect(input).toHaveValue('2')
      expect(increment).toBeDisabled()
    })

    it('con keepWithinRange deshabilita el decremento al llegar al mínimo', async () => {
      const { input, decrement } = setup({ keepWithinRange: true, min: 0, max: 5, defaultValue: 1 })

      await userEvent.click(decrement)

      expect(input).toHaveValue('0')
      expect(decrement).toBeDisabled()
    })

    it('con keepWithinRange, si el valor ya superó el máximo, incrementar lo lleva al máximo', async () => {
      const { input, increment } = setup({ keepWithinRange: true, min: 0, max: 10 })
      fireEvent.change(input, { target: { value: '50' } })
      expect(input).toHaveValue('50')

      await userEvent.click(increment)

      expect(input).toHaveValue('10')
    })

    it('con keepWithinRange, si el valor está bajo el mínimo, decrementar lo lleva al mínimo', async () => {
      const { input, decrement } = setup({ keepWithinRange: true, min: 5, max: 10, defaultValue: 7 })
      fireEvent.change(input, { target: { value: '1' } })

      await userEvent.click(decrement)

      expect(input).toHaveValue('5')
    })

    it('con keepWithinRange nunca supera el máximo, aunque step no divida el rango', async () => {
      const { input, increment } = setup({ keepWithinRange: true, min: 0, max: 5, step: 2, defaultValue: 4 })

      await userEvent.click(increment)

      expect(input).toHaveValue('5')
    })

    it('con keepWithinRange nunca baja del mínimo, aunque step no divida el rango', async () => {
      const { input, decrement } = setup({ keepWithinRange: true, min: 0, max: 5, step: 2, defaultValue: 1 })

      await userEvent.click(decrement)

      expect(input).toHaveValue('0')
    })

    it('con keepWithinRange tampoco supera el máximo usando la flecha arriba del teclado', () => {
      const { input } = setup({ keepWithinRange: true, min: 0, max: 5, defaultValue: 5 })

      // El botón de incremento está deshabilitado en el máximo, pero el teclado no lo estaba.
      fireEvent.keyDown(input, { key: 'ArrowUp', keyCode: 38 })

      expect(input).toHaveValue('5')
    })
  })

  describe('escritura en el campo', () => {
    it('actualiza el valor al escribir un número', () => {
      const { input } = setup()

      fireEvent.change(input, { target: { value: '42' } })

      expect(input).toHaveValue('42')
      expect(input).toHaveAttribute('aria-valuenow', '42')
    })

    it('convierte texto no numérico en 0', () => {
      const { input } = setup({ defaultValue: 9 })

      fireEvent.change(input, { target: { value: 'abc' } })

      expect(input).toHaveValue('0')
    })

    it('al vaciar el campo vuelve a 0', async () => {
      const { input } = setup({ defaultValue: 9 })

      await userEvent.clear(input)

      expect(input).toHaveValue('0')
    })

    it('trunca los decimales al escribirlos (usa parseInt)', () => {
      const { input } = setup()

      fireEvent.change(input, { target: { value: '12.9' } })

      expect(input).toHaveValue('12')
    })
  })

  describe('teclado', () => {
    // El componente lee `event.keyCode`. `userEvent.keyboard` no lo rellena para las flechas,
    // Home y End (solo `key`/`code`), pero los navegadores sí, así que se simula con fireEvent.
    const KEY_CODES = { ArrowUp: 38, ArrowDown: 40, End: 35, Home: 36, Escape: 27 } as const
    const press = (input: HTMLElement, key: keyof typeof KEY_CODES) =>
      fireEvent.keyDown(input, { key, keyCode: KEY_CODES[key] })

    it('flecha arriba incrementa y flecha abajo decrementa', () => {
      const { input } = setup({ defaultValue: 5 })

      press(input, 'ArrowUp')
      press(input, 'ArrowUp')
      expect(input).toHaveValue('7')

      press(input, 'ArrowDown')
      expect(input).toHaveValue('6')
    })

    it('Home lleva al mínimo y End al máximo', () => {
      const { input } = setup({ min: 1, max: 20, defaultValue: 10 })

      press(input, 'Home')
      expect(input).toHaveValue('1')

      press(input, 'End')
      expect(input).toHaveValue('20')
    })

    it('ignora otras teclas', () => {
      const { input } = setup({ defaultValue: 3 })

      press(input, 'Escape')

      expect(input).toHaveValue('3')
    })
  })

  describe('onValue', () => {
    it('se llama con el valor inicial al montar', () => {
      const onValue = vi.fn()
      setup({ defaultValue: 4, onValue })

      expect(onValue).toHaveBeenCalledWith(4)
    })

    it('se llama con el nuevo valor después de cada cambio', async () => {
      const onValue = vi.fn()
      const { increment } = setup({ onValue })

      await userEvent.click(increment)
      await userEvent.click(increment)

      expect(onValue).toHaveBeenNthCalledWith(1, 0)
      expect(onValue).toHaveBeenLastCalledWith(2)
    })
  })
})
