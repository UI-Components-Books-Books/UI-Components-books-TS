import { describe, expect, it } from 'vitest'

import {
  canMove,
  layoutFromHomes,
  locate,
  moveDrag,
  reorderDrag,
  validDrags,
  type Homes,
  type Layout,
  type Zones,
} from '../utils/dnd-state'

/** Mueve y exige que el movimiento sea válido, devolviendo el resultado ya "abierto". */
const move = (layout: Layout, zones: Zones, homes: Homes, dragId: string, to: string, locked?: ReadonlySet<string>) => {
  const result = moveDrag(layout, zones, homes, dragId, to, locked)
  if (!result.ok) throw new Error(`el movimiento debía ser válido, pero se rechazó: ${result.reason}`)
  return result
}

describe('dnd-state', () => {
  describe('layoutFromHomes y locate', () => {
    it('agrupa cada drag en su home, en orden de declaración, y conserva las zonas vacías', () => {
      const layout = layoutFromHomes(
        ['banco', 'z1', 'z2'],
        [
          { id: 'C', home: 'banco' },
          { id: 'A', home: 'banco' },
          { id: 'B', home: 'z2' },
        ]
      )

      expect(layout).toEqual({ banco: ['C', 'A'], z1: [], z2: ['B'] })
    })

    it('un drag declarado en una zona no listada no se pierde', () => {
      expect(layoutFromHomes([], [{ id: 'A', home: 'rara' }])).toEqual({ rara: ['A'] })
    })

    it('locate devuelve la zona del drag, o undefined si no está en ninguna', () => {
      const layout = { banco: ['A'], z1: ['B'] }

      expect(locate(layout, 'B')).toBe('z1')
      expect(locate(layout, 'X')).toBeUndefined()
    })
  })

  describe('moveDrag: movimientos básicos', () => {
    const homes: Homes = { A: 'banco', B: 'banco' }

    it('mueve el drag a la zona destino, al final, y no modifica el layout original', () => {
      const layout: Layout = { banco: ['A', 'B'], z1: [] }

      const { layout: next, movements } = move(layout, {}, homes, 'A', 'z1')

      expect(next).toEqual({ banco: ['B'], z1: ['A'] })
      expect(movements).toEqual([{ dragId: 'A', from: 'banco', to: 'z1' }])
      expect(layout).toEqual({ banco: ['A', 'B'], z1: [] })
    })

    it('sin capacity la zona no tiene límite y respeta el orden de llegada', () => {
      const layout: Layout = { banco: ['A', 'B'], z1: [] }

      const first = move(layout, {}, homes, 'B', 'z1')
      const second = move(first.layout, {}, homes, 'A', 'z1')

      expect(second.layout.z1).toEqual(['B', 'A'])
    })

    it('soltar en la zona donde ya está se rechaza como same-zone', () => {
      expect(moveDrag({ banco: ['A'], z1: [] }, {}, homes, 'A', 'banco')).toEqual({ ok: false, reason: 'same-zone' })
    })

    it('un drag o una zona desconocidos se rechazan como unknown', () => {
      const layout: Layout = { banco: ['A'], z1: [] }

      expect(moveDrag(layout, {}, homes, 'X', 'z1')).toEqual({ ok: false, reason: 'unknown' })
      expect(moveDrag(layout, {}, homes, 'A', 'no-existe')).toEqual({ ok: false, reason: 'unknown' })
    })
  })

  describe('moveDrag: capacidad y desplazamiento', () => {
    it('en una zona de capacidad 1 ocupada, el ocupante vuelve a su home', () => {
      const zones: Zones = { z1: { capacity: 1 } }
      const homes: Homes = { A: 'banco', B: 'banco' }
      const layout: Layout = { banco: ['B'], z1: ['A'] }

      const { layout: next, movements } = move(layout, zones, homes, 'B', 'z1')

      expect(next).toEqual({ banco: ['A'], z1: ['B'] })
      expect(movements).toEqual([
        { dragId: 'B', from: 'banco', to: 'z1' },
        { dragId: 'A', from: 'z1', to: 'banco' },
      ])
    })

    it('un contenedor por drag: el desplazado vuelve a SU contenedor, no al último', () => {
      // Caso que fallaba antes: el desplazado terminaba en el último contenedor declarado.
      const zones: Zones = { z: { capacity: 1 }, 'slot-A': { homeOnly: true }, 'slot-B': { homeOnly: true }, 'slot-C': { homeOnly: true } }
      const homes: Homes = { A: 'slot-A', B: 'slot-B', C: 'slot-C' }
      const layout: Layout = { z: ['A'], 'slot-A': [], 'slot-B': ['B'], 'slot-C': ['C'] }

      const { layout: next } = move(layout, zones, homes, 'B', 'z')

      expect(next).toEqual({ z: ['B'], 'slot-A': ['A'], 'slot-B': [], 'slot-C': ['C'] })
    })

    it('devolver una palabra a un banco sin límite no reordena a las demás', () => {
      // Caso que fallaba antes: la primera palabra del banco saltaba al final.
      const homes: Homes = { '01': 'banco', '02': 'banco', '03': 'banco', '04': 'banco', '05': 'banco' }
      const layout: Layout = { banco: ['01', '02', '03', '05'], z1: ['04'] }

      const { layout: next, movements } = move(layout, {}, homes, '04', 'banco')

      expect(next.banco).toEqual(['01', '02', '03', '05', '04'])
      expect(movements).toHaveLength(1)
    })

    it('si el home del desplazado no está disponible, intercambia con el lugar que dejó el que llega', () => {
      const zones: Zones = { z1: { capacity: 1 }, z2: { capacity: 1 } }
      const homes: Homes = { A: 'z1', B: 'z2' }
      const layout: Layout = { z1: ['A'], z2: ['B'] }

      const { layout: next } = move(layout, zones, homes, 'A', 'z2')

      expect(next).toEqual({ z1: ['B'], z2: ['A'] })
    })

    it('si no hay a dónde mandar al desplazado, se rechaza y nada cambia', () => {
      // B está en z (capacidad 1) y su home (s2) está lleno; A viene de un slot que solo acepta a A.
      const zones: Zones = { z: { capacity: 1 }, s1: { homeOnly: true, capacity: 1 }, s2: { capacity: 1 } }
      const homes: Homes = { A: 's1', B: 's2', C: 's2' }
      const layout: Layout = { z: ['B'], s1: ['A'], s2: ['C'] }

      expect(moveDrag(layout, zones, homes, 'A', 'z')).toEqual({ ok: false, reason: 'full' })
    })

    it('una zona con capacidad 0 no recibe nada', () => {
      const zones: Zones = { cerrada: { capacity: 0 } }

      expect(moveDrag({ banco: ['A'], cerrada: [] }, zones, { A: 'banco' }, 'A', 'cerrada')).toEqual({
        ok: false,
        reason: 'full',
      })
    })

    it('si la zona ya estaba por encima de su capacidad (estado inicial), desplaza a los que sobran', () => {
      const zones: Zones = { z: { capacity: 1 } }
      const homes: Homes = { X: 'bx', Y: 'by', A: 'banco' }
      const layout: Layout = { z: ['X', 'Y'], bx: [], by: [], banco: ['A'] }

      const { layout: next } = move(layout, zones, homes, 'A', 'z')

      expect(next).toEqual({ z: ['A'], bx: ['X'], by: ['Y'], banco: [] })
    })
  })

  describe('moveDrag: zonas que solo aceptan a su dueño (homeOnly)', () => {
    const zones: Zones = { 'slot-A': { homeOnly: true }, 'slot-B': { homeOnly: true } }
    const homes: Homes = { A: 'slot-A', B: 'slot-B' }

    it('rechaza a un drag que no es el dueño', () => {
      const layout: Layout = { 'slot-A': ['A'], 'slot-B': [], z: [] }

      expect(moveDrag(layout, zones, homes, 'A', 'slot-B')).toEqual({ ok: false, reason: 'home-only' })
    })

    it('el dueño sí puede regresar a su zona', () => {
      const layout: Layout = { 'slot-A': [], 'slot-B': ['B'], z: ['A'] }

      expect(move(layout, zones, homes, 'A', 'slot-A').layout['slot-A']).toEqual(['A'])
    })
  })

  describe('moveDrag: drags bloqueados (dragDisabled)', () => {
    const locked = new Set(['L'])

    it('un drag bloqueado no se puede mover', () => {
      expect(moveDrag({ banco: ['L'], z1: [] }, {}, { L: 'banco' }, 'L', 'z1', locked)).toEqual({
        ok: false,
        reason: 'locked',
      })
    })

    it('un drag bloqueado no se desplaza: si por él no hay espacio, el movimiento se rechaza y nada cambia', () => {
      // Caso que fallaba antes: el drag fijo volvía al banco cuando llegaba otro a su zona.
      const zones: Zones = { z: { capacity: 1 } }
      const homes: Homes = { L: 'banco', A: 'banco' }
      const layout: Layout = { banco: ['A'], z: ['L'] }

      expect(moveDrag(layout, zones, homes, 'A', 'z', locked)).toEqual({ ok: false, reason: 'full' })
      expect(layout).toEqual({ banco: ['A'], z: ['L'] })
    })

    it('en una zona con varios lugares se desplaza al más antiguo que no esté bloqueado', () => {
      const zones: Zones = { z: { capacity: 2 } }
      const homes: Homes = { L: 'banco', X: 'banco', A: 'banco' }
      const layout: Layout = { banco: ['A'], z: ['L', 'X'] }

      const { layout: next } = move(layout, zones, homes, 'A', 'z', locked)

      expect(next).toEqual({ banco: ['X'], z: ['L', 'A'] })
    })

    it('un bloqueado ocupa su lugar, pero no impide que lleguen otros mientras haya espacio', () => {
      const zones: Zones = { z: { capacity: 2 } }

      const { layout: next } = move({ banco: ['A'], z: ['L'] }, zones, { L: 'banco', A: 'banco' }, 'A', 'z', locked)

      expect(next.z).toEqual(['L', 'A'])
    })

    it('sin drags bloqueados todo funciona como antes', () => {
      const zones: Zones = { z: { capacity: 1 } }

      const { layout: next } = move({ banco: ['A'], z: ['L'] }, zones, { L: 'banco', A: 'banco' }, 'A', 'z')

      expect(next).toEqual({ banco: ['L'], z: ['A'] })
    })

    it('canMove respeta los bloqueados', () => {
      const zones: Zones = { z: { capacity: 1 } }
      const homes: Homes = { L: 'banco', A: 'banco' }

      expect(canMove({ banco: ['A'], z: ['L'] }, zones, homes, 'A', 'z', locked)).toBe(false)
      expect(canMove({ banco: ['A', 'L'], z: [] }, zones, homes, 'L', 'z', locked)).toBe(false)
      expect(canMove({ banco: ['A'], z: [] }, zones, homes, 'A', 'z', locked)).toBe(true)
    })
  })

  describe('canMove', () => {
    it('refleja si el movimiento sería aceptado', () => {
      const zones: Zones = { propio: { homeOnly: true } }
      const homes: Homes = { A: 'banco' }
      const layout: Layout = { banco: ['A'], propio: [], z1: [] }

      expect(canMove(layout, zones, homes, 'A', 'z1')).toBe(true)
      expect(canMove(layout, zones, homes, 'A', 'propio')).toBe(false)
      expect(canMove(layout, zones, homes, 'A', 'banco')).toBe(false)
    })
  })

  describe('reorderDrag', () => {
    const layout: Layout = { lista: ['1', '2', '3', '4'], otra: ['x', 'y'] }

    it('top lo lleva al inicio y bottom al final', () => {
      expect(reorderDrag(layout, '3', 'top').lista).toEqual(['3', '1', '2', '4'])
      expect(reorderDrag(layout, '2', 'bottom').lista).toEqual(['1', '3', '4', '2'])
    })

    it('up sube una posición y down baja una', () => {
      expect(reorderDrag(layout, '3', 'up').lista).toEqual(['1', '3', '2', '4'])
      expect(reorderDrag(layout, '2', 'down').lista).toEqual(['1', '3', '2', '4'])
    })

    it('solo reordena la zona donde está el drag, aunque otras zonas tengan varios elementos', () => {
      // Caso que fallaba antes: se reordenaba "la primera zona con más de un elemento".
      const next = reorderDrag(layout, 'y', 'top')

      expect(next.otra).toEqual(['y', 'x'])
      expect(next.lista).toBe(layout.lista)
    })

    it('si ya está en el extremo, o no existe, devuelve el mismo layout', () => {
      expect(reorderDrag(layout, '1', 'up')).toBe(layout)
      expect(reorderDrag(layout, '1', 'top')).toBe(layout)
      expect(reorderDrag(layout, '4', 'down')).toBe(layout)
      expect(reorderDrag(layout, '4', 'bottom')).toBe(layout)
      expect(reorderDrag(layout, 'no-existe', 'top')).toBe(layout)
    })

    it('no modifica el layout original', () => {
      reorderDrag(layout, '3', 'top')

      expect(layout.lista).toEqual(['1', '2', '3', '4'])
    })
  })

  describe('validDrags', () => {
    const zones: Zones = { zona1: { validate: ['A'] }, zona2: { validate: ['B'] } }

    it('incluye los drags que están en una zona que los acepta como correctos', () => {
      expect(validDrags({ banco: ['C'], zona1: ['A'], zona2: ['B'] }, zones)).toEqual(['A', 'B'])
    })

    it('un drag en una zona que no lo acepta, o en una zona sin validate, no es válido', () => {
      expect(validDrags({ banco: ['A'], zona1: ['B'], zona2: [] }, zones)).toEqual([])
    })

    it('en una zona con varios drags solo cuentan los que ella acepta', () => {
      expect(validDrags({ zona1: ['A', 'B'] }, { zona1: { validate: ['A'] } })).toEqual(['A'])
    })

    it('un elemento desplazado fuera de su zona deja de ser válido', () => {
      const homes: Homes = { A: 'banco', B: 'banco' }
      const capped: Zones = { zona1: { validate: ['A'], capacity: 1 } }
      const afterA = move({ banco: ['A', 'B'], zona1: [] }, capped, homes, 'A', 'zona1')
      const afterB = move(afterA.layout, capped, homes, 'B', 'zona1')

      expect(validDrags(afterA.layout, capped)).toEqual(['A'])
      expect(validDrags(afterB.layout, capped)).toEqual([])
    })
  })
})
