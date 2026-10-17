import { createContext, createRef, StrictMode, useContext, useState } from 'react'

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { announce } from '@atlaskit/pragmatic-drag-and-drop-live-region'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DragAndDrop, useDragAndDropContext } from '../index'
import type { DragAndDropProps, ItemType } from '../types/types'
import { DragAndDropTypes } from '../utils/const'

/**
 * `@atlaskit/pragmatic-drag-and-drop` engancha eventos nativos de arrastre que jsdom no puede
 * simular de forma fiel. Se sustituye el adaptador por un doble que solo registra lo que cada
 * componente le pide; así se prueba la lógica propia (movimientos, validación, reordenamiento)
 * invocando directamente los callbacks del monitor, y la ruta accesible (menú) con eventos reales.
 *
 * El módulo de anuncios también se sustituye, para comprobar qué se le pide anunciar.
 */
vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: vi.fn(() => vi.fn()),
  dropTargetForElements: vi.fn(() => vi.fn()),
  monitorForElements: vi.fn(() => vi.fn()),
}))

vi.mock('@atlaskit/pragmatic-drag-and-drop-live-region', () => ({ announce: vi.fn() }))

type Config = Record<string, any>

/** Configuración con la que se registró un elemento: la más reciente, porque los efectos se repiten. */
const configFor = (fn: unknown, element: Element): Config | undefined => {
  const calls = vi.mocked(fn as () => void).mock.calls as unknown as Config[][]
  return [...calls].reverse().find(([config]) => config.element === element)?.[0]
}
const lastCall = (fn: unknown): Config => {
  const calls = vi.mocked(fn as () => void).mock.calls as unknown as Config[][]
  return calls[calls.length - 1][0]
}
const monitor = () => lastCall(monitorForElements)

const dragEl = (id: string) => document.querySelector(`[data-drag-id="${id}"]`) as HTMLElement
const zoneEl = (id: string) => document.querySelector(`[data-drop-id="${id}"]`) as HTMLElement
/** Id del contenedor/zona en el que está actualmente un elemento arrastrable. */
const whereIs = (dragId: string) => dragEl(dragId)?.closest('[data-drop-id]')?.getAttribute('data-drop-id')
const idsIn = (zoneId: string) =>
  Array.from(zoneEl(zoneId).querySelectorAll('[data-drag-id]')).map((el) => el.getAttribute('data-drag-id'))

type ExampleProps = Partial<DragAndDropProps>

const Example = (props: ExampleProps) => (
  <DragAndDrop id="dnd" {...props}>
    <div>
      <DragAndDrop.Container id="origen" label="Origen">
        <DragAndDrop.Drag id="A" label="Opción A">
          Alfa
        </DragAndDrop.Drag>
        <DragAndDrop.Drag id="B" label="Opción B">
          Beta
        </DragAndDrop.Drag>
      </DragAndDrop.Container>
      <DragAndDrop.Drop id="zona-1" label="Zona 1" validate={['A']} />
      <DragAndDrop.Drop id="zona-2" label="Zona 2" validate={['B']} />
    </div>
  </DragAndDrop>
)

const moveButton = (dragLabel: string) => screen.getByRole('button', { name: `Mover ${dragLabel}` })

/** Mueve un elemento a una zona usando el menú (la ruta accesible por teclado). */
const moveWithMenu = async (dragLabel: string, zoneLabel: string) => {
  await userEvent.click(moveButton(dragLabel))
  await userEvent.click(await screen.findByRole('button', { name: `Mover a ${zoneLabel}` }))
}

/** Reordena un elemento con el menú. */
const reorderWithMenu = async (dragLabel: string, option: string) => {
  await userEvent.click(moveButton(dragLabel))
  await userEvent.click(await screen.findByRole('button', { name: option }))
}

/** Simula arrastrar y soltar con el puntero, invocando el monitor con lo que la librería enviaría. */
const dragAndDrop = (dragId: string, zoneId: string) => {
  const element = dragEl(dragId)
  const source = { element, data: configFor(draggable, element)!.getInitialData() }
  const target = configFor(dropTargetForElements, zoneEl(zoneId))!

  act(() => {
    monitor().onDragStart({ source })
  })
  act(() => {
    monitor().onDrop({
      source,
      location: { current: { dropTargets: [{ element: target.element, data: target.getData() }] } },
    })
  })
}

beforeEach(() => {
  vi.mocked(draggable).mockReset().mockImplementation(() => vi.fn())
  vi.mocked(dropTargetForElements).mockReset().mockImplementation(() => vi.fn())
  vi.mocked(monitorForElements).mockReset().mockImplementation(() => vi.fn())
  vi.mocked(announce).mockClear()
})

describe('DragAndDrop', () => {
  describe('estructura inicial', () => {
    it('coloca cada elemento arrastrable dentro de la zona donde se declaró', () => {
      render(<Example />)

      expect(idsIn('origen')).toEqual(['A', 'B'])
      expect(idsIn('zona-1')).toEqual([])
      expect(idsIn('zona-2')).toEqual([])
    })

    it('las zonas son grupos con su label y sus atributos de identificación', () => {
      render(<Example />)

      expect(screen.getByRole('group', { name: 'Origen' })).toHaveAttribute('data-type', DragAndDropTypes.CONTAINER)
      expect(screen.getByRole('group', { name: 'Zona 1, vacío' })).toHaveAttribute('data-type', DragAndDropTypes.DROPPABLE)
      expect(zoneEl('zona-1')).toHaveAttribute('data-drop-id', 'zona-1')
    })

    it('una zona vacía se anuncia como vacía y deja de estarlo al recibir un elemento', async () => {
      render(<Example />)
      expect(zoneEl('zona-1')).toHaveAttribute('aria-label', 'Zona 1, vacío')
      expect(zoneEl('zona-1')).toHaveAttribute('data-empty', 'true')

      await moveWithMenu('Opción A', 'Zona 1')

      expect(zoneEl('zona-1')).toHaveAttribute('aria-label', 'Zona 1')
      expect(zoneEl('zona-1')).not.toHaveAttribute('data-empty')
      expect(zoneEl('origen')).toHaveAttribute('aria-label', 'Origen')
    })

    it('los elementos arrastrables muestran su contenido y su control de movimiento accesible', () => {
      render(<Example />)

      expect(dragEl('A')).toHaveTextContent('Alfa')
      expect(dragEl('A')).toHaveAttribute('data-type', DragAndDropTypes.DRAGGABLE)
      expect(moveButton('Opción A')).toHaveAttribute('data-type', DragAndDropTypes.DRAGGABLE_MOVE_BUTTON)
    })

    it('agrega addClass y className a los elementos y zonas', () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="c" label="C" addClass="mi-contenedor" className="extra">
            <DragAndDrop.Drag id="A" label="A" addClass="mi-drag">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Z" addClass="mi-zona" />
        </DragAndDrop>
      )

      expect(zoneEl('c')).toHaveClass('c-droppable', 'mi-contenedor', 'extra')
      expect(dragEl('A')).toHaveClass('c-draggable', 'mi-drag')
      expect(zoneEl('z')).toHaveClass('c-droppable', 'mi-zona')
    })

    it('respeta defaultState para la posición inicial', () => {
      const defaultState: ItemType = { origen: ['B'], 'zona-1': ['A'], 'zona-2': [] }
      render(<Example defaultState={defaultState} />)

      expect(whereIs('A')).toBe('zona-1')
      expect(whereIs('B')).toBe('origen')
      expect(document.querySelectorAll('[data-drag-id="A"]')).toHaveLength(1)
    })
  })

  describe('flexibilidad de la estructura', () => {
    it('el contenido propio de contenedores y zonas se conserva, también después de mover', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="banco" label="Banco">
            <h3 data-testid="titulo-banco">Banco de palabras</h3>
            <DragAndDrop.Drag id="A" label="Alfa">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Zona">
            <p data-testid="placeholder">Suelta aquí</p>
          </DragAndDrop.Drop>
        </DragAndDrop>
      )
      expect(screen.getByTestId('titulo-banco')).toBeInTheDocument()
      expect(screen.getByTestId('placeholder')).toBeInTheDocument()

      await moveWithMenu('Alfa', 'Zona')

      expect(whereIs('A')).toBe('z')
      expect(screen.getByTestId('titulo-banco')).toBeInTheDocument()
      expect(screen.getByTestId('placeholder')).toBeInTheDocument()
    })

    it('un wrapper entre la zona y el drag se conserva y queda vacío cuando el drag se va', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="banco" label="Banco">
            <div data-testid="celda">
              <DragAndDrop.Drag id="A" label="Alfa">
                Alfa
              </DragAndDrop.Drag>
            </div>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Zona" />
        </DragAndDrop>
      )
      expect(dragEl('A').closest('[data-testid="celda"]')).not.toBeNull()

      await moveWithMenu('Alfa', 'Zona')

      expect(whereIs('A')).toBe('z')
      expect(screen.getByTestId('celda')).toBeEmptyDOMElement()
    })

    it('un Container o un Drag dentro de un componente propio funciona igual', async () => {
      const Slot = ({ id }: { id: string }) => (
        <DragAndDrop.Container id={`slot-${id}`} label={`Slot ${id}`} homeOnly>
          <DragAndDrop.Drag id={id} label={`Palabra ${id}`}>
            {id}
          </DragAndDrop.Drag>
        </DragAndDrop.Container>
      )
      render(
        <DragAndDrop id="dnd">
          <Slot id="A" />
          <Slot id="B" />
          <DragAndDrop.Drop id="z" label="Zona" />
        </DragAndDrop>
      )

      await moveWithMenu('Palabra A', 'Zona')

      expect(whereIs('A')).toBe('z')
      expect(whereIs('B')).toBe('slot-B')
    })

    it('el drag conserva el contexto de React de donde se declaró cuando está en otra zona', async () => {
      const Tema = createContext('claro')
      const Chip = () => <i data-testid="chip">{useContext(Tema)}</i>
      render(
        <DragAndDrop id="dnd">
          <Tema.Provider value="oscuro">
            <DragAndDrop.Container id="banco" label="Banco">
              <DragAndDrop.Drag id="A" label="Alfa">
                <Chip />
              </DragAndDrop.Drag>
            </DragAndDrop.Container>
          </Tema.Provider>
          <DragAndDrop.Drop id="z" label="Zona" />
        </DragAndDrop>
      )

      await moveWithMenu('Alfa', 'Zona')

      expect(whereIs('A')).toBe('z')
      expect(screen.getByTestId('chip')).toHaveTextContent('oscuro')
    })

    it('DragAndDrop.Items marca dónde se pintan los drags que llegan a una zona con contenido propio', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="banco" label="Banco">
            <DragAndDrop.Drag id="A" label="Alfa">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Zona" capacity={Infinity}>
            <h4>Título</h4>
            <div data-testid="lista">
              <DragAndDrop.Items />
            </div>
            <p data-testid="pie">Pie</p>
          </DragAndDrop.Drop>
        </DragAndDrop>
      )

      await moveWithMenu('Alfa', 'Zona')

      expect(screen.getByTestId('lista')).toContainElement(dragEl('A'))
      expect(document.querySelectorAll('[data-dnd-slot="A"]')).toHaveLength(1)
      expect(screen.getByTestId('pie')).toBeInTheDocument()
    })

    it('sin DragAndDrop.Items los drags que llegan se pintan al final de la zona', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="banco" label="Banco">
            <DragAndDrop.Drag id="A" label="Alfa">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Zona">
            <p data-testid="contenido">Contenido</p>
          </DragAndDrop.Drop>
        </DragAndDrop>
      )

      await moveWithMenu('Alfa', 'Zona')

      const zona = zoneEl('z')
      expect(zona.firstElementChild).toBe(screen.getByTestId('contenido'))
      expect(zona.contains(dragEl('A'))).toBe(true)
    })

    it('un Drag fuera de una zona, o fuera de DragAndDrop, falla con un mensaje claro', () => {
      // React y jsdom escriben en consola cualquier error de render aunque la prueba lo espere.
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const silence = (event: ErrorEvent) => event.preventDefault()
      window.addEventListener('error', silence)

      expect(() =>
        render(
          <DragAndDrop id="dnd">
            <DragAndDrop.Drag id="A" label="A">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop>
        )
      ).toThrow('debe estar dentro de un <DragAndDrop.Container> o un <DragAndDrop.Drop>')

      expect(() =>
        render(
          <DragAndDrop.Container id="c" label="C">
            x
          </DragAndDrop.Container>
        )
      ).toThrow('deben usarse dentro de <DragAndDrop>')

      window.removeEventListener('error', silence)
      error.mockRestore()
    })
  })

  describe('registro con pragmatic-drag-and-drop', () => {
    it('registra cada elemento como arrastrable, cada zona como destino y un monitor global', () => {
      render(<Example />)

      expect(draggable).toHaveBeenCalledTimes(2)
      expect(dropTargetForElements).toHaveBeenCalledTimes(3) // 2 zonas + 1 contenedor
      expect(monitorForElements).toHaveBeenCalled()
    })

    it('entrega a la librería el id del elemento y permite arrastrar mientras no se valida', () => {
      render(<Example />)
      const configA = configFor(draggable, dragEl('A'))!

      expect(configA.getInitialData()).toEqual({ id: 'A', storeKey: expect.any(String) })
      expect(configA.canDrag()).toBe(true)
    })

    it('un elemento con dragDisabled no se registra como arrastrable y su botón de mover se deshabilita', () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="c" label="C">
            <DragAndDrop.Drag id="A" label="A" dragDisabled>
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </DragAndDrop>
      )

      expect(draggable).not.toHaveBeenCalled()
      expect(moveButton('A')).toBeDisabled()
    })

    it('limpia los registros al desmontar', () => {
      const cleanups = { drag: vi.fn(), drop: vi.fn(), monitor: vi.fn() }
      vi.mocked(draggable).mockReturnValue(cleanups.drag)
      vi.mocked(dropTargetForElements).mockReturnValue(cleanups.drop)
      vi.mocked(monitorForElements).mockReturnValue(cleanups.monitor)
      const { unmount } = render(<Example />)

      unmount()

      expect(cleanups.drag).toHaveBeenCalled()
      expect(cleanups.drop).toHaveBeenCalled()
      expect(cleanups.monitor).toHaveBeenCalled()
    })

    describe('refs recibidas por los subcomponentes', () => {
      it('un Draggable con ref (objeto o callback) se registra como arrastrable y recibe su elemento', () => {
        const objectRef = createRef<HTMLDivElement>()
        const callbackRef = vi.fn()
        render(
          <DragAndDrop id="dnd">
            <DragAndDrop.Container id="c" label="C">
              <DragAndDrop.Drag id="A" label="A" ref={objectRef}>
                Alfa
              </DragAndDrop.Drag>
              <DragAndDrop.Drag id="B" label="B" ref={callbackRef}>
                Beta
              </DragAndDrop.Drag>
            </DragAndDrop.Container>
          </DragAndDrop>
        )

        expect(draggable).toHaveBeenCalledTimes(2)
        expect(objectRef.current).toBe(dragEl('A'))
        expect(callbackRef).toHaveBeenCalledWith(dragEl('B'))
      })

      it('una Drop y un Container con ref (objeto o callback) se registran como destino y reciben su elemento', () => {
        const objectRef = createRef<HTMLDivElement>()
        const callbackRef = vi.fn()
        render(
          <DragAndDrop id="dnd">
            <div>
              <DragAndDrop.Drop id="z1" label="Z1" ref={objectRef} />
              <DragAndDrop.Container id="c1" label="C1" ref={callbackRef}>
                vacío
              </DragAndDrop.Container>
            </div>
          </DragAndDrop>
        )

        expect(dropTargetForElements).toHaveBeenCalledTimes(2)
        expect(objectRef.current).toBe(zoneEl('z1'))
        expect(callbackRef).toHaveBeenCalledWith(zoneEl('c1'))
      })
    })

    describe('dos DragAndDrop en la misma página con los mismos ids', () => {
      const renderTwo = () =>
        render(
          <>
            <div data-testid="uno">
              <Example />
            </div>
            <div data-testid="dos">
              <Example />
            </div>
          </>
        )

      it('cada uno atiende solo sus propios elementos', () => {
        renderTwo()
        const monitors = vi.mocked(monitorForElements).mock.calls.map(([config]) => config as Config)
        const [uno, dos] = [screen.getByTestId('uno'), screen.getByTestId('dos')]
        const dragUno = configFor(draggable, uno.querySelector('[data-drag-id="A"]')!)!
        const dragDos = configFor(draggable, dos.querySelector('[data-drag-id="A"]')!)!
        const sourceUno = { data: dragUno.getInitialData() }
        const sourceDos = { data: dragDos.getInitialData() }

        expect(sourceUno.data.storeKey).not.toBe(sourceDos.data.storeKey)
        expect(monitors.filter((config) => config.canMonitor({ source: sourceUno }))).toHaveLength(1)
        expect(monitors.filter((config) => config.canMonitor({ source: sourceDos }))).toHaveLength(1)
      })

      it('una zona no acepta elementos de la otra instancia', () => {
        renderTwo()
        const [uno, dos] = [screen.getByTestId('uno'), screen.getByTestId('dos')]
        const source = { data: configFor(draggable, uno.querySelector('[data-drag-id="A"]')!)!.getInitialData() }
        const zonaPropia = configFor(dropTargetForElements, uno.querySelector('[data-drop-id="zona-1"]')!)!
        const zonaAjena = configFor(dropTargetForElements, dos.querySelector('[data-drop-id="zona-1"]')!)!

        expect(zonaPropia.canDrop({ source })).toBe(true)
        expect(zonaAjena.canDrop({ source })).toBe(false)
      })
    })

    it('una zona no acepta el soltar de un elemento que ya está en ella ni de uno ajeno a su dueño', () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="celda-A" label="Celda de A" homeOnly>
            <DragAndDrop.Drag id="A" label="A">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Container id="celda-B" label="Celda de B" homeOnly>
            <DragAndDrop.Drag id="B" label="B">
              Beta
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </DragAndDrop>
      )
      const sourceA = { data: configFor(draggable, dragEl('A'))!.getInitialData() }

      expect(configFor(dropTargetForElements, zoneEl('celda-A'))!.canDrop({ source: sourceA })).toBe(false)
      expect(configFor(dropTargetForElements, zoneEl('celda-B'))!.canDrop({ source: sourceA })).toBe(false)
    })

    it('mientras un drag compatible está encima de una zona, esta recibe data-over y la clase over', () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="c" label="C">
            <DragAndDrop.Drag id="A" label="A">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Z" over="mi-over" />
        </DragAndDrop>
      )
      const config = configFor(dropTargetForElements, zoneEl('z'))!

      act(() => config.onDragEnter())
      expect(zoneEl('z')).toHaveAttribute('data-over', 'true')
      expect(zoneEl('z')).toHaveClass('c-droppable--active', 'mi-over')

      act(() => config.onDragLeave())
      expect(zoneEl('z')).not.toHaveAttribute('data-over')
      expect(zoneEl('z')).not.toHaveClass('mi-over')
    })
  })

  describe('mover con el menú (teclado)', () => {
    it('el menú ofrece mover a cada zona menos a la actual', async () => {
      render(<Example />)

      await userEvent.click(moveButton('Opción A'))

      expect(await screen.findByRole('button', { name: 'Mover a Zona 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Mover a Zona 2' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Mover a Origen' })).not.toBeInTheDocument()
    })

    it('mueve el elemento a la zona elegida y cierra el menú', async () => {
      render(<Example />)

      await moveWithMenu('Opción A', 'Zona 1')

      expect(whereIs('A')).toBe('zona-1')
      expect(idsIn('origen')).toEqual(['B'])
      expect(screen.queryByRole('button', { name: /^Mover a / })).not.toBeInTheDocument()
    })

    it('un elemento puede regresar al contenedor de origen', async () => {
      render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción A', 'Origen')

      expect(whereIs('A')).toBe('origen')
    })

    it('un elemento nunca queda duplicado en varias zonas', async () => {
      render(<Example />)

      await moveWithMenu('Opción A', 'Zona 1')
      await moveWithMenu('Opción A', 'Zona 2')

      expect(document.querySelectorAll('[data-drag-id="A"]')).toHaveLength(1)
      expect(whereIs('A')).toBe('zona-2')
    })

    it('una Drop acepta un solo elemento: el anterior vuelve a su zona de origen', async () => {
      render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción B', 'Zona 1')

      expect(whereIs('B')).toBe('zona-1')
      expect(whereIs('A')).toBe('origen')
    })

    it('con capacity permite varios elementos en la misma zona', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="origen" label="Origen">
            <DragAndDrop.Drag id="A" label="Opción A">
              Alfa
            </DragAndDrop.Drag>
            <DragAndDrop.Drag id="B" label="Opción B">
              Beta
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="zona-1" label="Zona 1" capacity={Infinity} />
        </DragAndDrop>
      )
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción B', 'Zona 1')

      expect(idsIn('zona-1').sort()).toEqual(['A', 'B'])
    })

    it('un contenedor por drag: el desplazado vuelve a su propio contenedor, no al último', async () => {
      render(
        <DragAndDrop id="dnd">
          {['A', 'B', 'C'].map((id) => (
            <DragAndDrop.Container key={id} id={`slot-${id}`} label={`Slot ${id}`} homeOnly>
              <DragAndDrop.Drag id={id} label={`Palabra ${id}`}>
                {id}
              </DragAndDrop.Drag>
            </DragAndDrop.Container>
          ))}
          <DragAndDrop.Drop id="z" label="Zona" />
        </DragAndDrop>
      )
      await moveWithMenu('Palabra A', 'Zona')

      await moveWithMenu('Palabra B', 'Zona')

      expect(whereIs('B')).toBe('z')
      expect(whereIs('A')).toBe('slot-A')
      expect(whereIs('C')).toBe('slot-C')
      expect(idsIn('slot-C')).toEqual(['C'])
    })

    it('en el menú de un drag no aparecen las celdas exclusivas de los demás', async () => {
      render(
        <DragAndDrop id="dnd">
          {['A', 'B'].map((id) => (
            <DragAndDrop.Container key={id} id={`celda-${id}`} label={`Celda ${id}`} homeOnly>
              <DragAndDrop.Drag id={id} label={`Palabra ${id}`}>
                {id}
              </DragAndDrop.Drag>
            </DragAndDrop.Container>
          ))}
          <DragAndDrop.Drop id="z" label="Zona" />
        </DragAndDrop>
      )

      await userEvent.click(moveButton('Palabra A'))

      expect(await screen.findByRole('button', { name: 'Mover a Zona' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Mover a Celda B' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Mover a Celda A' })).not.toBeInTheDocument()
    })

    it('devolver una palabra al banco no cambia a las demás de lugar', async () => {
      // Caso que fallaba antes: la primera palabra del banco saltaba al final.
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="banco" label="Banco">
            {['01', '02', '03', '04', '05'].map((id) => (
              <DragAndDrop.Drag key={id} id={id} label={`w${id}`}>
                {id}
              </DragAndDrop.Drag>
            ))}
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Zona" />
        </DragAndDrop>
      )
      await moveWithMenu('w04', 'Zona')

      await moveWithMenu('w04', 'Banco')

      expect(idsIn('banco')).toEqual(['01', '02', '03', '04', '05'])
    })

    it('si no hay ningún lugar disponible, el menú lo dice', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="solo" label="Solo">
            <DragAndDrop.Drag id="A" label="Opción A">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </DragAndDrop>
      )

      await userEvent.click(moveButton('Opción A'))

      expect(await screen.findByText('No hay lugares disponibles.')).toBeVisible()
    })
  })

  describe('anuncios para lectores de pantalla', () => {
    it('anuncia el nombre del elemento, de dónde viene y a dónde va', async () => {
      render(<Example />)

      await moveWithMenu('Opción A', 'Zona 1')

      expect(announce).toHaveBeenLastCalledWith('«Opción A» movido a «Zona 1», desde «Origen».')
    })

    it('si un elemento desplaza a otro, también lo anuncia', async () => {
      render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción B', 'Zona 1')

      expect(announce).toHaveBeenLastCalledWith(
        '«Opción B» movido a «Zona 1», desde «Origen». «Opción A» volvió a «Origen».'
      )
    })

    it('anuncia también los movimientos hechos arrastrando', () => {
      render(<Example />)

      dragAndDrop('A', 'zona-1')

      expect(announce).toHaveBeenLastCalledWith('«Opción A» movido a «Zona 1», desde «Origen».')
    })

    it('los textos se pueden personalizar con messages', async () => {
      render(
        <Example
          messages={{
            moveButton: ({ drag }) => `Move ${drag}`,
            moveTo: ({ zone }) => `Move to ${zone}`,
            moved: ({ drag, to }) => `${drag} moved to ${to}`,
          }}
        />
      )

      await userEvent.click(screen.getByRole('button', { name: 'Move Opción A' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Move to Zona 1' }))

      expect(announce).toHaveBeenLastCalledWith('Opción A moved to Zona 1')
    })

    it('un movimiento que no ocurre no anuncia nada', () => {
      render(<Example />)
      const source = { element: dragEl('A'), data: configFor(draggable, dragEl('A'))!.getInitialData() }

      act(() => {
        monitor().onDrop({ source, location: { current: { dropTargets: [] } } })
      })

      expect(announce).not.toHaveBeenCalled()
    })
  })

  describe('foco', () => {
    it('tras mover con el menú, el foco vuelve al botón del elemento en su nuevo lugar', async () => {
      render(<Example />)

      await moveWithMenu('Opción A', 'Zona 1')

      expect(whereIs('A')).toBe('zona-1')
      expect(moveButton('Opción A')).toHaveFocus()
    })

    it('tras mover de una zona ajena a otra zona ajena, el foco tampoco se pierde', async () => {
      // El drag sale de un marcador que se desmonta en el mismo momento en que llega al nuevo.
      render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción A', 'Zona 2')

      expect(whereIs('A')).toBe('zona-2')
      expect(moveButton('Opción A')).toHaveFocus()
    })

    it('tras mover un elemento declarado en un wrapper, el foco tampoco se pierde', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="banco" label="Banco" homeOnly>
            <div>
              <DragAndDrop.Drag id="A" label="Alfa">
                Alfa
              </DragAndDrop.Drag>
            </div>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Zona" />
        </DragAndDrop>
      )

      await moveWithMenu('Alfa', 'Zona')
      expect(moveButton('Alfa')).toHaveFocus()

      await moveWithMenu('Alfa', 'Banco')
      expect(moveButton('Alfa')).toHaveFocus()
    })
  })

  describe('mover arrastrando (eventos del monitor)', () => {
    it('al empezar a arrastrar, la API expone qué elemento se está arrastrando y el elemento se marca', () => {
      let dragging: string | null = null
      const Probe = () => {
        dragging = useDragAndDropContext().isDragging
        return null
      }
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="c" label="C">
            <DragAndDrop.Drag id="A" label="A" dragging="arrastrando">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <Probe />
        </DragAndDrop>
      )
      expect(dragging).toBeNull()
      const source = { element: dragEl('A'), data: configFor(draggable, dragEl('A'))!.getInitialData() }

      act(() => {
        monitor().onDragStart({ source })
      })

      expect(dragging).toBe('A')
      expect(dragEl('A')).toHaveAttribute('data-dragging', 'true')
      expect(dragEl('A')).toHaveClass('arrastrando')

      act(() => {
        monitor().onDrop({ source, location: { current: { dropTargets: [] } } })
      })

      expect(dragging).toBeNull()
      expect(dragEl('A')).not.toHaveAttribute('data-dragging')
    })

    it('al soltar sobre una zona mueve el elemento', () => {
      render(<Example />)

      dragAndDrop('A', 'zona-1')

      expect(whereIs('A')).toBe('zona-1')
    })

    it('soltar fuera de cualquier zona no mueve nada', () => {
      render(<Example />)
      const source = { element: dragEl('A'), data: configFor(draggable, dragEl('A'))!.getInitialData() }

      act(() => {
        monitor().onDragStart({ source })
      })
      act(() => {
        monitor().onDrop({ source, location: { current: { dropTargets: [] } } })
      })

      expect(whereIs('A')).toBe('origen')
    })

    it('soltar sobre un destino que no es una zona del componente no mueve nada', () => {
      render(<Example />)
      const source = { element: dragEl('A'), data: configFor(draggable, dragEl('A'))!.getInitialData() }

      act(() => {
        monitor().onDrop({
          source,
          location: { current: { dropTargets: [{ element: document.createElement('div'), data: {} }] } },
        })
      })

      expect(whereIs('A')).toBe('origen')
    })
  })

  describe('validación', () => {
    it('al colocar un elemento en una zona que lo acepta, onValidate lo informa como válido', async () => {
      const onValidate = vi.fn()
      render(<Example onValidate={onValidate} />)

      await moveWithMenu('Opción A', 'Zona 1')

      await waitFor(() => expect(onValidate).toHaveBeenLastCalledWith({ validate: ['A'], active: true }))
    })

    it('al colocarlo en una zona que no lo acepta, no queda como válido', async () => {
      const onValidate = vi.fn()
      render(<Example onValidate={onValidate} />)

      await moveWithMenu('Opción A', 'Zona 2')

      await waitFor(() => expect(onValidate).toHaveBeenLastCalledWith({ validate: [], active: true }))
    })

    it('al sacar un elemento válido de su zona deja de ser válido', async () => {
      const onValidate = vi.fn()
      render(<Example onValidate={onValidate} />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción A', 'Origen')

      await waitFor(() => expect(onValidate).toHaveBeenLastCalledWith({ validate: [], active: true }))
    })

    it('un elemento desplazado fuera de su zona deja de contar como válido', async () => {
      const onValidate = vi.fn()
      render(<Example onValidate={onValidate} />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción B', 'Zona 1')

      // B no es válido en la zona 1 y A fue desplazado al origen: ninguno debería ser válido.
      await waitFor(() => expect(onValidate).toHaveBeenLastCalledWith({ validate: [], active: true }))
    })

    it('un elemento vuelve a ser válido al regresar a su zona después de haber sido desplazado', async () => {
      const onValidate = vi.fn()
      render(<Example onValidate={onValidate} />)
      await moveWithMenu('Opción A', 'Zona 1')
      await moveWithMenu('Opción B', 'Zona 1') // desplaza a A

      await moveWithMenu('Opción A', 'Zona 1') // A regresa y desplaza a B

      expect(whereIs('A')).toBe('zona-1')
      expect(whereIs('B')).toBe('origen')
      await waitFor(() => expect(onValidate).toHaveBeenLastCalledWith({ validate: ['A'], active: true }))
    })

    it('con validate=true un elemento en una zona que no lo acepta se marca como incorrecto', async () => {
      const { rerender } = render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')
      await moveWithMenu('Opción B', 'Zona 1') // B no es válido en la zona 1

      rerender(<Example validate />)

      expect(dragEl('B')).toHaveAttribute('data-validation', 'false')
    })

    it('con validate=true marca como correcto lo que está en su zona', async () => {
      const { rerender } = render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')
      await moveWithMenu('Opción B', 'Zona 2')

      rerender(<Example validate />)

      expect(dragEl('A')).toHaveAttribute('data-validation', 'true')
      expect(dragEl('B')).toHaveAttribute('data-validation', 'true')
    })

    it('con validate=true cada elemento dice en texto si está bien o mal, no solo con un atributo', async () => {
      const { rerender } = render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')

      rerender(<Example validate />)

      expect(dragEl('A')).toHaveTextContent('Correcto')
      expect(dragEl('B')).toHaveTextContent('Incorrecto')
    })

    it('sin validate no agrega data-validation ni texto de resultado', () => {
      render(<Example />)

      expect(dragEl('A')).not.toHaveAttribute('data-validation')
      expect(dragEl('A')).not.toHaveTextContent(/Correcto|Incorrecto/)
    })

    it('con validate=true se bloquea el movimiento: botones deshabilitados y la librería no deja arrastrar ni soltar', () => {
      render(<Example validate />)

      screen.getAllByRole('button', { name: /^Mover / }).forEach((button) => expect(button).toBeDisabled())
      const source = { data: configFor(draggable, dragEl('A'))!.getInitialData() }
      expect(configFor(draggable, dragEl('A'))!.canDrag()).toBe(false)
      expect(configFor(dropTargetForElements, zoneEl('zona-1'))!.canDrop({ source })).toBe(false)
    })

    it('la validez sale de las posiciones: con defaultState y validate se marcan según dónde está cada uno', () => {
      render(<Example validate defaultState={{ origen: ['B'], 'zona-1': ['A'], 'zona-2': [] }} />)

      expect(dragEl('A')).toHaveAttribute('data-validation', 'true')
      expect(dragEl('B')).toHaveAttribute('data-validation', 'false')
    })
  })

  describe('elementos deshabilitados (dragDisabled)', () => {
    /** Una frase con un espacio ya completado: el elemento fijo se declara dentro de la propia zona. */
    const WithHint = ({ extra, ...props }: ExampleProps & { extra?: React.ReactNode }) => (
      <DragAndDrop id="dnd" {...props}>
        <DragAndDrop.Container id="banco" label="Banco">
          <DragAndDrop.Drag id="B" label="Movible">
            Beta
          </DragAndDrop.Drag>
        </DragAndDrop.Container>
        <DragAndDrop.Drop id="pista" label="Espacio con pista" validate={['A']}>
          <DragAndDrop.Drag id="A" label="Fijo" dragDisabled>
            Alfa
          </DragAndDrop.Drag>
        </DragAndDrop.Drop>
        <DragAndDrop.Drop id="libre" label="Espacio libre" validate={['B']} />
        {extra}
      </DragAndDrop>
    )

    const ResetButton = () => {
      const { handleResetDnd } = useDragAndDropContext()
      return <button onClick={handleResetDnd}>Reiniciar</button>
    }

    it('no se puede arrastrar ni mover con el menú, y se marca con data-disabled', () => {
      render(<WithHint />)

      expect(configFor(draggable, dragEl('A'))).toBeUndefined()
      expect(moveButton('Fijo')).toBeDisabled()
      expect(dragEl('A')).toHaveAttribute('data-disabled', 'true')
      expect(dragEl('B')).not.toHaveAttribute('data-disabled')
    })

    it('otro elemento no puede desplazarlo: la zona no se ofrece como destino', async () => {
      render(<WithHint />)

      await userEvent.click(moveButton('Movible'))

      expect(await screen.findByRole('button', { name: 'Mover a Espacio libre' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Mover a Espacio con pista' })).not.toBeInTheDocument()
      expect(whereIs('A')).toBe('pista')
    })

    it('arrastrando, la zona que ocupa no acepta soltar otro elemento y soltar allí no cambia nada', () => {
      render(<WithHint />)
      const source = { element: dragEl('B'), data: configFor(draggable, dragEl('B'))!.getInitialData() }

      expect(configFor(dropTargetForElements, zoneEl('pista'))!.canDrop({ source })).toBe(false)
      expect(configFor(dropTargetForElements, zoneEl('libre'))!.canDrop({ source })).toBe(true)
    })

    it('aunque se coloque con defaultState en una zona de capacidad 1, otro elemento no lo desplaza', async () => {
      // Caso que fallaba antes: el elemento fijo volvía al banco cuando llegaba otro a su zona.
      render(
        <DragAndDrop id="dnd" defaultState={{ banco: ['B'], zona: ['A'] }}>
          <DragAndDrop.Container id="banco" label="Banco">
            <DragAndDrop.Drag id="A" label="Fijo" dragDisabled>
              Alfa
            </DragAndDrop.Drag>
            <DragAndDrop.Drag id="B" label="Movible">
              Beta
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="zona" label="Zona" />
        </DragAndDrop>
      )
      expect(whereIs('A')).toBe('zona')

      await userEvent.click(moveButton('Movible'))

      const menu = await screen.findByRole('dialog', { name: 'Opciones para mover Movible' })
      expect(screen.queryByRole('button', { name: 'Mover a Zona' })).not.toBeInTheDocument()
      expect(within(menu).getByText('No hay lugares disponibles.')).toBeInTheDocument()
      expect(whereIs('A')).toBe('zona')
      expect(whereIs('B')).toBe('banco')
    })

    it('tampoco se mueve ni desplaza por código con handleDragMove', () => {
      let api: ReturnType<typeof useDragAndDropContext>
      const Probe = () => {
        api = useDragAndDropContext()
        return null
      }
      render(<WithHint extra={<Probe />} />)

      act(() => api.handleDragMove('A', 'libre'))
      act(() => api.handleDragMove('B', 'pista'))

      expect(whereIs('A')).toBe('pista')
      expect(whereIs('B')).toBe('banco')
    })

    it('al reiniciar sigue en su zona', async () => {
      render(<WithHint extra={<ResetButton />} />)
      await moveWithMenu('Movible', 'Espacio libre')
      expect(whereIs('B')).toBe('libre')

      await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))

      expect(whereIs('B')).toBe('banco')
      expect(whereIs('A')).toBe('pista')
    })

    it('al comprobar, el elemento fijo cuenta como correcto en su zona', () => {
      render(<WithHint validate />)

      expect(dragEl('A')).toHaveAttribute('data-validation', 'true')
      expect(dragEl('A')).toHaveTextContent('Correcto')
    })
  })

  describe('notificación de estado (onState y onMove)', () => {
    it('no se llama en el primer render', () => {
      const onState = vi.fn()
      render(<Example onState={onState} />)

      expect(onState).not.toHaveBeenCalled()
    })

    it('onState informa el id, las posiciones y los válidos después de cada movimiento', async () => {
      const onState = vi.fn()
      render(<Example onState={onState} />)

      await moveWithMenu('Opción A', 'Zona 1')

      await waitFor(() =>
        expect(onState).toHaveBeenLastCalledWith({
          id: 'dnd',
          state: { origen: ['B'], 'zona-1': ['A'], 'zona-2': [] },
          validateId: ['A'],
        })
      )
    })

    it('onMove informa qué se movió, incluidos los desplazados, y cómo se originó', async () => {
      const onMove = vi.fn()
      render(<Example onMove={onMove} />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción B', 'Zona 1')

      expect(onMove).toHaveBeenLastCalledWith({
        source: 'menu',
        movements: [
          { dragId: 'B', from: 'origen', to: 'zona-1' },
          { dragId: 'A', from: 'zona-1', to: 'origen' },
        ],
      })
    })

    it('onMove informa los movimientos hechos arrastrando como de origen pointer', () => {
      const onMove = vi.fn()
      render(<Example onMove={onMove} />)

      dragAndDrop('A', 'zona-1')

      expect(onMove).toHaveBeenCalledWith({
        source: 'pointer',
        movements: [{ dragId: 'A', from: 'origen', to: 'zona-1' }],
      })
    })

    it('si defaultState cambia desde fuera, los elementos se reubican sin llamar a onState', () => {
      const onState = vi.fn()
      const { rerender } = render(<Example onState={onState} defaultState={{ origen: ['A', 'B'] }} />)

      rerender(<Example onState={onState} defaultState={{ origen: ['B'], 'zona-1': ['A'] }} />)

      expect(whereIs('A')).toBe('zona-1')
      expect(onState).not.toHaveBeenCalled()
    })

    it('el patrón controlado (defaultState ← onState) no entra en bucle', async () => {
      const Controlled = () => {
        const [state, setState] = useState<ItemType>({ origen: ['A', 'B'], 'zona-1': [], 'zona-2': [] })
        return <Example defaultState={state} onState={({ state: next }) => setState(next)} />
      }
      render(<Controlled />)

      await moveWithMenu('Opción A', 'Zona 1')

      expect(whereIs('A')).toBe('zona-1')
      expect(idsIn('origen')).toEqual(['B'])
    })
  })

  describe('reinicio (handleResetDnd)', () => {
    const ResetButton = () => {
      const { handleResetDnd } = useDragAndDropContext()
      return <button onClick={handleResetDnd}>Reiniciar</button>
    }

    const WithReset = (props: ExampleProps) => (
      <DragAndDrop id="dnd" {...props}>
        <div>
          <DragAndDrop.Container id="origen" label="Origen">
            <DragAndDrop.Drag id="A" label="Opción A">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="zona-1" label="Zona 1" validate={['A']} />
          <ResetButton />
        </div>
      </DragAndDrop>
    )

    it('devuelve todos los elementos a su posición inicial', async () => {
      render(<WithReset />)
      await moveWithMenu('Opción A', 'Zona 1')
      expect(whereIs('A')).toBe('zona-1')

      await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))

      expect(whereIs('A')).toBe('origen')
    })

    it('limpia las validaciones, informa con onValidate y lo anuncia', async () => {
      const onValidate = vi.fn()
      render(<WithReset onValidate={onValidate} />)
      await moveWithMenu('Opción A', 'Zona 1')

      await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))

      expect(onValidate).toHaveBeenLastCalledWith({ validate: [], active: false })
      expect(announce).toHaveBeenLastCalledWith('Todos los elementos volvieron a su posición inicial.')
    })
  })

  describe('zonas ordenables (sortable)', () => {
    const List = (props: ExampleProps) => (
      <DragAndDrop id="dnd" {...props}>
        <DragAndDrop.Container id="lista" label="Lista" sortable>
          <DragAndDrop.Drag id="1" label="Uno">
            Uno
          </DragAndDrop.Drag>
          <DragAndDrop.Drag id="2" label="Dos">
            Dos
          </DragAndDrop.Drag>
          <DragAndDrop.Drag id="3" label="Tres">
            Tres
          </DragAndDrop.Drag>
        </DragAndDrop.Container>
      </DragAndDrop>
    )

    it('pinta los elementos en el orden del estado', () => {
      render(<List />)

      expect(idsIn('lista')).toEqual(['1', '2', '3'])
    })

    it('el menú ofrece solo los reordenamientos que cambiarían algo', async () => {
      render(<List />)

      await userEvent.click(moveButton('Uno'))

      expect(await screen.findByRole('button', { name: 'Bajar una posición' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Mover al final' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Subir una posición' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Mover al inicio' })).not.toBeInTheDocument()
    })

    it('mover al inicio, subir, bajar y mover al final reordenan el DOM', async () => {
      render(<List />)

      await reorderWithMenu('Tres', 'Mover al inicio')
      expect(idsIn('lista')).toEqual(['3', '1', '2'])

      await reorderWithMenu('Tres', 'Bajar una posición')
      expect(idsIn('lista')).toEqual(['1', '3', '2'])

      await reorderWithMenu('Dos', 'Subir una posición')
      expect(idsIn('lista')).toEqual(['1', '2', '3'])

      await reorderWithMenu('Uno', 'Mover al final')
      expect(idsIn('lista')).toEqual(['2', '3', '1'])
    })

    it('tras reordenar, el foco sigue en el botón del elemento y se anuncia la nueva posición', async () => {
      render(<List />)

      await reorderWithMenu('Tres', 'Mover al inicio')

      expect(moveButton('Tres')).toHaveFocus()
      expect(announce).toHaveBeenLastCalledWith('«Tres» movido a la posición 1 de 3 en «Lista».')
    })

    it('reordenar informa con onState', async () => {
      const onState = vi.fn()
      render(<List onState={onState} />)

      await reorderWithMenu('Tres', 'Mover al inicio')

      expect(onState).toHaveBeenLastCalledWith(expect.objectContaining({ state: { lista: ['3', '1', '2'] } }))
    })

    it('en una zona que no es sortable el menú no ofrece reordenar', async () => {
      render(<Example />)

      await userEvent.click(moveButton('Opción A'))

      await screen.findByRole('button', { name: 'Mover a Zona 1' })
      expect(screen.queryByRole('button', { name: 'Mover al inicio' })).not.toBeInTheDocument()
    })

    it('un elemento que llega a una zona sortable queda en el orden de llegada', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="banco" label="Banco">
            <DragAndDrop.Drag id="A" label="Alfa">
              Alfa
            </DragAndDrop.Drag>
            <DragAndDrop.Drag id="B" label="Beta">
              Beta
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="orden" label="Orden" capacity={Infinity} sortable />
        </DragAndDrop>
      )

      await moveWithMenu('Beta', 'Orden')
      await moveWithMenu('Alfa', 'Orden')

      expect(idsIn('orden')).toEqual(['B', 'A'])
    })
  })

  describe('API por código (useDragAndDropContext)', () => {
    let api: ReturnType<typeof useDragAndDropContext>

    const Probe = () => {
      api = useDragAndDropContext()
      return null
    }

    const renderWithProbe = () =>
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="lista" label="Lista" sortable>
            <DragAndDrop.Drag id="1" label="Uno">
              Uno
            </DragAndDrop.Drag>
            <DragAndDrop.Drag id="2" label="Dos">
              Dos
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Zona" validate={['1']} />
          <Probe />
        </DragAndDrop>
      )

    it('expone las zonas disponibles, las posiciones y los válidos', () => {
      renderWithProbe()

      expect(api.availableDropTargets).toEqual([
        { id: 'lista', label: 'Lista' },
        { id: 'z', label: 'Zona' },
      ])
      expect(api.layout).toEqual({ lista: ['1', '2'], z: [] })
      expect(api.listId).toEqual([])
    })

    it('handleDragMove mueve a una zona o reordena con top / up / down / bottom', () => {
      renderWithProbe()

      act(() => api.handleDragMove('1', 'z'))
      expect(whereIs('1')).toBe('z')
      expect(api.listId).toEqual(['1'])

      act(() => api.handleDragMove('2', 'top'))
      expect(idsIn('lista')).toEqual(['2'])
    })
  })

  describe('renderizado en el servidor y StrictMode', () => {
    it('el HTML del servidor trae los elementos en su zona de origen y se hidrata sin errores', async () => {
      const html = renderToString(<Example defaultState={{ origen: ['B'], 'zona-1': ['A'], 'zona-2': [] }} />)
      expect(html).toContain('data-drag-id="A"')
      expect(html).toContain('data-drag-id="B"')

      const host = document.createElement('div')
      host.innerHTML = html
      document.body.appendChild(host)
      const errors: unknown[] = []
      const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
        errors.push(args)
      })

      await act(async () => {
        hydrateRoot(host, <Example defaultState={{ origen: ['B'], 'zona-1': ['A'], 'zona-2': [] }} />, {
          onRecoverableError: (error) => errors.push(error),
        })
      })

      spy.mockRestore()
      expect(errors).toEqual([])
      expect(host.querySelector('[data-drop-id="zona-1"] [data-drag-id="A"]')).not.toBeNull()
      host.remove()
    })

    it('en StrictMode las posiciones iniciales y los movimientos funcionan igual y sin duplicados', async () => {
      render(
        <StrictMode>
          <Example defaultState={{ origen: ['B'], 'zona-1': ['A'], 'zona-2': [] }} />
        </StrictMode>
      )

      expect(whereIs('A')).toBe('zona-1')
      expect(document.querySelectorAll('[data-drag-id]')).toHaveLength(2)

      await moveWithMenu('Opción B', 'Zona 2')

      expect(whereIs('B')).toBe('zona-2')
      expect(whereIs('A')).toBe('zona-1')
      expect(document.querySelectorAll('[data-drag-id]')).toHaveLength(2)
    })
  })

  describe('accesibilidad (axe, WCAG 2.2 AA)', () => {
    /**
     * Reglas de WCAG 2.0/2.1/2.2 A y AA más las buenas prácticas de axe.
     * - `color-contrast` se desactiva porque jsdom no calcula estilos.
     * - `region` exige que toda la página esté en landmarks: es cosa de la página, no del componente.
     */
    const violations = async () => {
      const results = await axe.run(document.body, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
        rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      })
      return results.violations.map((v) => `${v.id}: ${v.help} → ${v.nodes[0]?.html.slice(0, 120)}`)
    }

    it('el estado inicial no tiene violaciones', async () => {
      render(<Example />)

      expect(await violations()).toEqual([])
    })

    it('con el menú abierto no tiene violaciones', async () => {
      render(<Example />)
      await userEvent.click(moveButton('Opción A'))
      await screen.findByRole('button', { name: 'Mover a Zona 1' })

      expect(await violations()).toEqual([])
    })

    it('después de mover y con la actividad comprobada no tiene violaciones', async () => {
      const { rerender } = render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')
      rerender(<Example validate />)

      expect(await violations()).toEqual([])
    })

    it('una zona ordenable, con menú abierto, no tiene violaciones', async () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="lista" label="Lista" sortable>
            <DragAndDrop.Drag id="1" label="Uno">
              Uno
            </DragAndDrop.Drag>
            <DragAndDrop.Drag id="2" label="Dos">
              Dos
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </DragAndDrop>
      )
      await userEvent.click(moveButton('Uno'))
      await screen.findByRole('button', { name: 'Bajar una posición' })

      expect(await violations()).toEqual([])
    })

    it('un contenedor por drag, con contenido propio, no tiene violaciones', async () => {
      render(
        <DragAndDrop id="dnd">
          <ol>
            {['A', 'B'].map((id) => (
              <li key={id}>
                <DragAndDrop.Container id={`celda-${id}`} label={`Celda ${id}`} homeOnly>
                  <span>Celda {id}</span>
                  <DragAndDrop.Drag id={id} label={`Palabra ${id}`}>
                    {id}
                  </DragAndDrop.Drag>
                </DragAndDrop.Container>
              </li>
            ))}
          </ol>
          <DragAndDrop.Drop id="z" label="Zona">
            <p>Suelta aquí</p>
          </DragAndDrop.Drop>
        </DragAndDrop>
      )
      await moveWithMenu('Palabra A', 'Zona')

      expect(await violations()).toEqual([])
    })

    it('el botón de mover declara que abre un diálogo y si está abierto, sin role="menu"', async () => {
      render(<Example />)
      const button = moveButton('Opción A')

      expect(button).toHaveAttribute('aria-haspopup', 'dialog')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).not.toHaveAttribute('aria-pressed')

      await userEvent.click(button)

      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(document.querySelector('[role="menu"]')).toBeNull()
      expect(await screen.findByRole('dialog', { name: 'Opciones para mover Opción A' })).toBeInTheDocument()
    })

    it('las zonas no son landmarks: un ejercicio con muchos espacios no llena la lista de regiones', () => {
      render(<Example />)

      expect(screen.queryAllByRole('region')).toHaveLength(0)
      expect(screen.getAllByRole('group')).toHaveLength(3)
    })
  })
})
