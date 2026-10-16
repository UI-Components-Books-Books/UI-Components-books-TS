// @vitest-environment node
import { useLayoutEffect } from 'react'

import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { useIsomorphicLayoutEffect } from '../../utils/useIsomorphicLayoutEffect'
import { useDarkMode } from '../useDarkMode'
import { useLocalStorage } from '../useLocalStorage'
import { useMedia } from '../useMedia'
import { useOnScreen } from '../useOnScreen'

/**
 * Los hooks al renderizar en el servidor (SSR) de verdad: este archivo corre en el entorno `node`,
 * donde no existen `window` ni `document`. En el servidor deben devolver su valor por defecto
 * (el mismo que usarán en el primer render de la hidratación).
 *
 * La hidratación en el navegador se comprueba en `ssr-hydration.test.tsx`.
 */

describe('Hooks en el servidor (entorno node)', () => {
  it('useMedia devuelve el valor por defecto', () => {
    const Probe = () => <p>{useMedia(['(min-width: 600px)'], ['ancho'], 'angosto')}</p>

    expect(renderToString(<Probe />)).toBe('<p>angosto</p>')
  })

  it('useLocalStorage devuelve el valor inicial', () => {
    const Probe = () => <p>{useLocalStorage('name', 'Bob')[0]}</p>

    expect(renderToString(<Probe />)).toBe('<p>Bob</p>')
  })

  it('useLocalStorage no falla al intentar guardar', () => {
    let setName: (value: string) => void = () => {}
    const Probe = () => {
      setName = useLocalStorage('name', 'Bob')[1]
      return null
    }
    renderToString(<Probe />)

    expect(() => setName('Alice')).not.toThrow()
  })

  it('useDarkMode devuelve el modo claro', () => {
    const Probe = () => <p>{String(useDarkMode()[0])}</p>

    expect(renderToString(<Probe />)).toBe('<p>false</p>')
  })

  it('useOnScreen no falla', () => {
    const Probe = () => <p>{String(useOnScreen()[1])}</p>

    expect(renderToString(<Probe />)).toBe('<p>false</p>')
  })
})

describe('useIsomorphicLayoutEffect en el servidor (entorno node)', () => {
  it('no emite el aviso de React sobre useLayoutEffect', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const Probe = () => {
      useIsomorphicLayoutEffect(() => {}, [])
      return null
    }

    renderToString(<Probe />)

    expect(consoleError).not.toHaveBeenCalled()
  })

  it('control: useLayoutEffect sí emite el aviso, así que el test anterior detecta el problema', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const Probe = () => {
      useLayoutEffect(() => {}, [])
      return null
    }

    renderToString(<Probe />)

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('useLayoutEffect does nothing on the server'),
      expect.anything()
    )
  })
})
