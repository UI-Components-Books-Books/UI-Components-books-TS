import { StrictMode } from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import gsap from 'gsap'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Modal } from '../index'
import type { ModalContentProps, ModalProps } from '../types/types'

vi.mock('gsap', () => ({ default: { fromTo: vi.fn(), to: vi.fn() } }))

type ExampleProps = Partial<ModalProps> & {
  onOverlayClick?: () => void
  contentClass?: string
  contentProps?: Partial<ModalContentProps>
}

const Example = ({
  isOpen = true,
  onClose = () => {},
  onOverlayClick,
  contentClass,
  contentProps,
  ...rest
}: ExampleProps) => (
  <Modal isOpen={isOpen} onClose={onClose} {...rest}>
    <Modal.Overlay onClick={onOverlayClick} />
    <Modal.Content addClass={contentClass} {...contentProps}>
      <p>Contenido del modal</p>
      <Modal.CloseButton />
    </Modal.Content>
  </Modal>
)

const dialog = () => screen.getByRole('dialog')

/** El Modal bloquea la app marcando `#root` como inert, igual que en el decorador de Storybook. */
let appRoot: HTMLDivElement

beforeEach(() => {
  appRoot = document.createElement('div')
  appRoot.id = 'root'
  document.body.appendChild(appRoot)
})

afterEach(() => {
  appRoot.remove()
})

describe('Modal', () => {
  describe('renderizado', () => {
    it('no renderiza nada cuando está cerrado', () => {
      render(<Example isOpen={false} />, { container: appRoot })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.queryByText('Contenido del modal')).not.toBeInTheDocument()
    })

    it('renderiza un diálogo modal accesible cuando está abierto', () => {
      render(<Example />, { container: appRoot })

      expect(dialog()).toHaveAttribute('aria-modal', 'true')
      expect(dialog()).toHaveAttribute('tabindex', '-1')
      expect(dialog()).toHaveTextContent('Contenido del modal')
    })

    it('monta el contenido en un portal fuera de #root', () => {
      render(<Example />, { container: appRoot })

      expect(appRoot).not.toContainElement(dialog())
      expect(document.body).toContainElement(dialog())
      expect(document.querySelector('[id^="js-modal-"][id$="-parent"]')).toBeInTheDocument()
    })

    it('usa el id recibido como prefijo del contenedor del portal', () => {
      render(<Example id="mi-modal" />, { container: appRoot })

      expect(document.querySelector('[id^="mi-modal-"][id$="-parent"]')).toBeInTheDocument()
    })

    it('agrega addClass al contenido del modal', () => {
      render(<Example contentClass="mi-modal" />, { container: appRoot })

      expect(dialog()).toHaveClass('c-modal', 'mi-modal')
    })

    it('se monta y se desmonta según isOpen', () => {
      const { rerender } = render(<Example isOpen={false} />, { container: appRoot })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      rerender(<Example isOpen />)
      expect(dialog()).toBeInTheDocument()

      rerender(<Example isOpen={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('cierre', () => {
    it('llama a onClose al presionar Escape dentro del diálogo', () => {
      const onClose = vi.fn()
      render(<Example onClose={onClose} />, { container: appRoot })

      fireEvent.keyDown(dialog(), { key: 'Escape' })

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('ignora otras teclas', () => {
      const onClose = vi.fn()
      render(<Example onClose={onClose} />, { container: appRoot })

      fireEvent.keyDown(dialog(), { key: 'Enter' })
      fireEvent.keyDown(dialog(), { key: 'a' })

      expect(onClose).not.toHaveBeenCalled()
    })

    it('el botón de cerrar tiene aria-label y llama a onClose', async () => {
      const onClose = vi.fn()
      render(<Example onClose={onClose} />, { container: appRoot })

      await userEvent.click(screen.getByRole('button', { name: 'Cerrar modal' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('al hacer click en el overlay llama a su onClick y además a onClose', async () => {
      const onClose = vi.fn()
      const onOverlayClick = vi.fn()
      render(<Example onClose={onClose} onOverlayClick={onOverlayClick} />, { container: appRoot })

      await userEvent.click(document.querySelector('.c-layout')!)

      expect(onOverlayClick).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('el overlay cierra el modal aunque no tenga onClick propio', async () => {
      const onClose = vi.fn()
      render(<Example onClose={onClose} />, { container: appRoot })

      await userEvent.click(document.querySelector('.c-layout')!)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('foco', () => {
    it('mueve el foco al diálogo poco después de abrirse', async () => {
      render(<Example />, { container: appRoot })

      await waitFor(() => expect(dialog()).toHaveFocus())
    })

    it('devuelve el foco al elemento que lo tenía antes de abrir', async () => {
      const Page = ({ isOpen }: { isOpen: boolean }) => (
        <>
          <button>Abrir modal</button>
          <Example isOpen={isOpen} />
        </>
      )
      const { rerender } = render(<Page isOpen={false} />, { container: appRoot })
      const trigger = screen.getByRole('button', { name: 'Abrir modal' })
      trigger.focus()

      rerender(<Page isOpen />)
      await waitFor(() => expect(dialog()).toHaveFocus())
      rerender(<Page isOpen={false} />)

      await waitFor(() => expect(trigger).toHaveFocus())
    })

    it('con finalFocusRef (selector) devuelve el foco a ese elemento', async () => {
      const Page = ({ isOpen }: { isOpen: boolean }) => (
        <>
          <button>Disparador</button>
          <button id="destino">Destino</button>
          <Example isOpen={isOpen} finalFocusRef="#destino" />
        </>
      )
      const { rerender } = render(<Page isOpen={false} />, { container: appRoot })
      screen.getByRole('button', { name: 'Disparador' }).focus()

      rerender(<Page isOpen />)
      rerender(<Page isOpen={false} />)

      await waitFor(() => expect(screen.getByRole('button', { name: 'Destino' })).toHaveFocus())
    })

    it('con finalFocusRef como arreglo usa el primer elemento que coincida', async () => {
      const Page = ({ isOpen }: { isOpen: boolean }) => (
        <>
          <button>Disparador</button>
          <button className="segundo">Segundo</button>
          <Example isOpen={isOpen} finalFocusRef={['#no-existe', '.segundo']} />
        </>
      )
      const { rerender } = render(<Page isOpen={false} />, { container: appRoot })
      screen.getByRole('button', { name: 'Disparador' }).focus()

      rerender(<Page isOpen />)
      rerender(<Page isOpen={false} />)

      await waitFor(() => expect(screen.getByRole('button', { name: 'Segundo' })).toHaveFocus())
    })

    it('no le quita el foco a un campo que ya lo tiene dentro del modal', async () => {
      render(
        <Modal isOpen onClose={() => {}}>
          <Modal.Content>
            <input aria-label="Nombre" />
          </Modal.Content>
        </Modal>,
        { container: appRoot }
      )
      const input = screen.getByRole('textbox', { name: 'Nombre' })

      // Un campo que se enfoca antes de que el modal enfoque su contenedor (a los 100 ms).
      setTimeout(() => input.focus(), 20)
      await waitFor(() => expect(input).toHaveFocus())
      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(input).toHaveFocus()
    })

    it('cancela el enfoque pendiente si se desmonta antes de que ocurra', () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        const { unmount } = render(<Example />, { container: appRoot })
        expect(vi.getTimerCount()).toBe(1)

        unmount()

        expect(vi.getTimerCount()).toBe(0)
      } finally {
        vi.useRealTimers()
      }
    })

    it('el foco se queda en el diálogo con StrictMode (que ejecuta dos veces los efectos)', async () => {
      const Page = () => (
        <StrictMode>
          <button>Disparador</button>
          <Example />
        </StrictMode>
      )
      render(<Page />, { container: appRoot })

      await waitFor(() => expect(dialog()).toHaveFocus())
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(dialog()).toHaveFocus()
    })

    it('devuelve el foco aunque el modal se desmonte estando abierto', async () => {
      const Page = ({ showModal }: { showModal: boolean }) => (
        <>
          <button>Abrir modal</button>
          {showModal && <Example />}
        </>
      )
      const { rerender } = render(<Page showModal={false} />, { container: appRoot })
      const trigger = screen.getByRole('button', { name: 'Abrir modal' })
      trigger.focus()

      rerender(<Page showModal />)
      await waitFor(() => expect(dialog()).toHaveFocus())
      rerender(<Page showModal={false} />)

      await waitFor(() => expect(trigger).toHaveFocus())
    })

    it('devuelve el foco aunque la página no tenga #root', async () => {
      appRoot.remove()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const Page = ({ isOpen }: { isOpen: boolean }) => (
        <>
          <button>Abrir modal</button>
          <Example isOpen={isOpen} />
        </>
      )
      const { rerender } = render(<Page isOpen={false} />, { container })
      const trigger = screen.getByRole('button', { name: 'Abrir modal' })
      trigger.focus()

      rerender(<Page isOpen />)
      await waitFor(() => expect(dialog()).toHaveFocus())
      rerender(<Page isOpen={false} />)

      await waitFor(() => expect(trigger).toHaveFocus())
      container.remove()
      document.body.appendChild(appRoot)
    })

    it('si ningún selector de finalFocusRef coincide, vuelve al elemento que tenía el foco', async () => {
      const Page = ({ isOpen }: { isOpen: boolean }) => (
        <>
          <button>Abrir modal</button>
          <Example isOpen={isOpen} finalFocusRef={['#no-existe', '.tampoco']} />
        </>
      )
      const { rerender } = render(<Page isOpen={false} />, { container: appRoot })
      const trigger = screen.getByRole('button', { name: 'Abrir modal' })
      trigger.focus()

      rerender(<Page isOpen />)
      // finalFocusRef llega como un arreglo nuevo en cada render: no debe afectar al modal abierto.
      rerender(<Page isOpen />)
      await waitFor(() => expect(dialog()).toHaveFocus())
      rerender(<Page isOpen={false} />)

      await waitFor(() => expect(trigger).toHaveFocus())
    })

    it('mantiene #root inert mientras está abierto aunque finalFocusRef sea un arreglo nuevo en cada render', () => {
      const Page = () => <Example finalFocusRef={['#destino']} />
      const { rerender } = render(<Page />, { container: appRoot })

      rerender(<Page />)
      rerender(<Page />)

      expect(appRoot).toHaveAttribute('inert')
    })
  })

  describe('bloqueo del resto de la página (#root inert)', () => {
    it('marca #root como inert mientras está abierto', () => {
      render(<Example />, { container: appRoot })

      expect(appRoot).toHaveAttribute('inert')
    })

    it('quita inert de #root al cerrarse', () => {
      const { rerender } = render(<Example />, { container: appRoot })
      expect(appRoot).toHaveAttribute('inert')

      rerender(<Example isOpen={false} />)

      expect(appRoot).not.toHaveAttribute('inert')
    })

    it('quita inert de #root al desmontarse estando abierto', () => {
      const { unmount } = render(<Example />, { container: appRoot })
      expect(appRoot).toHaveAttribute('inert')

      unmount()

      expect(appRoot).not.toHaveAttribute('inert')
    })

    it('no falla si la página no tiene #root', () => {
      appRoot.remove()
      const container = document.createElement('div')
      document.body.appendChild(container)

      expect(() => render(<Example />, { container })).not.toThrow()
      expect(dialog()).toBeInTheDocument()

      container.remove()
      document.body.appendChild(appRoot)
    })
  })

  describe('animaciones', () => {
    it('anima la entrada del contenido y del overlay con gsap', () => {
      vi.mocked(gsap.fromTo).mockClear()
      render(<Example />, { container: appRoot })

      const targets = vi.mocked(gsap.fromTo).mock.calls.map(([target]) => target)
      expect(targets).toContain(dialog())
      expect(targets).toContain(document.querySelector('.c-layout'))
    })
  })

  describe('accesibilidad', () => {
    it('aria-label da nombre al diálogo', () => {
      render(<Example contentProps={{ 'aria-label': 'Confirmar compra' }} />, { container: appRoot })

      expect(screen.getByRole('dialog', { name: 'Confirmar compra' })).toBe(dialog())
    })

    it('aria-labelledby y aria-describedby apuntan al título y a la descripción', () => {
      render(
        <Modal isOpen onClose={() => {}}>
          <Modal.Content aria-labelledby="titulo" aria-describedby="descripcion">
            <h2 id="titulo">Eliminar cuenta</h2>
            <p id="descripcion">Esta acción no se puede deshacer.</p>
          </Modal.Content>
        </Modal>,
        { container: appRoot }
      )

      expect(screen.getByRole('dialog', { name: 'Eliminar cuenta' })).toHaveAccessibleDescription(
        'Esta acción no se puede deshacer.'
      )
    })

    it('mantiene aria-modal aunque se pasen atributos ARIA', () => {
      render(<Example contentProps={{ 'aria-label': 'Confirmar' }} />, { container: appRoot })

      expect(dialog()).toHaveAttribute('aria-modal', 'true')
    })

    it('por defecto es un dialog', () => {
      render(<Example />, { container: appRoot })

      expect(dialog()).toHaveAttribute('role', 'dialog')
    })

    it('se puede cambiar a alertdialog', () => {
      render(<Example contentProps={{ role: 'alertdialog', 'aria-label': 'Alerta' }} />, {
        container: appRoot,
      })

      expect(screen.getByRole('alertdialog', { name: 'Alerta' })).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
