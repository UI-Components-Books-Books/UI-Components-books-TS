import type { ReactElement } from 'react'

import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ssrCases } from './ssr-cases'
import { mockMediaPlayback } from '../../test/media'
import { hydrate, renderOnServer } from '../../test/ssr'
import { Modal, VideoPlayer } from '../index'

/**
 * Hidratación: el navegador recibe el HTML generado en el servidor y React lo "adopta".
 * Si el primer render del cliente no coincide con ese HTML, React avisa y la página puede quedar
 * con contenido distinto al esperado. Por eso el primer render del cliente debe usar los mismos
 * valores que el servidor y solo después pasar a los del navegador.
 *
 * El render en el servidor sin errores ni avisos se comprueba en `ssr.node.test.tsx`.
 */

vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
    to: vi.fn((_target: unknown, vars?: { onComplete?: () => void }) => vars?.onComplete?.()),
  },
}))

// El adaptador de arrastre engancha eventos nativos que jsdom no simula; aquí solo importa el DOM.
vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: vi.fn(() => vi.fn()),
  dropTargetForElements: vi.fn(() => vi.fn()),
  monitorForElements: vi.fn(() => vi.fn()),
}))

const noop = () => {}

/**
 * HTML del servidor. jsdom ya tenía cargadas las librerías de terceros que deciden al importarse
 * si usan `useLayoutEffect` (react-aria, react-popper), y React avisa por ello; ese aviso no
 * ocurre en un servidor real y se comprueba en `ssr.node.test.tsx`, así que aquí se silencia.
 */
const serverHtml = (ui: ReactElement): string => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    return renderOnServer(ui)
  } finally {
    consoleError.mockRestore()
  }
}

beforeEach(() => {
  mockMediaPlayback()
  vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => 'WEBVTT\n' })))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Hidratación de los componentes', () => {
  it.each(ssrCases)('%s se hidrata sin diferencias con el HTML del servidor', (_name, ui) => {
    const { problems, unmount } = hydrate(ui, serverHtml(ui))

    expect(problems).toEqual([])
    unmount()
  })

  it('el contenido de un portal aparece en el body al hidratar', () => {
    const ui = (
      <Modal isOpen onClose={noop}>
        <Modal.Content><p>Contenido del modal</p></Modal.Content>
      </Modal>
    )
    const html = serverHtml(ui)
    expect(html).not.toContain('Contenido del modal')

    const { container, problems, unmount } = hydrate(ui, html)

    expect(problems).toEqual([])
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
    expect(container).not.toContainElement(screen.getByText('Contenido del modal'))
    unmount()
    expect(screen.queryByText('Contenido del modal')).not.toBeInTheDocument()
  })

  it('el botón de pantalla completa se habilita al hidratar si el navegador lo permite', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true })
    const ui = <VideoPlayer src="/v.mp4" />
    const html = serverHtml(ui)

    const { problems, unmount } = hydrate(ui, html)

    expect(html).toMatch(/aria-label="Ver en pantalla completa"[^>]*disabled=""/)
    expect(problems).toEqual([])
    expect(screen.getByRole('button', { name: 'Ver en pantalla completa' })).toBeEnabled()
    unmount()
    delete (document as { fullscreenEnabled?: boolean }).fullscreenEnabled
  })
})
