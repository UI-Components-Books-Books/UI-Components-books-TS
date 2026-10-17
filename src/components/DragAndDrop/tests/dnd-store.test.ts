import { describe, expect, it, vi } from 'vitest'

import { createDndStore, type DndEvent, type ZoneEntry } from '../utils/dnd-store'

const zone = (label: string, rule: Partial<ZoneEntry> = {}): ZoneEntry => ({ label, sortable: false, ...rule })

/** Un banco con A y B, y una zona de capacidad 1 que valida A. */
const build = () => {
  const store = createDndStore()
  store.registerZone('banco', zone('Banco'))
  store.registerZone('z1', zone('Zona 1', { capacity: 1, validate: ['A'] }))
  store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })
  store.registerDrag('B', { home: 'banco', label: 'Beta', locked: false })
  return store
}

/** Deja correr los microtasks pendientes (el borrado de registros se aplaza a uno). */
const flush = () => new Promise<void>((resolve) => queueMicrotask(resolve))

describe('dnd-store', () => {
  describe('registro', () => {
    it('cada drag empieza en su home, en orden de declaración', () => {
      const { layout } = build().getSnapshot()

      expect(layout).toEqual({ banco: ['A', 'B'], z1: [] })
    })

    it('da lo mismo que el drag se registre antes o después de su zona', () => {
      // En React los efectos de los hijos corren antes que los del padre: el drag llega primero.
      const store = createDndStore()
      store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })
      store.registerZone('banco', zone('Banco'))
      store.registerZone('z1', zone('Zona 1'))

      const { layout, zoneIds } = store.getSnapshot()

      expect(layout).toEqual({ banco: ['A'], z1: [] })
      expect(zoneIds).toEqual(['banco', 'z1'])
    })

    it('respeta las posiciones iniciales y deja los demás en su home', () => {
      const store = createDndStore({ banco: ['B'], z1: ['A'] })
      store.registerZone('banco', zone('Banco'))
      store.registerZone('z1', zone('Zona 1'))
      store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })
      store.registerDrag('B', { home: 'banco', label: 'Beta', locked: false })
      store.registerDrag('C', { home: 'banco', label: 'Gamma', locked: false })

      expect(store.getSnapshot().layout).toEqual({ banco: ['B', 'C'], z1: ['A'] })
    })

    it('registrar de nuevo lo mismo no notifica ni cambia nada', () => {
      const store = build()
      const listener = vi.fn()
      store.subscribe(listener)

      store.registerZone('z1', zone('Zona 1', { capacity: 1, validate: ['A'] }))
      store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })

      expect(listener).not.toHaveBeenCalled()
    })

    it('un registro que se libera y se vuelve a hacer enseguida conserva la posición (StrictMode)', async () => {
      const store = build()
      store.move('A', 'z1')

      const release = store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })
      release() // desmontaje de StrictMode…
      store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false }) // …y montaje inmediato
      await flush()

      expect(store.getSnapshot().layout.z1).toEqual(['A'])
    })

    it('un drag liberado de verdad desaparece del layout y de los registros', async () => {
      const store = createDndStore()
      store.registerZone('banco', zone('Banco'))
      const release = store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })

      release()
      await flush()

      const snapshot = store.getSnapshot()
      expect(snapshot.layout.banco).toEqual([])
      expect(snapshot.dragIds).toEqual([])
    })

    it('al desaparecer una zona, sus drags regresan a su home', async () => {
      const store = createDndStore()
      store.registerZone('banco', zone('Banco'))
      const releaseZone = store.registerZone('z1', zone('Zona 1'))
      store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })
      store.move('A', 'z1')

      releaseZone()
      await flush()

      const snapshot = store.getSnapshot()
      expect(snapshot.layout).toEqual({ banco: ['A'] })
      expect(snapshot.zoneIds).toEqual(['banco'])
    })

    it('un marcador solo se quita si sigue siendo el que está registrado', () => {
      const store = build()
      const first = document.createElement('span')
      const second = document.createElement('span')

      const releaseFirst = store.registerSlot('A', 'banco', first)
      store.registerSlot('A', 'z1', second) // otro marcador (de otra zona) toma el lugar
      releaseFirst()

      expect(store.getSnapshot().slots.A).toEqual({ zoneId: 'z1', element: second })
    })

    it('al liberar el marcador vigente, el drag se queda sin marcador', () => {
      const store = build()
      const element = document.createElement('span')

      store.registerSlot('A', 'z1', element)()

      expect(store.getSnapshot().slots.A).toBeUndefined()
    })
  })

  describe('acciones', () => {
    it('move cambia el layout y emite un evento con los movimientos y el origen', () => {
      const store = build()
      const events: DndEvent[] = []
      store.subscribeEvents((event) => events.push(event))

      const result = store.move('A', 'z1', { source: 'pointer' })

      expect(result.ok).toBe(true)
      expect(store.getSnapshot().layout).toEqual({ banco: ['B'], z1: ['A'] })
      expect(events).toEqual([
        {
          type: 'move',
          movements: [{ dragId: 'A', from: 'banco', to: 'z1' }],
          layout: { banco: ['B'], z1: ['A'] },
          source: 'pointer',
        },
      ])
    })

    it('un movimiento rechazado no cambia nada ni emite eventos', () => {
      const store = build()
      const listener = vi.fn()
      store.subscribeEvents(listener)

      const result = store.move('A', 'banco') // ya está ahí

      expect(result).toEqual({ ok: false, reason: 'same-zone' })
      expect(listener).not.toHaveBeenCalled()
    })

    it('el desplazado vuelve a su home', () => {
      const store = build()
      store.move('A', 'z1')

      store.move('B', 'z1')

      expect(store.getSnapshot().layout).toEqual({ banco: ['A'], z1: ['B'] })
    })

    it('restoreFocus pide devolver el foco al drag, y se puede limpiar', () => {
      const store = build()

      store.move('A', 'z1', { restoreFocus: true })
      expect(store.getSnapshot().focusRequest).toBe('A')

      store.clearFocusRequest()
      expect(store.getSnapshot().focusRequest).toBeNull()
    })

    it('un movimiento sin restoreFocus no pide foco', () => {
      const store = build()

      store.move('A', 'z1')

      expect(store.getSnapshot().focusRequest).toBeNull()
    })

    it('reset devuelve todo a su home y emite un evento', () => {
      const store = build()
      store.move('A', 'z1')
      const listener = vi.fn()
      store.subscribeEvents(listener)

      store.reset()

      expect(store.getSnapshot().layout).toEqual({ banco: ['A', 'B'], z1: [] })
      expect(listener).toHaveBeenCalledWith({ type: 'reset', layout: { banco: ['A', 'B'], z1: [] } })
    })
  })

  describe('drags bloqueados', () => {
    /** Un banco con A, una zona de capacidad 1 que ya tiene a L bloqueado, y B libre. */
    const withLocked = () => {
      const store = createDndStore()
      store.registerZone('banco', zone('Banco'))
      store.registerZone('z', zone('Zona', { capacity: 1 }))
      store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })
      store.registerDrag('L', { home: 'z', label: 'Fijo', locked: true })
      return store
    }

    it('un drag bloqueado no se puede mover', () => {
      const store = withLocked()

      expect(store.move('L', 'banco')).toEqual({ ok: false, reason: 'locked' })
      expect(store.getSnapshot().layout).toEqual({ banco: ['A'], z: ['L'] })
    })

    it('otro drag no puede desplazarlo, y la zona deja de ser un destino posible', () => {
      const store = withLocked()

      expect(store.move('A', 'z')).toEqual({ ok: false, reason: 'full' })
      expect(store.canMove('A', 'z')).toBe(false)
      expect(store.targetsFor('A')).toEqual([])
      expect(store.getSnapshot().layout).toEqual({ banco: ['A'], z: ['L'] })
    })

    it('un drag bloqueado no ofrece ningún destino', () => {
      expect(withLocked().targetsFor('L')).toEqual([])
    })

    it('al reiniciar, el bloqueado se queda en su zona de origen', () => {
      const store = withLocked()

      store.reset()

      expect(store.getSnapshot().layout).toEqual({ banco: ['A'], z: ['L'] })
    })

    it('si el drag se desbloquea, vuelve a poder moverse y a ser desplazado', () => {
      const store = withLocked()
      const listener = vi.fn()
      store.subscribe(listener)

      store.registerDrag('L', { home: 'z', label: 'Fijo', locked: false })

      expect(listener).toHaveBeenCalled()
      // L ya no está bloqueado: A lo desplaza y, como su home es la propia zona, ocupa el lugar de A.
      expect(store.move('A', 'z').ok).toBe(true)
      expect(store.getSnapshot().layout).toEqual({ banco: ['L'], z: ['A'] })
    })

    it('un drag bloqueado en una zona sortable no se reordena', () => {
      const store = createDndStore()
      store.registerZone('lista', zone('Lista', { sortable: true }))
      store.registerDrag('1', { home: 'lista', label: '1', locked: false })
      store.registerDrag('2', { home: 'lista', label: '2', locked: true })

      expect(store.reorder('2', 'top')).toBe(false)
      expect(store.reorder('1', 'bottom')).toBe(true)
    })
  })

  describe('reordenar', () => {
    const sortable = () => {
      const store = createDndStore()
      store.registerZone('lista', zone('Lista', { sortable: true }))
      store.registerZone('fija', zone('Fija'))
      ;['1', '2', '3'].forEach((id) => store.registerDrag(id, { home: 'lista', label: id, locked: false }))
      store.registerDrag('x', { home: 'fija', label: 'x', locked: false })
      store.registerDrag('y', { home: 'fija', label: 'y', locked: false })
      return store
    }

    it('reordena dentro de una zona sortable y emite un evento', () => {
      const store = sortable()
      const listener = vi.fn()
      store.subscribeEvents(listener)

      const changed = store.reorder('3', 'top')

      expect(changed).toBe(true)
      expect(store.getSnapshot().layout.lista).toEqual(['3', '1', '2'])
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'reorder', dragId: '3' }))
    })

    it('no reordena en una zona que no es sortable', () => {
      const store = sortable()

      expect(store.reorder('y', 'top')).toBe(false)
      expect(store.getSnapshot().layout.fija).toEqual(['x', 'y'])
    })

    it('no hace nada, ni emite, si ya está en el extremo', () => {
      const store = sortable()
      const listener = vi.fn()
      store.subscribeEvents(listener)

      expect(store.reorder('1', 'up')).toBe(false)
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('syncLayout (defaultState que cambia desde fuera)', () => {
    it('aplica las posiciones recibidas sin emitir eventos', () => {
      const store = build()
      const listener = vi.fn()
      store.subscribeEvents(listener)

      store.syncLayout({ banco: ['B'], z1: ['A'] })

      expect(store.getSnapshot().layout).toEqual({ banco: ['B'], z1: ['A'] })
      expect(listener).not.toHaveBeenCalled()
    })

    it('un drag que no se menciona, o una zona que no existe, quedan en el home', () => {
      const store = build()

      store.syncLayout({ z1: ['A'], fantasma: ['B'] })

      expect(store.getSnapshot().layout).toEqual({ banco: ['B'], z1: ['A'] })
    })

    it('si las posiciones ya son esas, no notifica (evita bucles con onState)', () => {
      const store = build()
      store.move('A', 'z1')
      const listener = vi.fn()
      store.subscribe(listener)

      store.syncLayout({ banco: ['B'], z1: ['A'] })

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('consultas', () => {
    it('targetsFor lista las zonas a las que se puede mover, sin la actual y sin las que lo rechazan', () => {
      const store = createDndStore()
      store.registerZone('banco', zone('Banco'))
      store.registerZone('z1', zone('Zona 1'))
      store.registerZone('propia-B', zone('Celda de B', { homeOnly: true }))
      store.registerDrag('A', { home: 'banco', label: 'Alfa', locked: false })
      store.registerDrag('B', { home: 'propia-B', label: 'Beta', locked: false })

      expect(store.targetsFor('A')).toEqual([{ id: 'z1', label: 'Zona 1' }])
      expect(store.targetsFor('B')).toEqual([
        { id: 'banco', label: 'Banco' },
        { id: 'z1', label: 'Zona 1' },
      ])
    })

    it('validIds sale siempre de las posiciones actuales', () => {
      const store = build()
      expect(store.validIds()).toEqual([])

      store.move('A', 'z1')
      expect(store.validIds()).toEqual(['A'])

      store.move('B', 'z1') // desplaza a A
      expect(store.validIds()).toEqual([])
    })

    it('canMove refleja las reglas', () => {
      const store = build()

      expect(store.canMove('A', 'z1')).toBe(true)
      expect(store.canMove('A', 'banco')).toBe(false)
    })
  })

  describe('suscripción', () => {
    it('avisa de los cambios y deja de avisar al cancelar', () => {
      const store = build()
      const listener = vi.fn()
      const unsubscribe = store.subscribe(listener)

      store.move('A', 'z1')
      expect(listener).toHaveBeenCalledTimes(1)

      unsubscribe()
      store.move('B', 'z1')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('cada cambio produce un snapshot nuevo (necesario para useSyncExternalStore)', () => {
      const store = build()
      const before = store.getSnapshot()

      store.move('A', 'z1')

      expect(store.getSnapshot()).not.toBe(before)
      expect(before.layout).toEqual({ banco: ['A', 'B'], z1: [] })
    })
  })
})
