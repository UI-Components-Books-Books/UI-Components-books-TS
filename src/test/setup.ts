import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Sin `globals: true` Testing Library no limpia el DOM solo entre tests.
afterEach(() => {
  cleanup()
})

/**
 * jsdom no implementa algunas APIs del navegador que usan los componentes.
 * Aquí van valores por defecto inofensivos; cada test puede sobrescribirlos.
 */
function installBrowserStubs() {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
  }

  // jsdom no implementa el desplazamiento programático de elementos.
  if (typeof Element.prototype.scrollTo === 'undefined') {
    Element.prototype.scrollTo = () => {}
  }
  if (typeof Element.prototype.scrollIntoView === 'undefined') {
    Element.prototype.scrollIntoView = () => {}
  }

  if (typeof window.ResizeObserver === 'undefined') {
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
  }

  if (typeof window.IntersectionObserver === 'undefined') {
    class IntersectionObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    window.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver
  }
}

// Los tests de renderizado en el servidor corren con `@vitest-environment node`, donde no existe
// `window`: allí no hay nada que completar.
if (typeof window !== 'undefined') {
  installBrowserStubs()
}
