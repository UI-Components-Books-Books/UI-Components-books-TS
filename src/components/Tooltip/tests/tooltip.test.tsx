import { createRef } from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Tooltip } from '../index'

const tooltip = () => screen.getByRole('tooltip')
const isOpen = () => tooltip().getAttribute('data-open') === 'true'
const wait = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })

const setup = (props: Partial<React.ComponentProps<typeof Tooltip>> = {}) =>
  render(
    <Tooltip label="Texto de ayuda" id="tip" {...props}>
      <button>Disparador</button>
    </Tooltip>
  )

describe('Tooltip', () => {
  describe('renderizado', () => {
    it('renderiza el elemento hijo y un tooltip con el label, inicialmente cerrado', () => {
      setup()

      expect(screen.getByRole('button', { name: 'Disparador' })).toBeInTheDocument()
      expect(tooltip()).toHaveTextContent('Texto de ayuda')
      expect(isOpen()).toBe(false)
      expect(tooltip()).not.toHaveClass('c-tooltip--active')
    })

    it('monta el tooltip en un portal en el body', () => {
      const { container } = setup()

      expect(container).not.toContainElement(tooltip())
      expect(document.querySelector('[id^="js-tooltip-portal-"][id$="-parent"]')).toBeInTheDocument()
    })

    it('usa el id recibido y lo vincula al disparador con aria-describedby', () => {
      setup({ id: 'mi-tooltip' })

      expect(tooltip()).toHaveAttribute('id', 'mi-tooltip')
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'mi-tooltip')
    })

    it('vincula aria-describedby al tooltip incluso cuando no se pasa id', () => {
      setup({ id: undefined })

      expect(tooltip().id).toBeTruthy()
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', tooltip().id)
    })

    it('conserva el aria-describedby que el hijo ya tuviera y agrega el del tooltip', () => {
      render(
        <Tooltip label="Ayuda" id="tip">
          <button aria-describedby="otra-descripcion">Disparador</button>
        </Tooltip>
      )

      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'otra-descripcion tip')
    })

    it('agrega addClass y la flecha cuando se pide', () => {
      setup({ addClass: 'mi-tooltip', hasArrow: true })

      expect(tooltip()).toHaveClass('c-tooltip', 'mi-tooltip')
      expect(tooltip().querySelector('.c-tooltip__arrow')).toBeInTheDocument()
    })

    it('no dibuja la flecha por defecto', () => {
      setup()

      expect(tooltip().querySelector('.c-tooltip__arrow')).not.toBeInTheDocument()
    })

    // Comportamiento actual: el label se inyecta como HTML sin sanitizar.
    it('interpreta HTML en el label (comportamiento actual, sin sanitizar)', () => {
      setup({ label: 'Texto <i>en cursiva</i>' })

      expect(tooltip().querySelector('i')).toHaveTextContent('en cursiva')
    })

    it('Popper le asigna su placement una vez que se abre', async () => {
      setup({ placement: 'top' })

      await userEvent.hover(screen.getByRole('button'))

      await waitFor(() => expect(tooltip()).toHaveAttribute('data-popper-placement'))
    })
  })

  describe('cuándo no se muestra', () => {
    it('sin label devuelve solo el hijo', () => {
      render(
        <Tooltip label="">
          <button>Solo hijo</button>
        </Tooltip>
      )

      expect(screen.getByRole('button', { name: 'Solo hijo' })).toBeInTheDocument()
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('con isDisabled devuelve solo el hijo', () => {
      setup({ isDisabled: true })

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('con más de un hijo devuelve los hijos sin tooltip', () => {
      render(
        <Tooltip label="Ayuda">
          <button>Uno</button>
          <button>Dos</button>
        </Tooltip>
      )

      expect(screen.getAllByRole('button')).toHaveLength(2)
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  describe('interacción con el mouse', () => {
    it('se abre al pasar el mouse sobre el disparador', async () => {
      setup()

      await userEvent.hover(screen.getByRole('button'))

      expect(isOpen()).toBe(true)
      expect(tooltip()).toHaveClass('c-tooltip--active')
    })

    it('se cierra poco después de quitar el mouse del disparador', async () => {
      setup()
      await userEvent.hover(screen.getByRole('button'))

      await userEvent.unhover(screen.getByRole('button'))
      expect(isOpen()).toBe(true) // sigue abierto durante el retraso de 150 ms

      await waitFor(() => expect(isOpen()).toBe(false), { timeout: 1000 })
    })

    it('se mantiene abierto si el mouse pasa del disparador al propio tooltip', async () => {
      setup()
      await userEvent.hover(screen.getByRole('button'))

      await userEvent.unhover(screen.getByRole('button'))
      await userEvent.hover(tooltip())
      await wait(300)

      expect(isOpen()).toBe(true)
    })

    it('se cierra al salir del propio tooltip', async () => {
      setup()
      await userEvent.hover(screen.getByRole('button'))
      await userEvent.hover(tooltip())

      await userEvent.unhover(tooltip())

      await waitFor(() => expect(isOpen()).toBe(false), { timeout: 1000 })
    })
  })

  describe('interacción con el teclado', () => {
    it('se abre al recibir foco y se cierra al perderlo', async () => {
      setup()

      await act(async () => screen.getByRole('button').focus())
      expect(isOpen()).toBe(true)

      await act(async () => screen.getByRole('button').blur())
      expect(isOpen()).toBe(false)
    })

    it('se cierra al presionar Escape sin quitar el foco', async () => {
      setup()
      await act(async () => screen.getByRole('button').focus())
      expect(isOpen()).toBe(true)
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' })

      expect(isOpen()).toBe(false)
      expect(screen.getByRole('button')).toHaveFocus()
    })

    it('Escape no hace nada si el tooltip ya estaba cerrado', () => {
      setup()

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' })

      expect(isOpen()).toBe(false)
    })
  })

  describe('manejadores propios del hijo', () => {
    it('sigue abriéndose aunque el hijo tenga su propio onFocus', async () => {
      const onFocus = vi.fn()
      render(
        <Tooltip label="Ayuda" id="tip">
          <button onFocus={onFocus}>Con onFocus</button>
        </Tooltip>
      )

      await act(async () => screen.getByRole('button').focus())

      expect(onFocus).toHaveBeenCalled()
      expect(isOpen()).toBe(true)
    })

    it('llama a los manejadores propios del hijo y también cierra el tooltip', async () => {
      const onBlur = vi.fn()
      const onMouseEnter = vi.fn()
      const onKeyDown = vi.fn()
      render(
        <Tooltip label="Ayuda" id="tip">
          <button onBlur={onBlur} onMouseEnter={onMouseEnter} onKeyDown={onKeyDown}>
            Con manejadores
          </button>
        </Tooltip>
      )

      await userEvent.hover(screen.getByRole('button'))
      expect(onMouseEnter).toHaveBeenCalledTimes(1)
      expect(isOpen()).toBe(true)

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' })
      expect(onKeyDown).toHaveBeenCalledTimes(1)
      expect(isOpen()).toBe(false)

      await act(async () => screen.getByRole('button').focus())
      await act(async () => screen.getByRole('button').blur())
      expect(onBlur).toHaveBeenCalledTimes(1)
      expect(isOpen()).toBe(false)
    })

    it('conserva el onClick del hijo', async () => {
      const onClick = vi.fn()
      render(
        <Tooltip label="Ayuda" id="tip">
          <button onClick={onClick}>Click</button>
        </Tooltip>
      )

      await userEvent.click(screen.getByRole('button'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('ref del hijo', () => {
    it('conserva una ref de objeto del hijo y el tooltip sigue funcionando', async () => {
      const ref = createRef<HTMLButtonElement>()
      render(
        <Tooltip label="Ayuda" id="tip">
          <button ref={ref}>Con ref</button>
        </Tooltip>
      )

      expect(ref.current).toBe(screen.getByRole('button'))
      await userEvent.hover(screen.getByRole('button'))
      expect(isOpen()).toBe(true)
    })

    it('conserva una ref de tipo callback del hijo', () => {
      const ref = vi.fn()
      render(
        <Tooltip label="Ayuda" id="tip">
          <button ref={ref}>Con ref</button>
        </Tooltip>
      )

      expect(ref).toHaveBeenCalledWith(screen.getByRole('button'))
    })

    it('suelta la ref del hijo al desmontarse', () => {
      const ref = createRef<HTMLButtonElement>()
      const { unmount } = render(
        <Tooltip label="Ayuda" id="tip">
          <button ref={ref}>Con ref</button>
        </Tooltip>
      )

      unmount()

      expect(ref.current).toBeNull()
    })

    it('sin ref en el hijo sigue funcionando igual', async () => {
      setup()

      await userEvent.hover(screen.getByRole('button'))

      expect(isOpen()).toBe(true)
    })
  })
})
