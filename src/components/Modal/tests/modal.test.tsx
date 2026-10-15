import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import gsap from 'gsap'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Modal } from '../index'
import type { ModalProps } from '../types/types'

vi.mock('gsap', () => ({ default: { fromTo: vi.fn(), to: vi.fn() } }))

type ExampleProps = Partial<ModalProps> & { onOverlayClick?: () => void; contentClass?: string }

const Example = ({ isOpen = true, onClose = () => {}, onOverlayClick, contentClass, ...rest }: ExampleProps) => (
  <Modal isOpen={isOpen} onClose={onClose} {...rest}>
    <Modal.Overlay onClick={onOverlayClick} />
    <Modal.Content addClass={contentClass}>
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
})
