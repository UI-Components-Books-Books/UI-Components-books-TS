import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { usePagination } from '../usePagination'
import type { usePaginationProps } from '../usePagination'

const setup = (props: Partial<usePaginationProps> = {}) => {
  const onChange = vi.fn()
  const hook = renderHook((p: Partial<usePaginationProps>) =>
    usePagination({ count: 10, onChange, ...p })
  , { initialProps: props })
  return { ...hook, onChange }
}

/** Representación corta de los items: el número de página o el tipo del botón. */
const shape = (items: ReturnType<typeof usePagination>['items']) =>
  items.map((item) => (item.type === 'page' ? item.page : item.type))

describe('usePagination', () => {
  it('genera previous, páginas, ellipsis y next para 10 páginas desde la 1', () => {
    const { result } = setup()

    expect(shape(result.current.items)).toEqual([
      'previous', 1, 2, 3, 4, 5, 'end-ellipsis', 10, 'next',
    ])
  })

  it('muestra ellipsis a ambos lados cuando está en una página intermedia', () => {
    const { result } = setup({ defaultPage: 5 })

    expect(shape(result.current.items)).toEqual([
      'previous', 1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10, 'next',
    ])
  })

  it('muestra solo ellipsis inicial cerca del final', () => {
    const { result } = setup({ defaultPage: 10 })

    expect(shape(result.current.items)).toEqual([
      'previous', 1, 'start-ellipsis', 6, 7, 8, 9, 10, 'next',
    ])
  })

  it('no usa ellipsis cuando hay pocas páginas', () => {
    const { result } = setup({ count: 5 })

    expect(shape(result.current.items)).toEqual(['previous', 1, 2, 3, 4, 5, 'next'])
  })

  it('marca la página actual como selected y con aria-current="page"', () => {
    const { result } = setup({ defaultPage: 3 })

    const current = result.current.items.find((item) => item.selected)

    expect(current).toMatchObject({ page: 3, 'aria-current': 'page' })
    expect(result.current.items.filter((item) => item.selected)).toHaveLength(1)
  })

  it('deshabilita previous en la primera página y next en la última', () => {
    const first = setup({ defaultPage: 1 })
    const last = setup({ defaultPage: 10 })

    expect(first.result.current.items.find((i) => i.type === 'previous')?.disabled).toBe(true)
    expect(first.result.current.items.find((i) => i.type === 'next')?.disabled).toBe(false)
    expect(last.result.current.items.find((i) => i.type === 'next')?.disabled).toBe(true)
    expect(last.result.current.items.find((i) => i.type === 'previous')?.disabled).toBe(false)
  })

  it('los ellipsis no tienen página, no se seleccionan y hacer click en ellos no hace nada', () => {
    const { result, onChange } = setup({ defaultPage: 5 })
    const event = {} as React.MouseEvent<HTMLButtonElement>

    const ellipsis = result.current.items.filter((item) => item.type.includes('ellipsis'))

    expect(ellipsis).toHaveLength(2)
    ellipsis.forEach((item) => {
      expect(item.page).toBeNull()
      expect(item.selected).toBe(false)
      act(() => item.onClick(event))
    })
    expect(onChange).not.toHaveBeenCalled()
    expect(result.current.items.find((item) => item.selected)?.page).toBe(5)
  })

  it('al hacer click en una página cambia la selección y llama a onChange', () => {
    const { result, onChange } = setup()
    const target = result.current.items.find((item) => item.page === 3)!
    const event = {} as React.MouseEvent<HTMLButtonElement>

    act(() => target.onClick(event))

    expect(onChange).toHaveBeenCalledWith(event, 3)
    expect(result.current.items.find((item) => item.selected)?.page).toBe(3)
  })

  it('next y previous avanzan y retroceden una página', () => {
    const { result, onChange } = setup({ defaultPage: 4 })
    const event = {} as React.MouseEvent<HTMLButtonElement>

    act(() => result.current.items.find((i) => i.type === 'next')!.onClick(event))
    expect(onChange).toHaveBeenLastCalledWith(event, 5)

    act(() => result.current.items.find((i) => i.type === 'previous')!.onClick(event))
    expect(onChange).toHaveBeenLastCalledWith(event, 4)
  })

  it('incluye first/last solo cuando se piden y los oculta con hidePrev/hideNext', () => {
    const withExtremes = setup({ defaultPage: 5, showFirstButton: true, showLastButton: true })
    const hidden = setup({ defaultPage: 5, hidePrevButton: true, hideNextButton: true })

    expect(shape(withExtremes.result.current.items)[0]).toBe('first')
    const extremes = shape(withExtremes.result.current.items)
    expect(extremes[extremes.length - 1]).toBe('last')
    expect(shape(hidden.result.current.items)).not.toContain('previous')
    expect(shape(hidden.result.current.items)).not.toContain('next')
  })

  it('first y last llevan a la primera y a la última página', () => {
    const { result, onChange } = setup({ defaultPage: 5, showFirstButton: true, showLastButton: true })
    const event = {} as React.MouseEvent<HTMLButtonElement>

    act(() => result.current.items.find((i) => i.type === 'last')!.onClick(event))
    expect(onChange).toHaveBeenLastCalledWith(event, 10)

    act(() => result.current.items.find((i) => i.type === 'first')!.onClick(event))
    expect(onChange).toHaveBeenLastCalledWith(event, 1)
  })

  it('deshabilita todos los items cuando disabled es true', () => {
    const { result } = setup({ disabled: true })

    expect(result.current.items.every((item) => item.disabled)).toBe(true)
  })

  it('sigue a defaultPage cuando esta cambia', () => {
    const { result, rerender } = setup({ defaultPage: 2 })
    expect(result.current.items.find((item) => item.selected)?.page).toBe(2)

    rerender({ defaultPage: 7 })

    expect(result.current.items.find((item) => item.selected)?.page).toBe(7)
  })
})
