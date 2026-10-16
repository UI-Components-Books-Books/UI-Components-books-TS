import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Toggletip } from '../index'

const status = () => screen.getByRole('status')
const isActive = () => status().classList.contains('c-toggletip--active')
const trigger = () => screen.getByRole('button', { name: 'Disparador' })
const wait = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })

const setup = (props: Partial<React.ComponentProps<typeof Toggletip>> = {}) =>
  render(
    <Toggletip label="Información extra" id="tg" {...props}>
      <button>Disparador</button>
    </Toggletip>
  )

describe('Toggletip', () => {
  describe('renderizado', () => {
    it('renderiza el hijo y una región de estado con el label, inicialmente cerrada', () => {
      setup()

      expect(trigger()).toBeInTheDocument()
      expect(status()).toHaveTextContent('Información extra')
      expect(isActive()).toBe(false)
      expect(trigger()).toHaveAttribute('data-open', 'false')
    })

    it('monta el contenido en un portal en el body', () => {
      const { container } = setup()

      expect(container).not.toContainElement(status())
      expect(document.querySelector('[id^="js-toggletip-portal-"][id$="-parent"]')).toBeInTheDocument()
    })

    it('usa el id recibido y lo vincula al disparador con aria-describedby', () => {
      setup({ id: 'mi-toggletip' })

      expect(status()).toHaveAttribute('id', 'mi-toggletip')
      expect(trigger()).toHaveAttribute('aria-describedby', 'mi-toggletip')
    })

    it('vincula aria-describedby al toggletip incluso cuando no se pasa id', () => {
      setup({ id: undefined })

      expect(status().id).toBeTruthy()
      expect(trigger()).toHaveAttribute('aria-describedby', status().id)
    })

    it('conserva el aria-describedby que el hijo ya tuviera y agrega el del toggletip', () => {
      render(
        <Toggletip label="Info" id="tg">
          <button aria-describedby="otra-descripcion">Disparador</button>
        </Toggletip>
      )

      expect(trigger()).toHaveAttribute('aria-describedby', 'otra-descripcion tg')
    })

    it('agrega addClass y la flecha cuando se pide', () => {
      setup({ addClass: 'mi-toggletip', hasArrow: true })

      expect(status()).toHaveClass('c-toggletip', 'mi-toggletip')
      expect(status().querySelector('.c-toggletip__arrow')).toBeInTheDocument()
    })

    // Comportamiento actual: el label se inyecta como HTML sin sanitizar.
    it('interpreta HTML en el label (comportamiento actual, sin sanitizar)', () => {
      setup({ label: 'Con <b>negrita</b>' })

      expect(status().querySelector('b')).toHaveTextContent('negrita')
    })

    it('Popper le asigna su placement una vez que se abre', async () => {
      setup({ placement: 'bottom' })

      await userEvent.click(trigger())

      await waitFor(() => expect(status()).toHaveAttribute('data-popper-placement'))
    })
  })

  describe('cuándo no se muestra', () => {
    it('sin label devuelve solo el hijo', () => {
      render(
        <Toggletip label="">
          <button>Solo hijo</button>
        </Toggletip>
      )

      expect(screen.getByRole('button', { name: 'Solo hijo' })).toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('con más de un hijo devuelve los hijos sin toggletip', () => {
      render(
        <Toggletip label="Info">
          <button>Uno</button>
          <button>Dos</button>
        </Toggletip>
      )

      expect(screen.getAllByRole('button')).toHaveLength(2)
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('con isDisabled devuelve solo el hijo', () => {
      setup({ isDisabled: true })

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(trigger()).toBeInTheDocument()
      expect(trigger()).not.toHaveAttribute('aria-describedby')
    })

    it('con isDisabled hacer click en el hijo no abre nada', async () => {
      setup({ isDisabled: true })

      await userEvent.click(trigger())

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('apertura y cierre', () => {
    it('se abre al hacer click en el disparador', async () => {
      setup()

      await userEvent.click(trigger())

      expect(isActive()).toBe(true)
      expect(trigger()).toHaveAttribute('data-open', 'true')
    })

    it('se cierra al perder el foco', async () => {
      setup()
      await userEvent.click(trigger())
      expect(isActive()).toBe(true)

      await act(async () => trigger().blur())

      expect(isActive()).toBe(false)
    })

    it('se cierra al presionar Escape', async () => {
      setup()
      await userEvent.click(trigger())

      // El componente lee `event.keyCode` (27), que los navegadores sí rellenan.
      fireEvent.keyDown(trigger(), { key: 'Escape', keyCode: 27 })

      expect(isActive()).toBe(false)
    })

    it('Escape no hace nada si ya estaba cerrado', () => {
      setup()

      fireEvent.keyDown(trigger(), { key: 'Escape', keyCode: 27 })

      expect(isActive()).toBe(false)
    })

    it('se cierra al volver a hacer click en el disparador y se queda cerrado', async () => {
      setup()
      await userEvent.click(trigger())
      expect(isActive()).toBe(true)

      await userEvent.click(trigger())
      await wait(300)

      expect(isActive()).toBe(false)
    })

    it('se puede abrir y cerrar varias veces seguidas con el mismo disparador', async () => {
      setup()

      for (let i = 0; i < 3; i++) {
        await userEvent.click(trigger())
        expect(isActive()).toBe(true)
        await userEvent.click(trigger())
        expect(isActive()).toBe(false)
      }
    })

    it('también se cierra con un segundo click cuando disabledInteractOutside está activo', async () => {
      setup({ disabledInteractOutside: true })
      await userEvent.click(trigger())

      await userEvent.click(trigger())
      await wait(300)

      expect(isActive()).toBe(false)
    })

    it('llama a los manejadores onBlur y onKeyDown propios del hijo y también cierra', async () => {
      const onBlur = vi.fn()
      const onKeyDown = vi.fn()
      render(
        <Toggletip label="Info" id="tg">
          <button onBlur={onBlur} onKeyDown={onKeyDown}>
            Disparador
          </button>
        </Toggletip>
      )
      await userEvent.click(trigger())

      fireEvent.keyDown(trigger(), { key: 'Escape', keyCode: 27 })
      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(isActive()).toBe(false)

      await userEvent.click(trigger())
      await act(async () => trigger().blur())
      expect(onBlur).toHaveBeenCalledTimes(1)
      expect(isActive()).toBe(false)
    })

    it('conserva el onClick del hijo', async () => {
      const onClick = vi.fn()
      render(
        <Toggletip label="Info" id="tg">
          <button onClick={onClick}>Disparador</button>
        </Toggletip>
      )

      await userEvent.click(trigger())

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(isActive()).toBe(true)
    })
  })

  describe('disabledInteractOutside', () => {
    it('no se cierra al perder el foco', async () => {
      setup({ disabledInteractOutside: true })
      await userEvent.click(trigger())

      await act(async () => trigger().blur())

      expect(isActive()).toBe(true)
    })

    it('no se cierra con Escape', async () => {
      setup({ disabledInteractOutside: true })
      await userEvent.click(trigger())

      fireEvent.keyDown(trigger(), { key: 'Escape', keyCode: 27 })

      expect(isActive()).toBe(true)
    })
  })
})
