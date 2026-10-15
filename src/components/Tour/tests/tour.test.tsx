import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import gsap from 'gsap'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Tour } from '../index'
import type { StepType, TourElementProps } from '../types/types'

vi.mock('gsap', () => ({ default: { fromTo: vi.fn(), to: vi.fn() } }))

const STEPS: StepType[] = [
  { target: '#paso-1', content: 'Primer paso', placement: 'bottom' },
  { target: '#paso-2', content: <p data-testid="contenido-react">Segundo paso</p> },
  { target: '#paso-3', content: 'Tercer paso' },
  // Este objetivo no existe en la página: el paso debe ignorarse.
  { target: '#no-existe', content: 'Paso fantasma' },
]

type AppProps = {
  isOpen?: boolean
  onClose?: () => void
  steps?: StepType[]
  modalProps?: TourElementProps
  layerClass?: string
  /** Si es true (por defecto) `steps` se recrea en cada render del padre, como un array inline. */
  freshSteps?: boolean
}

const App = ({
  isOpen = true,
  onClose = () => {},
  steps = STEPS,
  modalProps,
  layerClass,
  freshSteps = true,
}: AppProps) => (
  <>
    <button id="paso-1">Uno</button>
    <button id="paso-2">Dos</button>
    <button id="paso-3">Tres</button>
    <button id="final">Final</button>
    <Tour steps={freshSteps ? [...steps] : steps} isOpen={isOpen} onClose={onClose} finalFocusRef="#final">
      <Tour.Layer addClass={layerClass} />
      <Tour.Modal {...modalProps} />
    </Tour>
  </>
)

let appRoot: HTMLDivElement

beforeEach(() => {
  appRoot = document.createElement('div')
  appRoot.id = 'root'
  document.body.appendChild(appRoot)
})

afterEach(() => {
  appRoot.remove()
})

/**
 * Modela el uso típico: la página se monta con el tour cerrado (así los objetivos ya existen en el
 * DOM) y después se abre. Ver el test "BUG CONOCIDO" sobre pasos que se calculan durante el render.
 */
const renderTour = ({ isOpen = true, ...props }: AppProps = {}) => {
  const utils = render(<App {...props} isOpen={false} />, { container: appRoot })
  if (isOpen) utils.rerender(<App {...props} isOpen />)
  return utils
}
const dialog = () => screen.getByRole('dialog')
const stepLabel = () => dialog().querySelector('.u-sr-only')?.textContent
const next = () => screen.getByRole('button', { name: 'Siguiente' })
const prev = () => screen.getByRole('button', { name: 'Anterior' })
const exit = () => screen.getByRole('button', { name: 'Salir' })

describe('Tour', () => {
  describe('apertura', () => {
    it('no muestra nada mientras isOpen es false', () => {
      renderTour({ isOpen: false })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(document.querySelector('.c-tour-help')).not.toBeInTheDocument()
    })

    it('al abrirse muestra el primer paso como diálogo modal accesible', () => {
      renderTour()

      expect(dialog()).toHaveAttribute('aria-modal', 'true')
      expect(dialog()).toHaveAttribute('aria-label', 'Tour por la plataforma')
      expect(dialog()).toHaveAttribute('tabindex', '-1')
      expect(dialog()).toHaveTextContent('Primer paso')
      expect(stepLabel()).toBe('Parte 1 de 3.')
    })

    it('monta el contenido en un portal fuera de #root', () => {
      renderTour()

      expect(appRoot).not.toContainElement(dialog())
      expect(document.querySelector('[id^="js-tour-"][id$="-parent"]')).toContainElement(dialog())
    })

    it('ignora los pasos cuyo objetivo no existe en la página', () => {
      renderTour()

      expect(stepLabel()).toBe('Parte 1 de 3.')
    })

    it('ignora los pasos sin target', () => {
      renderTour({ steps: [{ content: 'Sin target' }, { target: '#paso-1', content: 'Con target' }] })

      expect(stepLabel()).toBe('Parte 1 de 1.')
      expect(dialog()).toHaveTextContent('Con target')
    })

    it('sigue funcionando cuando isOpen cambia de false a true', () => {
      const { rerender } = renderTour({ isOpen: false })

      rerender(<App isOpen />)

      expect(dialog()).toHaveTextContent('Primer paso')
    })

    // BUG CONOCIDO: los pasos válidos se calculan con `document.querySelector(target)` DENTRO de un
    // `useMemo([steps])`, es decir durante el render, cuando los objetivos de ese mismo render aún
    // no están en el DOM. Si `steps` es estable (una constante o un useMemo) y el tour se monta ya
    // abierto, el resultado vacío queda cacheado y el tour se muestra con 0 pasos ("Parte  de 0.").
    // Cuando se corrija este test fallará: quitar `.fails`.
    it.fails('funciona con un steps estable cuando el tour se monta ya abierto', () => {
      render(<App isOpen freshSteps={false} />, { container: appRoot })

      expect(stepLabel()).toBe('Parte 1 de 3.')
    })
  })

  describe('contenido', () => {
    it('un texto se envuelve en un párrafo con role status', () => {
      renderTour()

      const text = screen.getByText('Primer paso')
      expect(text.tagName).toBe('P')
      expect(text).toHaveAttribute('role', 'status')
      expect(text).toHaveAttribute('aria-live', 'polite')
    })

    it('un elemento React se renderiza tal cual', async () => {
      renderTour()

      await userEvent.click(next())

      expect(screen.getByTestId('contenido-react')).toHaveTextContent('Segundo paso')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('la barra de progreso avanza con cada paso', async () => {
      renderTour()
      const bar = () => dialog().querySelector('.c-tour-progress-bar') as HTMLElement

      expect(bar().style.transform).toBe(`scaleX(${1 / 3})`)

      await userEvent.click(next())
      expect(bar().style.transform).toBe(`scaleX(${2 / 3})`)

      await userEvent.click(next())
      expect(bar().style.transform).toBe('scaleX(1)')
    })

    it('el contenedor lleva un id con el número del paso', async () => {
      renderTour()
      expect(dialog()).toHaveAttribute('id', 'unique-id-tour-element-1')

      await userEvent.click(next())

      expect(dialog()).toHaveAttribute('id', 'unique-id-tour-element-2')
    })
  })

  describe('navegación', () => {
    it('Siguiente avanza de paso hasta el último, donde queda deshabilitado', async () => {
      renderTour()

      await userEvent.click(next())
      expect(stepLabel()).toBe('Parte 2 de 3.')

      await userEvent.click(next())
      expect(stepLabel()).toBe('Parte 3 de 3.')
      expect(dialog()).toHaveTextContent('Tercer paso')
      expect(next()).toBeDisabled()
    })

    it('Anterior vuelve al paso previo y está deshabilitado en el primero', async () => {
      renderTour()
      expect(prev()).toBeDisabled()

      await userEvent.click(next())
      expect(prev()).toBeEnabled()

      await userEvent.click(prev())
      expect(stepLabel()).toBe('Parte 1 de 3.')
      expect(prev()).toBeDisabled()
    })

    it('la capa de ayuda muestra el número del paso actual', async () => {
      renderTour()
      expect(document.querySelector('.c-tour-number')).toHaveTextContent('1')

      await userEvent.click(next())

      expect(document.querySelector('.c-tour-number')).toHaveTextContent('2')
    })
  })

  describe('botones y atributos configurables', () => {
    it('hideCloseButton oculta el botón Salir', () => {
      renderTour({ modalProps: { hideCloseButton: true } })

      expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument()
      expect(next()).toBeInTheDocument()
    })

    it('hideBackButton oculta el botón Anterior', () => {
      renderTour({ modalProps: { hideBackButton: true } })

      expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument()
      expect(exit()).toBeInTheDocument()
    })

    it('permite reemplazar los atributos ARIA del diálogo', () => {
      renderTour({
        modalProps: { ariaAttributes: { role: 'alertdialog', 'aria-label': 'Guía de inicio', tabIndex: 0 } },
      })

      expect(screen.getByRole('alertdialog', { name: 'Guía de inicio' })).toBeInTheDocument()
    })

    it('agrega addClass al diálogo y a la capa de ayuda', () => {
      renderTour({ modalProps: { addClass: 'mi-tour' }, layerClass: 'mi-capa' })

      expect(dialog()).toHaveClass('c-tour-content', 'mi-tour')
      expect(document.querySelector('.c-tour-help')).toHaveClass('mi-capa')
    })
  })

  describe('cierre', () => {
    it('Salir llama a onClose', async () => {
      const onClose = vi.fn()
      renderTour({ onClose })

      await userEvent.click(exit())

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('Salir devuelve el foco al elemento indicado en finalFocusRef', async () => {
      renderTour()

      await userEvent.click(exit())

      expect(screen.getByRole('button', { name: 'Final' })).toHaveFocus()
    })

    it('al reabrir el tour vuelve a empezar desde el primer paso', async () => {
      const { rerender } = renderTour()
      await userEvent.click(next())
      expect(stepLabel()).toBe('Parte 2 de 3.')
      await userEvent.click(exit())

      rerender(<App isOpen={false} />)
      rerender(<App isOpen />)

      expect(stepLabel()).toBe('Parte 1 de 3.')
    })
  })

  describe('bloqueo del resto de la página (#root inert)', () => {
    it('marca #root como inert mientras el tour está abierto', () => {
      renderTour()

      expect(appRoot).toHaveAttribute('inert')
    })

    it('no marca #root como inert si el tour está cerrado', () => {
      renderTour({ isOpen: false })

      expect(appRoot).not.toHaveAttribute('inert')
    })

    it('Salir quita inert de #root', async () => {
      renderTour()

      await userEvent.click(exit())

      expect(appRoot).not.toHaveAttribute('inert')
    })

    // BUG CONOCIDO: el efecto solo ACTIVA `inert` y no tiene limpieza, así que si el padre pone
    // `isOpen={false}` por su cuenta (sin pasar por el botón Salir), #root queda bloqueado.
    // Modal sí lo hace bien (limpia en el `return` del efecto). Cuando se corrija: quitar `.fails`.
    it.fails('quita inert de #root cuando el padre cierra el tour con isOpen=false', () => {
      const { rerender } = renderTour()
      expect(appRoot).toHaveAttribute('inert')

      rerender(<App isOpen={false} />)

      expect(appRoot).not.toHaveAttribute('inert')
    })

    // BUG CONOCIDO: lo mismo al desmontarse con el tour abierto (p. ej. al cambiar de ruta):
    // #root queda inert para siempre. Cuando se corrija: quitar `.fails`.
    it.fails('quita inert de #root si el componente se desmonta con el tour abierto', () => {
      const { unmount } = renderTour()
      expect(appRoot).toHaveAttribute('inert')

      unmount()

      expect(appRoot).not.toHaveAttribute('inert')
    })
  })

  describe('capa de ayuda (Tour.Layer)', () => {
    it('se coloca sobre el elemento objetivo usando su posición y tamaño', () => {
      const original = Element.prototype.getBoundingClientRect
      Element.prototype.getBoundingClientRect = function () {
        return this.id === 'paso-1'
          ? ({ x: 40, y: 60, width: 120, height: 32, top: 60, left: 40, right: 160, bottom: 92, toJSON: () => ({}) } as DOMRect)
          : original.call(this)
      }

      renderTour()
      const layer = document.querySelector('.c-tour-help') as HTMLElement

      expect(layer.style.width).toBe('120px')
      expect(layer.style.height).toBe('32px')
      expect(layer.style.transform).toBe('translate(40px, 60px)')

      Element.prototype.getBoundingClientRect = original
    })

    describe('al redimensionar la ventana', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('recalcula su posición cuando termina el redimensionamiento (con retraso de 500 ms)', () => {
        let rect = { x: 10, y: 10, width: 50, height: 20 }
        const original = Element.prototype.getBoundingClientRect
        Element.prototype.getBoundingClientRect = function () {
          return this.id === 'paso-1'
            ? ({ ...rect, top: rect.y, left: rect.x, right: 0, bottom: 0, toJSON: () => ({}) } as DOMRect)
            : original.call(this)
        }
        renderTour()
        const layer = document.querySelector('.c-tour-help') as HTMLElement
        expect(layer.style.transform).toBe('translate(10px, 10px)')

        rect = { x: 200, y: 100, width: 80, height: 40 }
        act(() => {
          window.dispatchEvent(new Event('resize'))
        })
        act(() => {
          vi.advanceTimersByTime(500)
        })

        expect(layer.style.transform).toBe('translate(200px, 100px)')
        expect(layer.style.width).toBe('80px')

        Element.prototype.getBoundingClientRect = original
      })
    })
  })

  describe('animaciones', () => {
    it('anima la entrada del diálogo y de la capa de ayuda con gsap', () => {
      vi.mocked(gsap.fromTo).mockClear()
      renderTour()

      const targets = vi.mocked(gsap.fromTo).mock.calls.map(([target]) => target)
      expect(targets).toContain(dialog())
      expect(targets).toContain(document.querySelector('.c-tour-help'))
    })

    it('vuelve a animar el diálogo en cada paso', async () => {
      renderTour()
      vi.mocked(gsap.fromTo).mockClear()

      await userEvent.click(next())

      const targets = vi.mocked(gsap.fromTo).mock.calls.map(([target]) => target)
      expect(targets).toContain(dialog())
    })
  })
})
