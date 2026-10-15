import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { mockMatchMedia } from '../../test/matchMedia'
import { useMedia } from '../useMedia'

const BIG = '(min-width: 1000px)'
const MEDIUM = '(min-width: 600px)'

describe('useMedia', () => {
  it('devuelve el valor de la primera media query que hace match', () => {
    const media = mockMatchMedia({ [BIG]: true, [MEDIUM]: true })

    const { result } = renderHook(() => useMedia([BIG, MEDIUM], [4, 3], 2))

    expect(result.current).toBe(4)
    expect(media.calls()).toBeGreaterThan(0)
  })

  it('devuelve el valor por defecto si ninguna media query hace match', () => {
    mockMatchMedia()

    const { result } = renderHook(() => useMedia([BIG, MEDIUM], [4, 3], 2))

    expect(result.current).toBe(2)
  })

  it('se actualiza cuando se dispara el evento change', () => {
    const media = mockMatchMedia({ [MEDIUM]: true })
    const { result } = renderHook(() => useMedia([BIG, MEDIUM], [4, 3], 2))
    expect(result.current).toBe(3)

    media.set(BIG, true)
    act(() => media.fire(BIG))

    expect(result.current).toBe(4)
  })

  it('no se vuelve a suscribir cuando se re-renderiza con arreglos literales nuevos', () => {
    const media = mockMatchMedia({ [MEDIUM]: true })
    const { rerender } = renderHook(() => useMedia([BIG, MEDIUM], [4, 3], 2))
    const listeners = media.activeListeners()
    const callsAfterMount = media.calls()

    for (let i = 0; i < 5; i++) rerender()

    expect(media.activeListeners()).toBe(listeners)
    // Antes se llamaba a matchMedia en cada render; ahora solo al montar.
    expect(media.calls()).toBe(callsAfterMount)
  })

  it('usa los values más recientes cuando cambian después de montar', () => {
    const media = mockMatchMedia({ [MEDIUM]: true })
    const { result, rerender } = renderHook(
      ({ values }) => useMedia([BIG, MEDIUM], values, 2),
      { initialProps: { values: [4, 3] } }
    )
    expect(result.current).toBe(3)

    rerender({ values: [40, 30] })
    act(() => media.fire(MEDIUM))

    expect(result.current).toBe(30)
  })

  it('se resuscribe y resincroniza el valor cuando cambian las queries', () => {
    const media = mockMatchMedia({ [MEDIUM]: true, '(min-width: 1400px)': true })
    const { result, rerender } = renderHook(
      ({ queries, values }) => useMedia(queries, values, 0),
      { initialProps: { queries: [BIG, MEDIUM], values: [4, 3] } }
    )
    expect(media.activeListeners()).toBe(2)

    rerender({ queries: ['(min-width: 1400px)'], values: [99] })

    expect(result.current).toBe(99)
    expect(media.activeListeners()).toBe(1)
  })

  it('elimina todos los listeners al desmontar', () => {
    const media = mockMatchMedia()
    const { unmount } = renderHook(() => useMedia([BIG, MEDIUM], [4, 3], 2))
    expect(media.activeListeners()).toBe(2)

    unmount()

    expect(media.activeListeners()).toBe(0)
  })
})
