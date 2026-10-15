import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { mockMatchMedia } from '../../test/matchMedia'
import { useDarkMode } from '../useDarkMode'

const STORAGE_KEY = 'dark-mode-enabled'
const DARK = '(prefers-color-scheme: dark)'

describe('useDarkMode', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.body.removeAttribute('data-dark-mode')
  })

  it('respeta la elección guardada aunque el sistema prefiera lo contrario (recarga)', () => {
    window.localStorage.setItem(STORAGE_KEY, 'true')
    mockMatchMedia({ [DARK]: false })

    const first = renderHook(() => useDarkMode())
    first.unmount()
    const { result } = renderHook(() => useDarkMode())

    expect(result.current[0]).toBe(true)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true')
    expect(document.body).toHaveAttribute('data-dark-mode', 'true')
  })

  it('una elección guardada en claro gana sobre un sistema en oscuro', () => {
    window.localStorage.setItem(STORAGE_KEY, 'false')
    mockMatchMedia({ [DARK]: true })

    const { result } = renderHook(() => useDarkMode())

    expect(result.current[0]).toBe(false)
    expect(document.body).not.toHaveAttribute('data-dark-mode')
  })

  it('sin elección guardada sigue la preferencia del sistema, sin guardarla', () => {
    mockMatchMedia({ [DARK]: true })

    const { result } = renderHook(() => useDarkMode())

    expect(result.current[0]).toBe(true)
    expect(document.body).toHaveAttribute('data-dark-mode', 'true')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('sin elección guardada y sistema en claro queda en claro', () => {
    mockMatchMedia({ [DARK]: false })

    const { result } = renderHook(() => useDarkMode())

    expect(result.current[0]).toBe(false)
    expect(document.body).not.toHaveAttribute('data-dark-mode')
  })

  it('al elegir el usuario, la elección se guarda y sobrevive a una recarga', () => {
    mockMatchMedia({ [DARK]: false })
    const first = renderHook(() => useDarkMode())

    act(() => first.result.current[1](true))

    expect(first.result.current[0]).toBe(true)
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true')
    expect(document.body).toHaveAttribute('data-dark-mode', 'true')

    first.unmount()
    const { result } = renderHook(() => useDarkMode())
    expect(result.current[0]).toBe(true)
  })

  it('quita el atributo del body al desactivar el modo oscuro', () => {
    mockMatchMedia({ [DARK]: false })
    const { result } = renderHook(() => useDarkMode())

    act(() => result.current[1](true))
    expect(document.body).toHaveAttribute('data-dark-mode', 'true')

    act(() => result.current[1](false))
    expect(document.body).not.toHaveAttribute('data-dark-mode')
  })
})
