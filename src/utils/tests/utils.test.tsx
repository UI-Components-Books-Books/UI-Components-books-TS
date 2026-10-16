import { render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { callAll } from '../callAll'
import { cn } from '../cn'
import { convertTime, formatTime } from '../converterTime'
import { createContext } from '../createcontext'

describe('callAll', () => {
  it('llama a cada manejador, en orden, con el mismo evento', () => {
    const calls: string[] = []
    const first = vi.fn(() => calls.push('primero'))
    const second = vi.fn(() => calls.push('segundo'))
    const event = { type: 'click' }

    callAll(first, second)(event)

    expect(first).toHaveBeenCalledWith(event)
    expect(second).toHaveBeenCalledWith(event)
    expect(calls).toEqual(['primero', 'segundo'])
  })

  it('omite los manejadores no definidos', () => {
    const handler = vi.fn()

    expect(() => callAll(undefined, handler, undefined)('evento')).not.toThrow()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('sin manejadores no hace nada', () => {
    expect(() => callAll()('evento')).not.toThrow()
  })
})

describe('convertTime', () => {
  it('convierte segundos en horas, minutos y segundos con dos dígitos', () => {
    expect(convertTime(3725)).toEqual({ hours: '01', minutes: '02', seconds: '05' })
  })

  it('devuelve ceros para 0 segundos', () => {
    expect(convertTime(0)).toEqual({ hours: '00', minutes: '00', seconds: '00' })
  })

  it('descarta los decimales', () => {
    expect(convertTime(59.9)).toEqual({ hours: '00', minutes: '00', seconds: '59' })
  })
})

describe('formatTime', () => {
  it('usa mm:ss cuando no hay horas', () => {
    expect(formatTime(65)).toBe('01:05')
  })

  it('usa hh:mm:ss cuando hay horas', () => {
    expect(formatTime(3600)).toBe('01:00:00')
    expect(formatTime(7322)).toBe('02:02:02')
  })
})

describe('cn', () => {
  it('combina clases y descarta valores falsy', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c')
  })

  it('soporta objetos y arreglos condicionales', () => {
    expect(cn('base', { active: true, disabled: false }, ['x', 'y'])).toBe('base active x y')
  })
})

describe('createContext', () => {
  it('devuelve el proveedor y un hook que lee el valor', () => {
    const [Provider, useValue] = createContext<{ name: string }>({ name: 'TestContext' })

    const { result } = renderHook(() => useValue(), {
      wrapper: ({ children }) => <Provider value={{ name: 'Bob' }}>{children}</Provider>,
    })

    expect(result.current).toEqual({ name: 'Bob' })
  })

  it('usa defaultValue cuando no hay proveedor', () => {
    const [, useValue] = createContext<string>({ defaultValue: 'por defecto' })

    const { result } = renderHook(() => useValue())

    expect(result.current).toBe('por defecto')
  })

  it('devuelve undefined sin proveedor ni defaultValue', () => {
    const [, useValue] = createContext<string>()

    const { result } = renderHook(() => useValue())

    expect(result.current).toBeUndefined()
  })

  it('el valor llega a los componentes hijos', () => {
    const [Provider, useValue] = createContext<number>()
    const Child = () => <span>{useValue()}</span>

    const { getByText } = render(
      <Provider value={42}>
        <Child />
      </Provider>
    )

    expect(getByText('42')).toBeInTheDocument()
  })
})
