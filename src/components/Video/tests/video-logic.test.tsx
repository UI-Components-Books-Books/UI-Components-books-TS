import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFullScreen } from '../hooks/useFullScreen'
import { useTranscript } from '../hooks/useTranscript'
import { playerReducer } from '../src/video-reducer'
import { PlayerActionKind } from '../types/types'
import type { PlayerState } from '../types/types'

const STATE: PlayerState = {
  isPlaying: false,
  muted: false,
  volume: 1,
  totalDuration: 100,
  currentTime: 30,
  isSeeking: false,
  hasVideoLoaded: false,
  activeCaption: false,
  isFullScreen: false,
  isActiveAD: false,
  volumeAD: 1,
  showAD: false,
  activeVideoTranscription: false,
}

const reduce = (type: PlayerActionKind, payload?: unknown, state = STATE) =>
  playerReducer(state, { type, payload: payload as never })

describe('playerReducer', () => {
  it.each([
    [PlayerActionKind.PLAY_PAUSE, true, 'isPlaying', true],
    [PlayerActionKind.ON_MUTE, true, 'muted', true],
    [PlayerActionKind.VOLUME_CHANGE, 0.4, 'volume', 0.4],
    [PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME, 55, 'currentTime', 55],
    [PlayerActionKind.UPDATE_SEEKING, true, 'isSeeking', true],
    [PlayerActionKind.TOGGLE_CAPTION, true, 'activeCaption', true],
    [PlayerActionKind.FULLSCREEN, true, 'isFullScreen', true],
    [PlayerActionKind.AUDIO_DESCRIPTION_CHANGE, true, 'isActiveAD', true],
    [PlayerActionKind.VOLUME_AUDIO_DESCRIPTION_CHANGE, 0.2, 'volumeAD', 0.2],
    [PlayerActionKind.SHOW_AUDIO_DESCRIPTION, true, 'showAD', true],
    [PlayerActionKind.TOGGLE_VIDEO_TRANSCRIPTION, true, 'activeVideoTranscription', true],
  ] as const)('%s actualiza solo %s', (type, payload, key, expected) => {
    const next = reduce(type, payload)

    expect(next[key]).toBe(expected)
    expect({ ...next, [key]: STATE[key] }).toEqual(STATE)
  })

  it('HAS_VIDEO_LOADED guarda si cargó y la duración total', () => {
    const next = reduce(PlayerActionKind.HAS_VIDEO_LOADED, { hasVideoLoaded: true, totalDuration: 240 })

    expect(next).toMatchObject({ hasVideoLoaded: true, totalDuration: 240 })
  })

  it('VIDEO_SKIP_FORWARD suma segundos al tiempo actual', () => {
    expect(reduce(PlayerActionKind.VIDEO_SKIP_FORWARD, 10).currentTime).toBe(40)
  })

  it('VIDEO_SKIP_FORWARD no supera la duración total', () => {
    expect(reduce(PlayerActionKind.VIDEO_SKIP_FORWARD, 10, { ...STATE, currentTime: 95 }).currentTime).toBe(100)
  })

  it('VIDEO_SKIP_BACKWARD resta segundos al tiempo actual', () => {
    expect(reduce(PlayerActionKind.VIDEO_SKIP_BACKWARD, 10).currentTime).toBe(20)
  })

  it('VIDEO_SKIP_BACKWARD no baja de 0', () => {
    expect(reduce(PlayerActionKind.VIDEO_SKIP_BACKWARD, 10, { ...STATE, currentTime: 4 }).currentTime).toBe(0)
  })

  it('los saltos sin cantidad numérica no cambian el tiempo', () => {
    expect(reduce(PlayerActionKind.VIDEO_SKIP_FORWARD, undefined).currentTime).toBe(30)
    expect(reduce(PlayerActionKind.VIDEO_SKIP_BACKWARD, 'diez').currentTime).toBe(30)
  })

  it('una acción desconocida devuelve el mismo estado', () => {
    expect(playerReducer(STATE, { type: 'NO_EXISTE' as PlayerActionKind })).toBe(STATE)
  })

  it('no muta el estado anterior', () => {
    const frozen = Object.freeze({ ...STATE })

    expect(() => playerReducer(frozen, { type: PlayerActionKind.PLAY_PAUSE, payload: true })).not.toThrow()
  })
})

describe('useTranscript', () => {
  const VTT = [
    'WEBVTT',
    '',
    '00:00:01.000 --> 00:00:03.500',
    'Hola mundo',
    '',
    '00:01:05.250 --> 01:00:00.000',
    'Segunda',
    'línea',
    '',
  ].join('\n')

  const stubFetch = (body: string) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ text: async () => body }))
    )

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('no pide nada si no hay archivo de subtítulos', () => {
    stubFetch(VTT)

    const { result } = renderHook(() => useTranscript('vid'))

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.transcript).toEqual([])
    expect(result.current.currentCueId).toBeNull()
  })

  it('descarga el VTT y lo convierte en cues con inicio, fin y texto', async () => {
    stubFetch(VTT)

    const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))

    await waitFor(() => expect(result.current.transcript).toHaveLength(2))
    expect(fetch).toHaveBeenCalledWith('/subs.vtt')
    expect(result.current.transcript.map((cue) => ({ ...cue, text: cue.text.trim() }))).toEqual([
      { start: 1, end: 3.5, text: 'Hola mundo' },
      { start: 65.25, end: 3600, text: 'Segunda línea' },
    ])
  })

  it('entiende tiempos con formato MM:SS.mmm (sin horas)', async () => {
    stubFetch('WEBVTT\n\n01:30.500 --> 02:00.000\nTexto\n')

    const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))

    await waitFor(() => expect(result.current.transcript).toHaveLength(1))
    expect(result.current.transcript[0]).toMatchObject({ start: 90.5, end: 120 })
  })

  it('con ajustes de cue (align, position...) el inicio se interpreta bien', async () => {
    stubFetch('WEBVTT\n\n00:00:01.000 --> 00:00:02.000 align:start position:0%\nTexto\n')

    const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))

    await waitFor(() => expect(result.current.transcript).toHaveLength(1))
    expect(result.current.transcript[0].start).toBe(1)
  })

  // BUG CONOCIDO (probable en producción): si la línea de tiempos lleva ajustes de cue
  // (`align:start position:0%`, habituales en VTT exportados por herramientas de subtitulado),
  // `parseTime` parte el texto por ":", obtiene 5 partes, cae en la rama "solo segundos" y
  // devuelve end = 0. Con end = 0 ningún cue llega a estar activo, así que la transcripción no
  // resalta ni desplaza al cue actual. Cuando se corrija este test fallará: quitar `.fails`.
  it.fails('con ajustes de cue (align, position...) el fin también se interpreta bien', async () => {
    stubFetch('WEBVTT\n\n00:00:01.000 --> 00:00:02.000 align:start position:0%\nTexto\n')

    const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))

    await waitFor(() => expect(result.current.transcript).toHaveLength(1))
    expect(result.current.transcript[0].end).toBe(2)
  })

  it('con archivo de líneas CRLF sigue interpretando bien los tiempos', async () => {
    stubFetch('WEBVTT\r\n\r\n00:00:01.000 --> 00:00:02.000\r\nHola\r\n')

    const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))

    await waitFor(() => expect(result.current.transcript).toHaveLength(1))
    expect(result.current.transcript[0]).toMatchObject({ start: 1, end: 2 })
    expect(result.current.transcript[0].text.trim()).toBe('Hola')
  })

  it('si la descarga falla deja la transcripción vacía y lo informa por consola', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))

    const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))

    await waitFor(() => expect(error).toHaveBeenCalled())
    expect(result.current.transcript).toEqual([])
  })

  // BUG CONOCIDO: los identificadores de cue de WebVTT (líneas "1", "2"... antes de la línea de
  // tiempos) no se reconocen y se pegan al texto del cue ANTERIOR ("Hola 2"). Es habitual en
  // archivos convertidos desde SRT. Cuando se corrija este test fallará: quitar `.fails`.
  it.fails('no pega los identificadores numéricos de cue al texto del cue anterior', async () => {
    stubFetch('WEBVTT\n\n1\n00:00:01.000 --> 00:00:03.000\nHola\n\n2\n00:00:04.000 --> 00:00:06.000\nMundo\n')

    const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))

    await waitFor(() => expect(result.current.transcript).toHaveLength(2))
    expect(result.current.transcript[0].text.trim()).toBe('Hola')
  })

  describe('cue activo', () => {
    const makeVideo = () => {
      const track: { activeCues: Array<{ startTime: number; endTime: number }>; oncuechange: null | (() => void) } = {
        activeCues: [],
        oncuechange: null,
      }
      const video = document.createElement('video')
      video.id = 'vid'
      Object.defineProperty(video, 'textTracks', { value: [track] })
      document.body.appendChild(video)
      return { video, track }
    }

    it('informa qué cue está activo cuando el video dispara cuechange', async () => {
      stubFetch(VTT)
      const { video, track } = makeVideo()

      const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))
      await waitFor(() => expect(result.current.transcript).toHaveLength(2))

      track.activeCues = [{ startTime: 65.25, endTime: 3600 }]
      act(() => track.oncuechange?.())
      expect(result.current.currentCueId).toBe(1)

      track.activeCues = []
      act(() => track.oncuechange?.())
      expect(result.current.currentCueId).toBeNull()

      video.remove()
    })

    it('si el cue activo no está en la transcripción, no hay cue actual', async () => {
      stubFetch(VTT)
      const { video, track } = makeVideo()
      const { result } = renderHook(() => useTranscript('vid', '/subs.vtt'))
      await waitFor(() => expect(result.current.transcript).toHaveLength(2))

      track.activeCues = [{ startTime: 999, endTime: 1000 }]
      act(() => track.oncuechange?.())

      expect(result.current.currentCueId).toBeNull()
      video.remove()
    })
  })
})

describe('useFullScreen', () => {
  let element: HTMLDivElement

  const setFullscreenElement = (value: Element | null) =>
    Object.defineProperty(document, 'fullscreenElement', { value, configurable: true })

  beforeEach(() => {
    element = document.createElement('div')
    element.id = 'reproductor'
    document.body.appendChild(element)
    setFullscreenElement(null)
    element.requestFullscreen = vi.fn(async () => {
      setFullscreenElement(element)
    })
    document.exitFullscreen = vi.fn(async () => {
      setFullscreenElement(null)
    })
  })

  afterEach(() => {
    element.remove()
    setFullscreenElement(null)
  })

  it('empieza fuera de pantalla completa', () => {
    const { result } = renderHook(() => useFullScreen('reproductor'))

    expect(result.current[0]).toBe(false)
  })

  it('al alternar pide pantalla completa para el elemento con ese id', async () => {
    const { result } = renderHook(() => useFullScreen('reproductor'))

    await act(async () => result.current[1]())

    expect(element.requestFullscreen).toHaveBeenCalledTimes(1)
    expect(result.current[0]).toBe(true)
  })

  it('al alternar estando en pantalla completa, sale de ella', async () => {
    const { result } = renderHook(() => useFullScreen('reproductor'))
    await act(async () => result.current[1]())

    await act(async () => result.current[1]())

    expect(document.exitFullscreen).toHaveBeenCalledTimes(1)
    expect(result.current[0]).toBe(false)
  })

  it('si el usuario sale con Escape (fullscreenchange) el estado se actualiza', async () => {
    const { result } = renderHook(() => useFullScreen('reproductor'))
    await act(async () => result.current[1]())
    expect(result.current[0]).toBe(true)

    setFullscreenElement(null)
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'))
    })

    expect(result.current[0]).toBe(false)
  })

  it('si el elemento no existe lo informa por consola y no cambia el estado', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useFullScreen('no-existe'))

    await act(async () => result.current[1]())

    expect(error).toHaveBeenCalledWith(expect.stringContaining('no-existe'))
    expect(result.current[0]).toBe(false)
  })

  it('deja de escuchar fullscreenchange al desmontar', () => {
    const remove = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => useFullScreen('reproductor'))

    unmount()

    expect(remove).toHaveBeenCalledWith('fullscreenchange', expect.any(Function))
  })
})
