// @vitest-environment node
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { ssrCases } from './ssr-cases'
import { VideoPlayer } from '../index'

/**
 * Renderizado en el servidor (SSR) de verdad: este archivo corre en el entorno `node`, donde no
 * existen `window` ni `document`, ni cuando se importan las librerías ni cuando se renderiza.
 * Así cualquier acceso al navegador durante el render lanza un ReferenceError, igual que en un
 * servidor real, y se detectan también los avisos de React (p. ej. `useLayoutEffect`).
 *
 * La hidratación de este mismo HTML en el navegador se comprueba en `ssr-hydration.test.tsx`.
 */

describe('SSR en el entorno node', () => {
  it('no hay window ni document', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
  })

  it.each(ssrCases)('%s se renderiza sin lanzar errores ni avisos', (_name, ui) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(() => renderToString(ui)).not.toThrow()

    expect(consoleError).not.toHaveBeenCalled()
    expect(consoleWarn).not.toHaveBeenCalled()
  })

  it('los portales no renderizan nada en el servidor', () => {
    const html = renderToString(
      <>
        {ssrCases.find(([name]) => name === 'Portal')?.[1]}
        {ssrCases.find(([name]) => name === 'Modal abierto')?.[1]}
      </>
    )

    expect(html).toBe('')
  })

  it('el botón de pantalla completa sale deshabilitado, porque en el servidor no se sabe si hay soporte', () => {
    const html = renderToString(<VideoPlayer src="/v.mp4" />)

    expect(html).toMatch(/aria-label="Ver en pantalla completa"[^>]*disabled=""/)
  })
})
