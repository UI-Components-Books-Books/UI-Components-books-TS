import { createRef } from 'react'

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

    it('monta el contenido en un portal en el body, con role dialog', () => {
      const { container } = setup()

      expect(container).not.toContainElement(content())
      expect(content()).toHaveAttribute('role', 'dialog')
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

      expect(screen.getByText('Sin id').closest('[role="dialog"]')?.id).toBeTruthy()
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
    // Se simula con fireEvent para controlar el elemento que recibe cada tecla.
    it('Escape cierra el popover y devuelve el foco al disparador', async () => {
      setup()
      await userEvent.click(trigger())

      fireEvent.keyDown(content(), { key: 'Escape' })

      expect(isOpen()).toBe(false)
      expect(trigger()).toHaveFocus()
    })

    it('Tab sobre el último elemento enfocable devuelve el foco al disparador', async () => {
      setup()
      await userEvent.click(trigger())
      screen.getByRole('button', { name: 'Último' }).focus()

      const notPrevented = fireEvent.keyDown(screen.getByRole('button', { name: 'Último' }), {
        key: 'Tab',
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

      fireEvent.keyDown(screen.getByRole('button', { name: 'B' }), { key: 'Tab' })

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

      fireEvent.keyDown(screen.getByTestId('ultimo'), { key: 'Tab' })

      expect(trigger()).toHaveFocus()
    })
  })

  describe('ref del botón', () => {
    const withRef = (ref: React.Ref<HTMLButtonElement>) =>
      render(
        <Popover>
          <>
            <Popover.Button>
              <button ref={ref}>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop">
              <button>Primero</button>
            </Popover.Content>
          </>
        </Popover>
      )

    it('conserva una ref de objeto del botón y el popover sigue abriéndose', async () => {
      const ref = createRef<HTMLButtonElement>()
      withRef(ref)

      expect(ref.current).toBe(trigger())
      await userEvent.click(trigger())
      expect(isOpen()).toBe(true)
    })

    it('conserva una ref de tipo callback del botón', () => {
      const ref = vi.fn()
      withRef(ref)

      expect(ref).toHaveBeenCalledWith(trigger())
    })

    it('el popover sigue cerrándose con Escape y devolviendo el foco al botón aunque el botón tenga ref propia', async () => {
      withRef(createRef<HTMLButtonElement>())
      await userEvent.click(trigger())

      fireEvent.keyDown(content(), { key: 'Escape' })

      expect(isOpen()).toBe(false)
      expect(trigger()).toHaveFocus()
    })

    it('suelta la ref del botón al desmontarse', () => {
      const ref = createRef<HTMLButtonElement>()
      const { unmount } = withRef(ref)

      unmount()

      expect(ref.current).toBeNull()
    })
  })

  describe('accesibilidad del disparador', () => {
    it('declara que abre un diálogo y que está cerrado', () => {
      setup()

      expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog')
      expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    })

    it('aria-expanded sigue el estado del popover', async () => {
      setup()

      await userEvent.click(trigger())
      expect(trigger()).toHaveAttribute('aria-expanded', 'true')

      await userEvent.click(trigger())
      expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    })

    it('aria-controls apunta al contenido, con id propio o generado', () => {
      setup()
      expect(trigger()).toHaveAttribute('aria-controls', 'pop')

      render(
        <Popover>
          <>
            <Popover.Button>
              <button>Otro</button>
            </Popover.Button>
            <Popover.Content>
              <p>Sin id</p>
            </Popover.Content>
          </>
        </Popover>
      )
      const controlled = document.getElementById(
        screen.getByRole('button', { name: 'Otro' }).getAttribute('aria-controls') as string
      )
      expect(controlled).toBe(screen.getByText('Sin id').closest('[role="dialog"]'))
    })

    it('con isDisabled sigue marcado como cerrado', async () => {
      setup({}, { isDisabled: true })

      await userEvent.click(trigger())

      expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    })

    it('respeta el aria-haspopup y el aria-controls que el botón ya declare', () => {
      setup({}, {}, { 'aria-haspopup': 'menu', 'aria-controls': 'otro' })

      expect(trigger()).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger()).toHaveAttribute('aria-controls', 'otro')
    })

    it('conserva el id del botón o le da uno si no lo tiene', () => {
      const first = setup({}, {}, { id: 'mi-boton' })
      expect(trigger()).toHaveAttribute('id', 'mi-boton')
      first.unmount()

      setup()
      expect(trigger().id).toBeTruthy()
    })

    it('conserva el onKeyDown del botón original', () => {
      const onKeyDown = vi.fn()
      setup({}, {}, { onKeyDown })

      fireEvent.keyDown(trigger(), { key: 'a' })

      expect(onKeyDown).toHaveBeenCalledTimes(1)
    })
  })

  describe('accesibilidad del contenido', () => {
    it('es un diálogo no modal', async () => {
      setup()
      await userEvent.click(trigger())

      expect(screen.getByRole('dialog')).toBe(content())
      expect(content()).not.toHaveAttribute('aria-modal')
    })

    it('cerrado no forma parte del árbol de accesibilidad', () => {
      setup()

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('sin nombre propio se nombra con el texto del botón que lo abre', async () => {
      setup()
      await userEvent.click(trigger())

      expect(screen.getByRole('dialog', { name: 'Abrir' })).toBe(content())
    })

    it('se nombra con el id del propio botón si este ya tenía uno', async () => {
      setup({}, {}, { id: 'mi-boton' })
      await userEvent.click(trigger())

      expect(content()).toHaveAttribute('aria-labelledby', 'mi-boton')
    })

    it('aria-label es su nombre y no se mezcla con el del botón', async () => {
      setup({}, { 'aria-label': 'Detalles del autor' })
      await userEvent.click(trigger())

      expect(screen.getByRole('dialog', { name: 'Detalles del autor' })).toBe(content())
      expect(content()).not.toHaveAttribute('aria-labelledby')
    })

    it('aria-labelledby propio tiene prioridad sobre el botón', async () => {
      render(
        <Popover>
          <>
            <h2 id="titulo">Título propio</h2>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop" aria-labelledby="titulo">
              <p>Contenido</p>
            </Popover.Content>
          </>
        </Popover>
      )
      await userEvent.click(trigger())

      expect(screen.getByRole('dialog', { name: 'Título propio' })).toBe(content())
    })

    it('acepta aria-describedby', async () => {
      render(
        <Popover>
          <>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop" aria-describedby="descripcion">
              <p id="descripcion">Una descripción</p>
            </Popover.Content>
          </>
        </Popover>
      )
      await userEvent.click(trigger())

      expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Una descripción')
    })
  })

  describe('Escape', () => {
    it('cierra el popover desde el disparador cuando está abierto', async () => {
      setup()
      await userEvent.click(trigger())
      trigger().focus()

      fireEvent.keyDown(trigger(), { key: 'Escape' })

      expect(isOpen()).toBe(false)
      expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    })

    it('con el popover cerrado no hace nada y deja pasar la tecla', () => {
      const onKeyDown = vi.fn()
      render(
        <div onKeyDown={onKeyDown}>
          <Popover>
            <>
              <Popover.Button>
                <button>Abrir</button>
              </Popover.Button>
              <Popover.Content id="pop">
                <button>Primero</button>
              </Popover.Content>
            </>
          </Popover>
        </div>
      )

      fireEvent.keyDown(trigger(), { key: 'Escape' })

      expect(isOpen()).toBe(false)
      expect(onKeyDown).toHaveBeenCalledTimes(1)
    })

    it('no llega a cerrar lo que contenga al popover (p. ej. un Modal)', async () => {
      const onKeyDown = vi.fn()
      render(
        <div onKeyDown={onKeyDown}>
          <Popover>
            <>
              <Popover.Button>
                <button>Abrir</button>
              </Popover.Button>
              <Popover.Content id="pop">
                <button>Primero</button>
              </Popover.Content>
            </>
          </Popover>
        </div>
      )
      await userEvent.click(trigger())

      fireEvent.keyDown(screen.getByRole('button', { name: 'Primero' }), { key: 'Escape' })
      expect(isOpen()).toBe(false)

      // Desde el disparador pasa lo mismo.
      await userEvent.click(trigger())
      fireEvent.keyDown(trigger(), { key: 'Escape' })
      expect(isOpen()).toBe(false)
      expect(onKeyDown).not.toHaveBeenCalled()
    })

    it('no cierra el popover si lo de dentro ya usó la tecla', async () => {
      render(
        <Popover>
          <>
            <Popover.Button>
              <button>Abrir</button>
            </Popover.Button>
            <Popover.Content id="pop">
              <input aria-label="Campo" onKeyDown={(event) => event.preventDefault()} />
            </Popover.Content>
          </>
        </Popover>
      )
      await userEvent.click(trigger())

      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Campo' }), { key: 'Escape' })

      expect(isOpen()).toBe(true)
    })

    it('se puede volver a abrir después de cerrarlo con Escape', async () => {
      setup()
      await userEvent.click(trigger())
      fireEvent.keyDown(content(), { key: 'Escape' })

      await userEvent.click(trigger())

      expect(isOpen()).toBe(true)
      expect(content()).toHaveFocus()
    })
  })
})
