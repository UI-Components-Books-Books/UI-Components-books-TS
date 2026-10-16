import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { mockMatchMedia } from '../../test/matchMedia'
import { hydrate, renderOnServer } from '../../test/ssr'
import { useDarkMode } from '../useDarkMode'
import { useLocalStorage } from '../useLocalStorage'
import { useMedia } from '../useMedia'

/**
 * Hidratación de los hooks: el servidor genera el HTML con los valores por defecto y el navegador
 * lo adopta. El primer render del cliente debe usar esos mismos valores (si no, React avisa de
 * que el HTML no coincide) y enseguida debe pasar a los valores reales del navegador.
 *
 * El render en el servidor sin errores se comprueba en `ssr.node.test.tsx`.
 */

const WIDE = '(min-width: 600px)'
const DARK = '(prefers-color-scheme: dark)'

beforeEach(() => {
  window.localStorage.clear()
  document.body.removeAttribute('data-dark-mode')
})

describe('Hidratación: control del propio helper', () => {
  it('detecta cuando el cliente renderiza algo distinto al HTML del servidor', () => {
    const Mismatch = () => <p>{typeof window === 'undefined' ? 'servidor' : 'cliente'}</p>
    const html = renderOnServer(<Mismatch />)
    expect(html).toBe('<p>servidor</p>')

    const { problems, unmount } = hydrate(<Mismatch />, html)

    expect(problems.length).toBeGreaterThan(0)
    unmount()
  })
})

describe('useMedia al hidratar', () => {
  it('el primer render usa el valor por defecto y luego el de la media query', () => {
    const media = mockMatchMedia({ [WIDE]: true })
    const rendered: string[] = []
    const Probe = () => {
      const value = useMedia([WIDE], ['ancho'], 'angosto')
      rendered.push(value)
      return <p>{value}</p>
    }

    const html = renderOnServer(<Probe />)
    expect(html).toBe('<p>angosto</p>')
    expect(media.calls()).toBe(0)
    rendered.length = 0

    const { container, problems, unmount } = hydrate(<Probe />, html)

    expect(problems).toEqual([])
    expect(rendered).toEqual(['angosto', 'ancho'])
    expect(container).toHaveTextContent('ancho')
    unmount()
  })

  it('después de hidratar sigue los cambios de la media query', () => {
    const media = mockMatchMedia({ [WIDE]: true })
    const Probe = () => <p>{useMedia([WIDE], ['ancho'], 'angosto')}</p>
    const { container, problems, unmount } = hydrate(<Probe />, renderOnServer(<Probe />))
    expect(container).toHaveTextContent('ancho')

    media.set(WIDE, false)
    act(() => media.fire(WIDE))

    expect(problems).toEqual([])
    expect(container).toHaveTextContent('angosto')
    unmount()
  })
})

describe('useLocalStorage al hidratar', () => {
  it('el primer render usa el valor inicial y luego el guardado', () => {
    window.localStorage.setItem('name', JSON.stringify('Alice'))
    const rendered: string[] = []
    const Probe = () => {
      const [name] = useLocalStorage('name', 'Bob')
      rendered.push(name)
      return <p>{name}</p>
    }

    const html = renderOnServer(<Probe />)
    expect(html).toBe('<p>Bob</p>')
    rendered.length = 0

    const { container, problems, unmount } = hydrate(<Probe />, html)

    expect(problems).toEqual([])
    expect(rendered).toEqual(['Bob', 'Alice'])
    expect(container).toHaveTextContent('Alice')
    unmount()
  })

  it('sin valor guardado se queda con el valor inicial, sin renderizar de más', () => {
    const rendered: string[] = []
    const Probe = () => {
      const [name] = useLocalStorage('name', 'Bob')
      rendered.push(name)
      return <p>{name}</p>
    }
    const html = renderOnServer(<Probe />)
    rendered.length = 0

    const { problems, unmount } = hydrate(<Probe />, html)

    expect(problems).toEqual([])
    expect(rendered).toEqual(['Bob'])
    unmount()
  })
})

describe('useDarkMode al hidratar', () => {
  const Probe = () => {
    const [enabled] = useDarkMode()
    return <p>{enabled ? 'oscuro' : 'claro'}</p>
  }

  it('la elección guardada se aplica después de hidratar, sin diferencias con el servidor', () => {
    window.localStorage.setItem('dark-mode-enabled', 'true')
    mockMatchMedia({ [DARK]: false })
    const html = renderOnServer(<Probe />)
    expect(html).toBe('<p>claro</p>')

    const { container, problems, unmount } = hydrate(<Probe />, html)

    expect(problems).toEqual([])
    expect(container).toHaveTextContent('oscuro')
    expect(document.body).toHaveAttribute('data-dark-mode', 'true')
    unmount()
  })

  it('sin elección guardada sigue la preferencia del sistema después de hidratar', () => {
    mockMatchMedia({ [DARK]: true })
    const html = renderOnServer(<Probe />)

    const { container, problems, unmount } = hydrate(<Probe />, html)

    expect(html).toBe('<p>claro</p>')
    expect(problems).toEqual([])
    expect(container).toHaveTextContent('oscuro')
    expect(document.body).toHaveAttribute('data-dark-mode', 'true')
    unmount()
  })

  it('una elección guardada en claro gana sobre un sistema en oscuro', () => {
    window.localStorage.setItem('dark-mode-enabled', 'false')
    mockMatchMedia({ [DARK]: true })

    const { container, problems, unmount } = hydrate(<Probe />, renderOnServer(<Probe />))

    expect(problems).toEqual([])
    expect(container).toHaveTextContent('claro')
    expect(document.body).not.toHaveAttribute('data-dark-mode')
    unmount()
  })
})
