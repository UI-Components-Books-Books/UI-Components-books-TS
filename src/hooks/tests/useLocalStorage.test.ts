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

  it('la función actualizadora recibe siempre el valor más reciente, aunque se llame varias veces seguidas', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1))

    act(() => {
      result.current[1]((previous) => previous + 1)
      result.current[1]((previous) => previous + 1)
    })

    expect(result.current[0]).toBe(3)
  })

  it('conserva la identidad del valor y de la función entre renders', () => {
    window.localStorage.setItem('user', JSON.stringify({ id: 7 }))
    const { result, rerender } = renderHook(() => useLocalStorage('user', { id: 0 }))
    const [firstValue, firstSetter] = result.current

    rerender()
    rerender()

    expect(result.current[0]).toBe(firstValue)
    expect(result.current[1]).toBe(firstSetter)
  })

  it('devuelve siempre el mismo valor inicial cuando no hay nada guardado', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('user', { id: 0 }))
    const first = result.current[0]

    rerender()

    expect(result.current[0]).toBe(first)
  })

  it('mantiene sincronizados a todos los que usan la misma clave', () => {
    const first = renderHook(() => useLocalStorage('shared', 'a'))
    const second = renderHook(() => useLocalStorage('shared', 'a'))

    act(() => first.result.current[1]('b'))

    expect(second.result.current[0]).toBe('b')
  })

  it('no mezcla claves distintas', () => {
    const first = renderHook(() => useLocalStorage('one', 'a'))
    const second = renderHook(() => useLocalStorage('two', 'a'))

    act(() => first.result.current[1]('b'))

    expect(second.result.current[0]).toBe('a')
  })

  it('se actualiza cuando otra pestaña cambia el valor (evento storage)', () => {
    const { result } = renderHook(() => useLocalStorage('tab', 'a'))

    act(() => {
      window.localStorage.setItem('tab', JSON.stringify('desde otra pestaña'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'tab' }))
    })

    expect(result.current[0]).toBe('desde otra pestaña')
  })

  it('lee el valor nuevo cuando cambia la clave', () => {
    window.localStorage.setItem('first', JSON.stringify('uno'))
    window.localStorage.setItem('second', JSON.stringify('dos'))
    const { result, rerender } = renderHook(({ storageKey }) => useLocalStorage(storageKey, ''), {
      initialProps: { storageKey: 'first' },
    })
    expect(result.current[0]).toBe('uno')

    rerender({ storageKey: 'second' })

    expect(result.current[0]).toBe('dos')
  })

  it('guardar undefined elimina la clave y vuelve al valor inicial', () => {
    const { result } = renderHook(() => useLocalStorage<string | undefined>('maybe', 'inicial'))
    act(() => result.current[1]('guardado'))
    expect(window.localStorage.getItem('maybe')).not.toBeNull()

    act(() => result.current[1](undefined))

    expect(window.localStorage.getItem('maybe')).toBeNull()
    expect(result.current[0]).toBe('inicial')
  })

  it('deja de escuchar al desmontar', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useLocalStorage('bye', 'a'))

    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function))
  })

  describe('con el almacenamiento bloqueado', () => {
    it('devuelve el valor inicial si no se puede leer', () => {
      window.localStorage.setItem('blocked-read', JSON.stringify('Alice'))
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError')
      })

      const { result } = renderHook(() => useLocalStorage('blocked-read', 'Bob'))

      expect(result.current[0]).toBe('Bob')
    })

    it('sigue funcionando en memoria si no se puede guardar, y avisa', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError')
      })
      const { result } = renderHook(() => useLocalStorage('blocked-write', 'Bob'))

      act(() => result.current[1]('Alice'))

      expect(result.current[0]).toBe('Alice')
      expect(window.localStorage.getItem('blocked-write')).toBeNull()
      expect(warn).toHaveBeenCalled()

      // Cuando el almacenamiento vuelve a funcionar, se guarda y se deja de usar la memoria.
      setItem.mockRestore()
      act(() => result.current[1]('Carol'))
      expect(window.localStorage.getItem('blocked-write')).toBe(JSON.stringify('Carol'))
      expect(result.current[0]).toBe('Carol')
    })
  })
})
