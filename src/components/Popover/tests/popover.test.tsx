import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Popover } from '../index'
import type { PopoverContentProps, PopoverProps } from '../types/types'

const content = () => document.getElementById('pop') as HTMLElement
const trigger = () => screen.getByRole('button', { name: 'Abrir' })
const isOpen = () => content().getAttribute('data-hidden') === 'false'

const setup = (
  props: Partial<PopoverProps> = {},
  contentProps: Partial<PopoverContentProps> = {},
  buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> = {}
) =>
  render(
    <>
      <button>Fuera</button>
      <Popover {...props}>
        <>
          <Popover.Button>
            <button {...buttonProps}>Abrir</button>
          </Popover.Button>
          <Popover.Content id="pop" {...contentProps}>
            <button>Primero</button>
            <button>Último</button>
          </Popover.Content>
        </>
      </Popover>
    </>
  )

describe('Popover', () => {
  describe('renderizado', () => {
    it('empieza cerrado: el contenido existe pero está oculto', () => {
      setup()

      expect(content()).toHaveAttribute('hidden')
      expect(content()).toHaveAttribute('data-hidden', 'true')
      expect(content()).not.toHaveClass('c-popover-modal--active')
    })

    it('monta el contenido en un portal en el body, con role status', () => {
      const { container } = setup()

      expect(container).not.toContainElement(content())
      expect(content()).toHaveAttribute('role', 'status')
      expect(document.querySelector('[id^="js-popover-modal-portal-"][id$="-parent"]')).toBeInTheDocument()
    })

    it('usa el id recibido o genera uno cuando no se pasa', () => {
      render(
        <Popover>
          <>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content>
              <p>Sin id</p>
            </Popover.Content>
          </>
        </Popover>
      )

      expect(screen.getByText('Sin id').closest('[role="status"]')?.id).toBeTruthy()
    })

    it('agrega addClass y la flecha cuando se pide', () => {
      setup({}, { addClass: 'mi-popover', hasArrow: true })

      expect(content()).toHaveClass('c-popover-modal', 'mi-popover')
      expect(content().querySelector('.c-popover-modal__arrow')).toBeInTheDocument()
    })

    it('no dibuja la flecha por defecto', () => {
      setup()

      expect(content().querySelector('.c-popover-modal__arrow')).not.toBeInTheDocument()
    })

    it('Popper le asigna su placement una vez abierto', async () => {
      setup({}, { placement: 'bottom' })

      await userEvent.click(trigger())

      await waitFor(() => expect(content()).toHaveAttribute('data-popper-placement'))
    })

    it('con isDisabled no se abre al hacer click en el disparador', async () => {
      setup({}, { isDisabled: true })

      await userEvent.click(trigger())

      expect(isOpen()).toBe(false)
      expect(content()).toHaveAttribute('hidden')
      expect(content()).not.toHaveClass('c-popover-modal--active')
      expect(content()).not.toHaveFocus()
    })

    it('al volver a habilitarse no aparece abierto por sorpresa', async () => {
      const tree = (isDisabled: boolean) => (
        <Popover>
          <>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop" isDisabled={isDisabled}>
              <button>Primero</button>
            </Popover.Content>
          </>
        </Popover>
      )
      const { rerender } = render(tree(true))
      await userEvent.click(trigger())

      rerender(tree(false))

      expect(isOpen()).toBe(false)
    })

    it('una vez habilitado de nuevo, el disparador vuelve a abrirlo con normalidad', async () => {
      const tree = (isDisabled: boolean) => (
        <Popover>
          <>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop" isDisabled={isDisabled}>
              <button>Primero</button>
            </Popover.Content>
          </>
        </Popover>
      )
      const { rerender } = render(tree(true))
      await userEvent.click(trigger())
      rerender(tree(false))

      await userEvent.click(trigger())

      expect(isOpen()).toBe(true)
    })
  })

  describe('apertura y cierre', () => {
    it('se abre al hacer click en el disparador y le pasa el foco al contenido', async () => {
      setup()

      await userEvent.click(trigger())

      expect(isOpen()).toBe(true)
      expect(content()).not.toHaveAttribute('hidden')
      expect(content()).toHaveClass('c-popover-modal--active')
      expect(content()).toHaveFocus()
    })

    it('se cierra al volver a hacer click en el disparador', async () => {
      setup()
      await userEvent.click(trigger())

      await userEvent.click(trigger())

      expect(isOpen()).toBe(false)
      expect(content()).toHaveAttribute('hidden')
    })

    it('empieza abierto con isVisible', async () => {
      setup({ isVisible: true })

      await waitFor(() => expect(isOpen()).toBe(true))
    })

    it('sigue la prop isVisible cuando cambia', async () => {
      const { rerender } = setup({ isVisible: false })
      expect(isOpen()).toBe(false)

      rerender(
        <>
          <button>Fuera</button>
          <Popover isVisible>
            <>
              <Popover.Button>
                <button>Abrir</button>
              </Popover.Button>
              <Popover.Content id="pop">
                <button>Primero</button>
              </Popover.Content>
            </>
          </Popover>
        </>
      )

      await waitFor(() => expect(isOpen()).toBe(true))
    })

    it('conserva el onClick del botón original', async () => {
      const onClick = vi.fn()
      setup({}, {}, { onClick })

      await userEvent.click(trigger())

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(isOpen()).toBe(true)
    })

    it('con más de un hijo en Popover.Button no renderiza nada', () => {
      render(
        <Popover>
          <Popover.Button>
            {[<button key="a">Uno</button>, <button key="b">Dos</button>] as unknown as JSX.Element}
          </Popover.Button>
        </Popover>
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('interacción fuera del popover', () => {
    it('se cierra al hacer click fuera', async () => {
      setup()
      await userEvent.click(trigger())

      await userEvent.click(screen.getByRole('button', { name: 'Fuera' }))

      expect(isOpen()).toBe(false)
    })

    it('no se cierra al hacer click dentro del contenido', async () => {
      setup()
      await userEvent.click(trigger())

      await userEvent.click(screen.getByRole('button', { name: 'Primero' }))

      expect(isOpen()).toBe(true)
    })

    it('con disabledInteractOutside no se cierra al hacer click fuera', async () => {
      setup({}, { disabledInteractOutside: true })
      await userEvent.click(trigger())

      await userEvent.click(screen.getByRole('button', { name: 'Fuera' }))

      expect(isOpen()).toBe(true)
    })

    it('se cierra cuando el disparador pierde el foco hacia un elemento externo', async () => {
      setup()
      await userEvent.click(trigger())
      expect(isOpen()).toBe(true)

      fireEvent.blur(trigger(), { relatedTarget: screen.getByRole('button', { name: 'Fuera' }) })

      expect(isOpen()).toBe(false)
    })

    it('no se cierra cuando el foco pasa del disparador al propio popover', async () => {
      setup()
      await userEvent.click(trigger())

      fireEvent.blur(trigger(), { relatedTarget: content() })

      expect(isOpen()).toBe(true)
    })

    it('conserva el onBlur del botón original', async () => {
      const onBlur = vi.fn()
      setup({}, {}, { onBlur })
      await userEvent.click(trigger())
      // Al abrirse, el foco pasa del disparador al contenido y eso ya dispara un blur.
      onBlur.mockClear()

      fireEvent.blur(trigger(), { relatedTarget: screen.getByRole('button', { name: 'Fuera' }) })

      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('teclado dentro del popover', () => {
    // El componente lee `event.keyCode` (27 = Esc, 9 = Tab), que los navegadores sí rellenan
    // pero `userEvent.keyboard` no, así que se simula con fireEvent.
    it('Escape devuelve el foco al disparador', async () => {
      setup()
      await userEvent.click(trigger())

      fireEvent.keyDown(content(), { key: 'Escape', keyCode: 27 })

      expect(trigger()).toHaveFocus()
    })

    it('Tab sobre el último elemento enfocable devuelve el foco al disparador', async () => {
      setup()
      await userEvent.click(trigger())
      screen.getByRole('button', { name: 'Último' }).focus()

      const notPrevented = fireEvent.keyDown(screen.getByRole('button', { name: 'Último' }), {
        key: 'Tab',
        keyCode: 9,
      })

      expect(trigger()).toHaveFocus()
      expect(notPrevented).toBe(false) // se hizo preventDefault
    })

    it('Shift+Tab sobre el primer elemento enfocable devuelve el foco al disparador', async () => {
      setup()
      await userEvent.click(trigger())
      screen.getByRole('button', { name: 'Primero' }).focus()

      fireEvent.keyDown(screen.getByRole('button', { name: 'Primero' }), {
        key: 'Tab',
        keyCode: 9,
        shiftKey: true,
      })

      expect(trigger()).toHaveFocus()
    })

    it('Tab sobre un elemento intermedio no mueve el foco', async () => {
      render(
        <Popover>
          <>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop">
              <button>A</button>
              <button>B</button>
              <button>C</button>
            </Popover.Content>
          </>
        </Popover>
      )
      await userEvent.click(trigger())
      screen.getByRole('button', { name: 'B' }).focus()

      fireEvent.keyDown(screen.getByRole('button', { name: 'B' }), { key: 'Tab', keyCode: 9 })

      expect(screen.getByRole('button', { name: 'B' })).toHaveFocus()
    })

    it('Shift+Tab sobre el último elemento no salta al disparador (retrocede con normalidad)', async () => {
      render(
        <Popover>
          <>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop">
              <button>A</button>
              <button>B</button>
            </Popover.Content>
          </>
        </Popover>
      )
      await userEvent.click(trigger())
      screen.getByRole('button', { name: 'B' }).focus()

      fireEvent.keyDown(screen.getByRole('button', { name: 'B' }), {
        key: 'Tab',
        keyCode: 9,
        shiftKey: true,
      })

      expect(trigger()).not.toHaveFocus()
    })

    it('considera enfocables los elementos con tabindex="0"', async () => {
      render(
        <Popover>
          <>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop">
              <button>Botón</button>
              <div tabIndex={0} data-testid="ultimo">
                Último enfocable
              </div>
            </Popover.Content>
          </>
        </Popover>
      )
      await userEvent.click(trigger())
      screen.getByTestId('ultimo').focus()

      fireEvent.keyDown(screen.getByTestId('ultimo'), { key: 'Tab', keyCode: 9 })

      expect(trigger()).toHaveFocus()
    })
  })
})
