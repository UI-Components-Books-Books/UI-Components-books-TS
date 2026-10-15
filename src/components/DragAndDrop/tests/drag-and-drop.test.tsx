import { createRef } from 'react'

import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DragAndDrop, useDragAndDropContext } from '../index'
import type { DragAndDropProps, ItemType } from '../types/types'
import { DragAndDropTypes } from '../utils/const'
import { getChildrenByType } from '../utils/getChildrenByType'

/**
 * `@atlaskit/pragmatic-drag-and-drop` engancha eventos nativos de arrastre que jsdom no puede
 * simular de forma fiel. Se sustituye el adaptador por un doble que solo registra lo que cada
 * componente le pide; así se prueba la lógica propia (movimientos, validación, reordenamiento)
 * invocando directamente los callbacks del monitor, y la ruta accesible (menú) con eventos reales.
 */
vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: vi.fn(() => vi.fn()),
  dropTargetForElements: vi.fn(() => vi.fn()),
  monitorForElements: vi.fn(() => vi.fn()),
}))

type Config = Record<string, any>
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

/** Mueve un elemento a una zona usando el menú contextual (la ruta accesible por teclado). */
const moveWithMenu = async (dragLabel: string, zoneLabel: string) => {
  await userEvent.click(screen.getByRole('button', { name: new RegExp(`mover la opción ${dragLabel} `) }))
  await userEvent.click(await screen.findByRole('button', { name: `Mover al ${zoneLabel}` }))
}

beforeEach(() => {
  vi.mocked(draggable).mockClear()
  vi.mocked(dropTargetForElements).mockClear()
  vi.mocked(monitorForElements).mockClear()
})

describe('DragAndDrop', () => {
  describe('estructura inicial', () => {
    it('coloca cada elemento arrastrable dentro del contenedor donde se declaró', () => {
      render(<Example />)

      expect(idsIn('origen')).toEqual(['A', 'B'])
      expect(idsIn('zona-1')).toEqual([])
      expect(idsIn('zona-2')).toEqual([])
    })

    it('contenedores y zonas son regiones con su label y sus atributos de identificación', () => {
      render(<Example />)

      expect(screen.getByRole('region', { name: 'Origen' })).toHaveAttribute('data-type', DragAndDropTypes.CONTAINER)
      expect(screen.getByRole('region', { name: 'Zona 1' })).toHaveAttribute('data-type', DragAndDropTypes.DROPPABLE)
      expect(screen.getByRole('region', { name: 'Zona 1' })).toHaveAttribute('data-drop-id', 'zona-1')
    })

    it('la zona expone los ids válidos en data-validate', () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Drop id="z" label="Zona" validate={['A', 'B']} />
        </DragAndDrop>
      )

      expect(zoneEl('z')).toHaveAttribute('data-validate', 'A,B')
    })

    it('los elementos arrastrables muestran su contenido y su control de movimiento accesible', () => {
      render(<Example />)

      expect(dragEl('A')).toHaveTextContent('Alfa')
      expect(dragEl('A')).toHaveAttribute('data-type', DragAndDropTypes.DRAGGABLE)
      const control = screen.getByRole('button', { name: /mover la opción Opción A/ })
      expect(control).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('agrega addClass a los elementos y zonas', () => {
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="c" label="C" addClass="mi-contenedor">
            <DragAndDrop.Drag id="A" label="A" addClass="mi-drag">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="z" label="Z" validate={[]} addClass="mi-zona" />
        </DragAndDrop>
      )

      expect(zoneEl('c')).toHaveClass('c-droppable', 'mi-contenedor')
      expect(dragEl('A')).toHaveClass('c-draggable', 'mi-drag')
      expect(zoneEl('z')).toHaveClass('c-droppable', 'mi-zona')
    })

    it('respeta defaultState para la posición inicial', () => {
      const defaultState: ItemType = { origen: ['B'], 'zona-1': ['A'], 'zona-2': [] }
      render(<Example defaultState={defaultState} />)

      expect(whereIs('A')).toBe('zona-1')
      expect(whereIs('B')).toBe('origen')
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
      const configs = vi.mocked(draggable).mock.calls.map(([config]) => config as Config)
      const configA = configs.find((c) => c.element === dragEl('A')) as Config

      expect(configA.getInitialData()).toEqual({ id: 'A' })
      expect(configA.canDrag()).toBe(true)
    })

    it('no registra como arrastrable un elemento con dragDisabled', () => {
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

    // BUG CONOCIDO: el efecto de Draggable lee `dragRef.current`, pero si el usuario pasa su propia
    // `ref`, `localRef` apunta a ella y `dragRef` nunca se asocia al DOM. El elemento deja de ser
    // arrastrable con el mouse sin ningún aviso (Droppable y ContainerDrag sí usan `localRef`).
    // Cuando se corrija este test fallará: quitar `.fails`.
    it.fails('un Draggable sigue registrándose como arrastrable cuando recibe una ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="c" label="C">
            <DragAndDrop.Drag id="A" label="A" ref={ref}>
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
        </DragAndDrop>
      )

      expect(draggable).toHaveBeenCalled()
    })
  })

  describe('mover con el menú contextual (teclado)', () => {
    it('el menú ofrece mover a cada contenedor y zona', async () => {
      render(<Example />)

      await userEvent.click(screen.getByRole('button', { name: /mover la opción Opción A/ }))

      expect(await screen.findByRole('button', { name: 'Mover al Origen' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Mover al Zona 1' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Mover al Zona 2' })).toBeInTheDocument()
    })

    it('mueve el elemento a la zona elegida', async () => {
      render(<Example />)

      await moveWithMenu('Opción A', 'Zona 1')

      expect(whereIs('A')).toBe('zona-1')
      expect(idsIn('origen')).toEqual(['B'])
    })

    it('un elemento puede regresar al contenedor de origen', async () => {
      render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción A', 'Origen')

      expect(whereIs('A')).toBe('origen')
    })

    it('un elemento nunca queda duplicado en varios contenedores', async () => {
      render(<Example />)

      await moveWithMenu('Opción A', 'Zona 1')
      await moveWithMenu('Opción A', 'Zona 2')

      expect(document.querySelectorAll('[data-drag-id="A"]')).toHaveLength(1)
      expect(whereIs('A')).toBe('zona-2')
    })

    it('sin multipleDrags, al soltar en una zona ocupada el elemento anterior vuelve al contenedor base', async () => {
      render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción B', 'Zona 1')

      expect(whereIs('B')).toBe('zona-1')
      expect(whereIs('A')).toBe('origen')
    })

    it('con multipleDrags permite varios elementos en la misma zona', async () => {
      render(<Example multipleDrags />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción B', 'Zona 1')

      expect(idsIn('zona-1').sort()).toEqual(['A', 'B'])
    })

    it('llama a announcements después de mover', async () => {
      const announcements = vi.fn()
      render(<Example announcements={announcements} />)

      await moveWithMenu('Opción A', 'Zona 1')

      await waitFor(() => expect(announcements).toHaveBeenCalledTimes(1))
    })
  })

  describe('mover arrastrando (eventos del monitor)', () => {
    const dragAndDrop = (dragId: string, zoneId: string) => {
      const source = { element: dragEl(dragId) }
      act(() => {
        monitor().onDragStart({ source })
      })
      act(() => {
        monitor().onDrop({
          source,
          location: { current: { dropTargets: [{ element: zoneEl(zoneId) }] } },
        })
      })
    }

    it('al empezar a arrastrar, la API expone qué elemento se está arrastrando', () => {
      let dragging: string | null = null
      const Probe = () => {
        dragging = useDragAndDropContext().isDragging
        return null
      }
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="c" label="C">
            <DragAndDrop.Drag id="A" label="A">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <Probe />
        </DragAndDrop>
      )
      expect(dragging).toBeNull()

      act(() => {
        monitor().onDragStart({ source: { element: dragEl('A') } })
      })

      expect(dragging).toBe('A')
    })

    it('al soltar sobre una zona mueve el elemento y deja de estar "arrastrando"', () => {
      render(<Example />)

      dragAndDrop('A', 'zona-1')

      expect(whereIs('A')).toBe('zona-1')
    })

    it('soltar fuera de cualquier zona no mueve nada', () => {
      render(<Example />)
      const source = { element: dragEl('A') }

      act(() => {
        monitor().onDragStart({ source })
      })
      act(() => {
        monitor().onDrop({ source, location: { current: { dropTargets: [] } } })
      })

      expect(whereIs('A')).toBe('origen')
    })

    it('soltar sobre un destino sin data-drop-id no mueve nada', () => {
      render(<Example />)
      const stray = document.createElement('div')

      act(() => {
        monitor().onDrop({
          source: { element: dragEl('A') },
          location: { current: { dropTargets: [{ element: stray }] } },
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

    // BUG CONOCIDO (importante para la corrección de ejercicios): sin multipleDrags, si B se suelta
    // en una zona ocupada por A, A vuelve al contenedor de origen pero SIGUE contando como válido.
    // La causa es que `validateDrags` busca "el elemento previo de la zona" en el estado ya
    // actualizado, donde A ya no está en esa zona. Cuando se corrija este test fallará:
    // quitar `.fails`.
    it.fails('sin multipleDrags, un elemento desplazado fuera de su zona deja de contar como válido', async () => {
      const onValidate = vi.fn()
      render(<Example onValidate={onValidate} />)
      await moveWithMenu('Opción A', 'Zona 1')

      await moveWithMenu('Opción B', 'Zona 1')

      // B no es válido en la zona 1 y A fue desplazado al origen: ninguno debería ser válido.
      await waitFor(() => expect(onValidate).toHaveBeenLastCalledWith({ validate: [], active: true }))
    })

    it('con validate=true un elemento en una zona que no lo acepta se marca como incorrecto', async () => {
      const { rerender } = render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')
      await moveWithMenu('Opción B', 'Zona 1') // B no es válido en la zona 1

      rerender(<Example validate />)

      expect(dragEl('B')).toHaveAttribute('data-validation', 'false')
    })

    // BUG CONOCIDO: consecuencia del anterior. Con validate=true, A (desplazado al contenedor de
    // origen) se marca data-validation="true" aunque no está en su zona. Cuando se corrija:
    // quitar `.fails`.
    it.fails('con validate=true un elemento desplazado al origen no se marca como correcto', async () => {
      const { rerender } = render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')
      await moveWithMenu('Opción B', 'Zona 1')

      rerender(<Example validate />)

      expect(whereIs('A')).toBe('origen')
      expect(dragEl('A')).toHaveAttribute('data-validation', 'false')
    })

    it('con validate=true marca como correcto lo que está en su zona', async () => {
      const { rerender } = render(<Example />)
      await moveWithMenu('Opción A', 'Zona 1')
      await moveWithMenu('Opción B', 'Zona 2')

      rerender(<Example validate />)

      expect(dragEl('A')).toHaveAttribute('data-validation', 'true')
      expect(dragEl('B')).toHaveAttribute('data-validation', 'true')
    })

    it('sin validate no agrega data-validation', () => {
      render(<Example />)

      expect(dragEl('A')).not.toHaveAttribute('data-validation')
    })

    it('con validate=true se bloquea el movimiento: botones deshabilitados y la librería no deja arrastrar ni soltar', () => {
      render(<Example validate />)

      screen.getAllByRole('button', { name: /mover la opción/ }).forEach((button) => expect(button).toBeDisabled())
      const dragConfig = vi.mocked(draggable).mock.calls.map(([c]) => c as Config).slice(-1)[0]
      const dropConfig = vi.mocked(dropTargetForElements).mock.calls.map(([c]) => c as Config).slice(-1)[0]
      expect(dragConfig.canDrag()).toBe(false)
      expect(dropConfig.canDrop()).toBe(false)
    })

    it('respeta defaultValidate como validación inicial', () => {
      render(<Example validate defaultValidate={['A']} />)

      expect(dragEl('A')).toHaveAttribute('data-validation', 'true')
      expect(dragEl('B')).toHaveAttribute('data-validation', 'false')
    })
  })

  describe('notificación de estado (onState)', () => {
    it('no se llama en el primer render', () => {
      const onState = vi.fn()
      render(<Example onState={onState} />)

      expect(onState).not.toHaveBeenCalled()
    })

    it('informa el id, las posiciones y los válidos después de cada movimiento', async () => {
      const onState = vi.fn()
      render(<Example onState={onState} />)

      await moveWithMenu('Opción A', 'Zona 1')

      await waitFor(() =>
        expect(onState).toHaveBeenLastCalledWith({
          id: 'dnd',
          state: { 'zona-1': ['A'], 'zona-2': [], origen: ['B'] },
          validateId: ['A'],
        })
      )
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

    it('limpia las validaciones e informa con onValidate', async () => {
      const onValidate = vi.fn()
      render(<WithReset onValidate={onValidate} />)
      await moveWithMenu('Opción A', 'Zona 1')

      await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))

      expect(onValidate).toHaveBeenLastCalledWith({ validate: [], active: false })
    })
  })

  describe('reordenamiento (handleDragMove con top / up / down / bottom)', () => {
    let moveTo: (dragId: string, target: string) => void

    const Reorder = () => {
      moveTo = useDragAndDropContext().handleDragMove as typeof moveTo
      return null
    }

    const renderList = () =>
      render(
        <DragAndDrop id="dnd">
          <DragAndDrop.Container id="lista" label="Lista">
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
          <Reorder />
        </DragAndDrop>
      )

    const reorder = (dragId: string, target: string) => act(() => moveTo(dragId, target))

    it('top lleva el elemento al inicio', () => {
      renderList()

      reorder('3', 'top')

      expect(idsIn('lista')).toEqual(['3', '1', '2'])
    })

    it('bottom lo lleva al final', () => {
      renderList()

      reorder('1', 'bottom')

      expect(idsIn('lista')).toEqual(['2', '3', '1'])
    })

    it('up lo sube una posición', () => {
      renderList()

      reorder('3', 'up')

      expect(idsIn('lista')).toEqual(['1', '3', '2'])
    })

    it('down lo baja una posición', () => {
      renderList()

      reorder('1', 'down')

      expect(idsIn('lista')).toEqual(['2', '1', '3'])
    })

    it('up sobre el primero y down sobre el último no cambian el orden', () => {
      renderList()

      reorder('1', 'up')
      reorder('3', 'down')

      expect(idsIn('lista')).toEqual(['1', '2', '3'])
    })
  })
})

describe('getChildrenByType', () => {
  const Typed = ({ children }: { id?: string; children?: React.ReactNode }) => <div>{children}</div>
  Typed._dndType = DragAndDropTypes.DRAGGABLE

  it('devuelve los elementos del tipo pedido', () => {
    const tree = [<Typed key="a" id="a" />, <div key="b" />, <Typed key="c" id="c" />]

    const result = getChildrenByType(tree, DragAndDropTypes.DRAGGABLE) as React.ReactElement[]

    expect(result.map((el) => el.props.id)).toEqual(['a', 'c'])
  })

  it('busca también dentro de los hijos anidados', () => {
    const tree = (
      <div>
        <section>
          <Typed id="profundo" />
        </section>
      </div>
    )

    const result = getChildrenByType(tree, DragAndDropTypes.DRAGGABLE) as React.ReactElement[]

    expect(result.map((el) => el.props.id)).toEqual(['profundo'])
  })

  it('reconoce el tipo legado indicado en la prop __TYPE', () => {
    const tree = <div {...({ __TYPE: DragAndDropTypes.DROPPABLE } as object)} />

    expect(getChildrenByType(tree, DragAndDropTypes.DROPPABLE)).toHaveLength(1)
  })

  it('ignora textos, números y nulos', () => {
    const tree = ['texto', 42, null, false, <Typed key="a" id="a" />]

    const result = getChildrenByType(tree as React.ReactNode, DragAndDropTypes.DRAGGABLE)

    expect(result).toHaveLength(1)
  })

  it('devuelve un arreglo vacío si no hay coincidencias', () => {
    expect(getChildrenByType(<div />, DragAndDropTypes.CONTAINER)).toEqual([])
  })
})
