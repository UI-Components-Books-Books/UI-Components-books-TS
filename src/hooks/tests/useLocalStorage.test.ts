import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('devuelve el valor inicial si la clave no existe', () => {
    const { result } = renderHook(() => useLocalStorage('name', 'Bob'))

    expect(result.current[0]).toBe('Bob')
  })

  it('lee el valor ya guardado (parseado desde JSON)', () => {
    window.localStorage.setItem('user', JSON.stringify({ id: 7 }))

    const { result } = renderHook(() => useLocalStorage('user', { id: 0 }))

    expect(result.current[0]).toEqual({ id: 7 })
  })

  it('actualiza el estado y persiste el nuevo valor', () => {
    const { result } = renderHook(() => useLocalStorage('name', 'Bob'))

    act(() => result.current[1]('Alice'))

    expect(result.current[0]).toBe('Alice')
    expect(window.localStorage.getItem('name')).toBe(JSON.stringify('Alice'))
  })

  it('acepta una función actualizadora como useState', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1))

    act(() => result.current[1]((previous) => previous + 1))
    act(() => result.current[1]((previous) => previous + 1))

    expect(result.current[0]).toBe(3)
    expect(window.localStorage.getItem('count')).toBe('3')
  })

  it('guarda correctamente el valor false', () => {
    const { result } = renderHook(() => useLocalStorage('flag', true))

    act(() => result.current[1](false))

    expect(window.localStorage.getItem('flag')).toBe('false')
    expect(renderHook(() => useLocalStorage('flag', true)).result.current[0]).toBe(false)
  })

  it('devuelve el valor inicial y avisa si el JSON guardado es inválido', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    window.localStorage.setItem('broken', '{not json')

    const { result } = renderHook(() => useLocalStorage('broken', 'fallback'))

    expect(result.current[0]).toBe('fallback')
    expect(warn).toHaveBeenCalled()
  })
})
