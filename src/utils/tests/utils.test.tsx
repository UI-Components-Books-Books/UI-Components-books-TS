import { createRef } from 'react'

import { render, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { callAll } from '../callAll'
import { cn } from '../cn'
import { convertTime, formatTime } from '../converterTime'
import { createContext } from '../createcontext'
import { getChildRef } from '../getChildRef'
import { mergeRefs } from '../mergeRefs'
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect'

describe('mergeRefs', () => {
  it('asigna el nodo a refs de objeto y a refs de tipo callback', () => {
    const objectRef = createRef<HTMLDivElement>()
    const callbackRef = vi.fn()
    const node = document.createElement('div')

    mergeRefs(objectRef, callbackRef)(node)

    expect(objectRef.current).toBe(node)
    expect(callbackRef).toHaveBeenCalledWith(node)
  })

  it('al soltar el nodo (null) lo propaga a todas', () => {
    const objectRef = createRef<HTMLDivElement>()
    const callbackRef = vi.fn()
    const merged = mergeRefs(objectRef, callbackRef)
    merged(document.createElement('div'))

    merged(null)

    expect(objectRef.current).toBeNull()
    expect(callbackRef).toHaveBeenLastCalledWith(null)
  })

  it('omite las refs undefined y null', () => {
    const objectRef = createRef<HTMLDivElement>()
    const node = document.createElement('div')

    expect(() => mergeRefs(undefined, null, objectRef)(node)).not.toThrow()
    expect(objectRef.current).toBe(node)
  })

  it('sin refs no hace nada', () => {
    expect(() => mergeRefs()(document.createElement('div'))).not.toThrow()
  })

  it('combinadas se pueden usar como prop ref de un elemento', () => {
    const objectRef = createRef<HTMLButtonElement>()
    const callbackRef = vi.fn()

    const { getByRole } = render(<button ref={mergeRefs(objectRef, callbackRef)}>x</button>)

    expect(objectRef.current).toBe(getByRole('button'))
    expect(callbackRef).toHaveBeenCalledWith(getByRole('button'))
  })
})

describe('getChildRef', () => {
  it('devuelve la ref de objeto del elemento hijo', () => {
    const ref = createRef<HTMLButtonElement>()

    expect(getChildRef(<button ref={ref} />)).toBe(ref)
  })

  it('devuelve la ref de tipo callback del elemento hijo', () => {
    const ref = vi.fn()

    expect(getChildRef(<button ref={ref} />)).toBe(ref)
  })

  it('usa el primer elemento cuando hay varios hijos', () => {
    const ref = createRef<HTMLButtonElement>()

    expect(getChildRef([<button key="a" ref={ref} />, <button key="b" />])).toBe(ref)
  })

  it('devuelve undefined si el hijo no tiene ref', () => {
    expect(getChildRef(<button />)).toBeUndefined()
  })

  it('devuelve undefined si no es un elemento (texto, nulo o sin hijos)', () => {
    expect(getChildRef('texto')).toBeUndefined()
    expect(getChildRef(null)).toBeUndefined()
    expect(getChildRef(undefined)).toBeUndefined()
  })
})

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

describe('useIsomorphicLayoutEffect', () => {
  it('en el navegador ejecuta el efecto antes de que el navegador pinte, con el DOM ya actualizado', () => {
    const seen: Array<string | null | undefined> = []
    const Probe = () => {
      useIsomorphicLayoutEffect(() => {
        seen.push(document.getElementById('target')?.textContent)
      }, [])
      return <p id="target">listo</p>
    }

    render(<Probe />)

    expect(seen).toEqual(['listo'])
  })

  it('vuelve a ejecutar el efecto solo cuando cambian las dependencias y limpia al desmontar', () => {
    const effect = vi.fn()
    const cleanup = vi.fn()
    const Probe = ({ value }: { value: number }) => {
      useIsomorphicLayoutEffect(() => {
        effect(value)
        return cleanup
      }, [value])
      return null
    }

    const { rerender, unmount } = render(<Probe value={1} />)
    rerender(<Probe value={1} />)
    expect(effect).toHaveBeenCalledTimes(1)

    rerender(<Probe value={2} />)
    expect(effect).toHaveBeenCalledTimes(2)
    expect(cleanup).toHaveBeenCalledTimes(1)

    unmount()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })
})
