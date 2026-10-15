/**
 * `window.matchMedia` falso que imita al navegador: cada llamada devuelve un
 * MediaQueryList NUEVO, y todos comparten el estado `matches` de su query.
 *
 * @example
 * const media = mockMatchMedia({ '(prefers-color-scheme: dark)': true })
 * media.set('(min-width: 600px)', true)
 * media.fire('(min-width: 600px)') // dispara los listeners 'change'
 */
export function mockMatchMedia(initial: Record<string, boolean> = {}) {
  const state: Record<string, boolean> = { ...initial }
  const created: Record<string, Array<{ listeners: Set<() => void> }>> = {}
  let calls = 0

  window.matchMedia = ((query: string) => {
    calls++
    const listeners = new Set<() => void>()
    const mql = {
      get matches() {
        return !!state[query]
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
      addListener: (listener: () => void) => listeners.add(listener),
      removeListener: (listener: () => void) => listeners.delete(listener),
      dispatchEvent: () => false,
      listeners,
    }
    created[query] = [...(created[query] || []), mql]
    return mql as unknown as MediaQueryList
  }) as typeof window.matchMedia

  return {
    /** Cambia si una query hace match (no dispara eventos). */
    set(query: string, matches: boolean) {
      state[query] = matches
    },
    /** Dispara el evento 'change' en todos los listeners registrados para la query. */
    fire(query: string) {
      const list = created[query] || []
      list.forEach((mql) => [...mql.listeners].forEach((listener) => listener()))
    },
    /** Cantidad total de listeners 'change' actualmente suscritos. */
    activeListeners() {
      return Object.values(created).reduce(
        (total, list) => total + list.reduce((sum, mql) => sum + mql.listeners.size, 0),
        0
      )
    },
    /** Cantidad de veces que se llamó a `window.matchMedia`. */
    calls: () => calls,
  }
}
