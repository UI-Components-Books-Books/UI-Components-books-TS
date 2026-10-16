import type { ReactElement } from 'react'

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { vi } from 'vitest'

/**
 * Globales que existen en el navegador y no en Node. El código seguro para el servidor
 * las comprueba con `typeof window === 'undefined'` o no las toca durante el render.
 */
const BROWSER_GLOBALS = ['window', 'document'] as const

/**
 * Renderiza a HTML como lo haría un servidor: sin `window` ni `document`.
 *
 * Los tests corren en jsdom, que sí los tiene, así que se ocultan solo mientras dura el render.
 * Cualquier acceso a ellos durante el render lanza un `ReferenceError`, igual que en Node.
 *
 * @example
 * const html = renderOnServer(<Button label="Hola" />)
 */
export function renderOnServer(ui: ReactElement): string {
  const original = BROWSER_GLOBALS.map(
    (name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const
  )

  BROWSER_GLOBALS.forEach((name) => {
    Object.defineProperty(globalThis, name, { value: undefined, configurable: true, writable: true })
  })

  try {
    return renderToString(ui)
  } finally {
    original.forEach(([name, descriptor]) => {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    })
  }
}

/**
 * Hidrata el HTML generado por `renderOnServer`, como hace el navegador al cargar una página.
 *
 * Recoge todo lo que React reporta durante la hidratación (`console.error` y errores recuperables):
 * si `problems` queda vacío, el HTML del servidor coincide con el primer render del cliente.
 *
 * @example
 * const html = renderOnServer(ui)
 * const { container, problems } = hydrate(ui, html)
 * expect(problems).toEqual([])
 */
export function hydrate(ui: ReactElement, html: string) {
  const problems: string[] = []
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.append(container)

  const consoleError = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    problems.push(String(args[0]).split('\n')[0])
  })

  let root: ReturnType<typeof hydrateRoot> | undefined
  act(() => {
    root = hydrateRoot(container, ui, {
      onRecoverableError: (error) => problems.push(String((error as Error).message)),
    })
  })

  return {
    container,
    problems,
    unmount() {
      act(() => root?.unmount())
      consoleError.mockRestore()
      container.remove()
    },
  }
}
