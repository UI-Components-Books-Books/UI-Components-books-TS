import { vi } from 'vitest'

/**
 * jsdom no implementa la reproducción multimedia: `play()`, `pause()` y `load()` solo imprimen
 * "Not implemented" y `paused` siempre vale true. Este helper los reemplaza por una versión
 * mínima que lleva la cuenta de `paused` por elemento.
 *
 * Importante: NO dispara los eventos `play`/`pause`. Los navegadores los emiten de forma asíncrona
 * después de que `play()` retorna, y emitirlos de forma síncrona cambiaría el orden en que React
 * procesa los cambios de estado. Cuando un test necesite simular ese evento del navegador, debe
 * disparar `fireEvent.play(audio)` / `fireEvent.pause(audio)` explícitamente.
 *
 * Usa `vi.spyOn`, así que `restoreMocks: true` (ver vitest.config.ts) lo deshace entre tests.
 */
export function mockMediaPlayback() {
  const pausedState = new WeakMap<HTMLMediaElement, boolean>()
  const isPaused = (element: HTMLMediaElement) => pausedState.get(element) ?? true

  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(function (
    this: HTMLMediaElement
  ) {
    return isPaused(this)
  })

  const play = vi
    .spyOn(HTMLMediaElement.prototype, 'play')
    .mockImplementation(function (this: HTMLMediaElement) {
      pausedState.set(this, false)
      return Promise.resolve()
    })

  const pause = vi
    .spyOn(HTMLMediaElement.prototype, 'pause')
    .mockImplementation(function (this: HTMLMediaElement) {
      pausedState.set(this, true)
    })

  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})

  // Un navegador real crea un TextTrack en `textTracks[0]` por cada <track default>; jsdom devuelve
  // una lista vacía. Se simula una pista por elemento con la misma forma que usa useTranscript.
  const textTracks = new WeakMap<HTMLMediaElement, unknown[]>()
  vi.spyOn(HTMLMediaElement.prototype, 'textTracks', 'get').mockImplementation(function (
    this: HTMLMediaElement
  ) {
    if (!textTracks.has(this)) textTracks.set(this, [{ activeCues: [], oncuechange: null }])
    return textTracks.get(this) as unknown as TextTrackList
  })

  return {
    play,
    pause,
    /** Marca un elemento como "reproduciéndose" sin pasar por `play()`. */
    setPlaying(element: HTMLMediaElement, playing = true) {
      pausedState.set(element, !playing)
    },
  }
}

/**
 * Define propiedades de solo lectura del elemento (p. ej. `duration`), que jsdom deja en NaN/0.
 */
export function setMediaProps(element: HTMLMediaElement, props: Partial<Record<'duration' | 'currentTime' | 'readyState', number>>) {
  Object.entries(props).forEach(([key, value]) => {
    Object.defineProperty(element, key, { value, configurable: true, writable: true })
  })
}
