import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockMediaPlayback, setMediaProps } from '../../../test/media'
import { VideoPlayer } from '../index'
import type { VideoPlayerProps } from '../types/types'

// Las animaciones de aparición/salida de las barras avisan que terminaron con `onComplete`.
vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
    to: vi.fn((_target: unknown, vars?: { onComplete?: () => void }) => vars?.onComplete?.()),
  },
}))

const VTT = ['WEBVTT', '', '00:00:05.000 --> 00:00:09.000', 'Primer segmento', '', '00:00:10.000 --> 00:00:14.000', 'Segundo segmento', ''].join('\n')

let media: ReturnType<typeof mockMediaPlayback>

beforeEach(() => {
  media = mockMediaPlayback()
  vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => VTT })))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const SRC = '/video.mp4'
const CAPTION = { src: '/subs.vtt', lang: 'es' as const }
const AUDIO = '/descripcion.mp3'

const setup = (props: Partial<VideoPlayerProps> = {}) => render(<VideoPlayer src={SRC} {...props} />)
const videoEl = () => document.querySelector('video') as HTMLVideoElement
const toolbar = () => document.querySelector('.video-player__toolbar') as HTMLElement
const tool = (name: string) => within(toolbar()).getByRole('button', { name })
const slider = () => screen.getByRole('slider', { name: 'Progreso del video' })
const timeText = () => document.querySelector('.video-player__time')?.textContent

/** Simula que el navegador cargó el video con la duración dada. */
const loadVideo = (duration = 125) => {
  setMediaProps(videoEl(), { duration })
  fireEvent.loadedData(videoEl())
}

const adToolbar = () => document.querySelector('.video-audio-description') as HTMLElement

describe('VideoPlayer', () => {
  describe('estructura', () => {
    it('renderiza el video con su fuente y los controles principales', () => {
      setup()

      expect(videoEl().querySelector('source')).toHaveAttribute('src', SRC)
      expect(tool('Reproducir video')).toBeInTheDocument()
      expect(tool('Volumen')).toBeInTheDocument()
      expect(slider()).toBeInTheDocument()
    })

    it('limita el ancho máximo (1000px por defecto) y permite cambiarlo', () => {
      const { container, rerender } = setup()
      expect((container.firstElementChild as HTMLElement).style.maxWidth).toBe('1000px')

      rerender(<VideoPlayer src={SRC} width="640px" />)

      expect((container.firstElementChild as HTMLElement).style.maxWidth).toBe('640px')
    })

    it('agrega addClass al reproductor', () => {
      const { container } = setup({ addClass: 'mi-video' })

      expect(container.firstElementChild).toHaveClass('video-player', 'mi-video')
    })

    it('usa el poster cuando se indica', () => {
      setup({ poster: '/portada.png' })

      expect(videoEl()).toHaveAttribute('poster', '/portada.png')
    })

    it('usa el id recibido en el video', () => {
      setup({ id: 'mi-video' })

      expect(videoEl()).toHaveAttribute('id', 'mi-video')
    })

    // CARACTERIZACIÓN: el contenedor y el <video> comparten el mismo id. Es un id duplicado (HTML
    // inválido), pero el resto del código depende de ello: useFullScreen hace getElementById(uid)
    // para obtener el contenedor y useTranscript busca `video[id="uid"]`. Si se corrige, hay que
    // cambiar ambos hooks a la vez.
    it('el contenedor y el <video> comparten el mismo id', () => {
      setup({ id: 'mi-video' })

      expect(document.querySelectorAll('#mi-video')).toHaveLength(2)
    })

    it('sin subtítulos ni audio no muestra los botones opcionales', () => {
      setup()

      expect(within(toolbar()).queryByRole('button', { name: 'Subtítulos' })).not.toBeInTheDocument()
      expect(within(toolbar()).queryByRole('button', { name: 'Transcripción' })).not.toBeInTheDocument()
      expect(within(toolbar()).queryByRole('button', { name: 'Audio descriptivo' })).not.toBeInTheDocument()
      expect(videoEl().querySelector('track')).not.toBeInTheDocument()
    })

    it('con subtítulos agrega la pista y los botones de subtítulos y transcripción', () => {
      setup({ caption: CAPTION })

      const track = videoEl().querySelector('track') as HTMLTrackElement
      expect(track).toHaveAttribute('kind', 'captions')
      expect(track).toHaveAttribute('srclang', 'es')
      expect(track).toHaveAttribute('label', 'Subtítulos en español')
      expect(track).toHaveAttribute('src', CAPTION.src)
      expect(tool('Subtítulos')).toBeInTheDocument()
      expect(tool('Transcripción')).toBeInTheDocument()
    })

    it('rotula la pista en inglés cuando el idioma es "en"', () => {
      setup({ caption: { src: '/en.vtt', lang: 'en' } })

      expect(videoEl().querySelector('track')).toHaveAttribute('label', 'English captions')
    })

    it('con audio descriptivo muestra su botón', () => {
      setup({ audio: AUDIO })

      expect(tool('Audio descriptivo')).toBeInTheDocument()
    })
  })

  describe('reproducción', () => {
    it('el botón de reproducir inicia el video y cambia a "Pausar video"', async () => {
      setup()

      await userEvent.click(tool('Reproducir video'))

      expect(media.play).toHaveBeenCalled()
      expect(media.play.mock.instances).toContain(videoEl())
      expect(tool('Pausar video')).toBeInTheDocument()
    })

    it('al presionar de nuevo pausa el video', async () => {
      setup()
      await userEvent.click(tool('Reproducir video'))
      media.pause.mockClear()

      await userEvent.click(tool('Pausar video'))

      expect(media.pause.mock.instances).toContain(videoEl())
      expect(tool('Reproducir video')).toBeInTheDocument()
    })

    it('al hacer click sobre el video también alterna la reproducción', async () => {
      setup()

      await userEvent.click(videoEl())
      expect(tool('Pausar video')).toBeInTheDocument()

      await userEvent.click(videoEl())
      expect(tool('Reproducir video')).toBeInTheDocument()
    })

    it('al terminar el video vuelve al estado de pausa', async () => {
      setup()
      await userEvent.click(tool('Reproducir video'))

      fireEvent.ended(videoEl())

      expect(tool('Reproducir video')).toBeInTheDocument()
    })

    it('mientras el video está en pausa, un "ended" no cambia nada', () => {
      setup()

      fireEvent.ended(videoEl())

      expect(tool('Reproducir video')).toBeInTheDocument()
    })
  })

  describe('tiempo', () => {
    it('empieza en 00:00 / 00:00 y es invisible para lectores de pantalla', () => {
      setup()

      expect(timeText()).toBe('00:00/00:00')
      expect(document.querySelector('.video-player__time')).toHaveAttribute('aria-hidden', 'true')
    })

    it('al cargar el video muestra su duración y la usa como máximo del slider', () => {
      setup()

      loadVideo(125)

      expect(timeText()).toBe('00:00/02:05')
      expect(slider()).toHaveAttribute('aria-valuemax', '125')
    })

    it('mientras se reproduce, actualiza el tiempo con timeupdate', async () => {
      setup()
      loadVideo(125)
      await userEvent.click(tool('Reproducir video'))

      setMediaProps(videoEl(), { currentTime: 72 })
      fireEvent.timeUpdate(videoEl())

      expect(timeText()).toBe('01:12/02:05')
      expect(slider()).toHaveAttribute('aria-valuenow', '72')
    })

    it('si el video está en pausa ignora timeupdate', () => {
      setup()
      loadVideo(125)

      setMediaProps(videoEl(), { currentTime: 72 })
      fireEvent.timeUpdate(videoEl())

      expect(timeText()).toBe('00:00/02:05')
    })

    it('el slider describe el progreso con palabras para lectores de pantalla', async () => {
      setup()
      loadVideo(125)
      await userEvent.click(tool('Reproducir video'))

      setMediaProps(videoEl(), { currentTime: 72 })
      fireEvent.timeUpdate(videoEl())

      expect(slider().getAttribute('aria-valuetext')).toBe('01 minutos y 12 segundos de 02 minutos y 05 segundos')
    })

    it('para videos de más de una hora incluye las horas en la descripción', () => {
      setup()

      loadVideo(3725)

      expect(slider().getAttribute('aria-valuetext')).toContain('de 01 horas, 02 minutos y 05 segundos')
    })
  })

  describe('slider de progreso', () => {
    it('es un slider enfocable con límites desde 0', () => {
      setup()

      expect(slider()).toHaveAttribute('tabindex', '0')
      expect(slider()).toHaveAttribute('aria-valuemin', '0')
    })

    it('la barra espaciadora alterna la reproducción', () => {
      setup()

      // El componente lee `event.keyCode` (32), que los navegadores sí rellenan.
      fireEvent.keyDown(slider(), { key: ' ', keyCode: 32 })
      expect(tool('Pausar video')).toBeInTheDocument()

      fireEvent.keyDown(slider(), { key: ' ', keyCode: 32 })
      expect(tool('Reproducir video')).toBeInTheDocument()
    })

    it('otras teclas no alteran la reproducción', () => {
      setup()

      fireEvent.keyDown(slider(), { key: 'a', keyCode: 65 })

      expect(tool('Reproducir video')).toBeInTheDocument()
    })

    // BRECHA DE ACCESIBILIDAD CONOCIDA: el elemento declara role="slider" y es enfocable, pero
    // solo responde a la barra espaciadora. Un slider ARIA debe poder moverse con las flechas
    // (y Inicio/Fin). Cuando se implemente este test fallará: quitar `.fails`.
    it.fails('la flecha derecha adelanta el video', () => {
      setup()
      loadVideo(100)

      fireEvent.keyDown(slider(), { key: 'ArrowRight', keyCode: 39 })

      expect(Number(slider().getAttribute('aria-valuenow'))).toBeGreaterThan(0)
    })

    describe('con el puntero', () => {
      beforeEach(() => {
        // jsdom no calcula layout: se simula un slider de 200px de ancho que empieza en x = 0.
        vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(200)
      })

      it('hacer click sobre la pista salta a ese punto del video', () => {
        setup()
        loadVideo(100)
        const track = document.querySelector('[data-resize="track"]') as HTMLElement

        fireEvent(track, new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100, button: 0 }))

        expect(slider()).toHaveAttribute('aria-valuenow', '50')
        expect(videoEl().currentTime).toBe(50)
      })

      it('al soltar el puntero termina la búsqueda', () => {
        setup()
        loadVideo(100)
        const track = document.querySelector('[data-resize="track"]') as HTMLElement

        fireEvent(track, new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100, button: 0 }))
        fireEvent(document, new MouseEvent('pointerup', { bubbles: true }))
        setMediaProps(videoEl(), { currentTime: 60 })

        // Con la búsqueda terminada y el video en pausa, el tiempo del estado sigue siendo el elegido.
        expect(slider()).toHaveAttribute('aria-valuenow', '50')
      })

      it('el click derecho no mueve el video', () => {
        setup()
        loadVideo(100)
        const track = document.querySelector('[data-resize="track"]') as HTMLElement

        fireEvent(track, new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100, button: 2 }))

        expect(slider()).toHaveAttribute('aria-valuenow', '0')
      })

      it('antes de que el video cargue no responde al puntero', () => {
        setup()
        const track = document.querySelector('[data-resize="track"]') as HTMLElement

        fireEvent(track, new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 100, button: 0 }))

        expect(slider()).toHaveAttribute('aria-valuenow', '0')
      })
    })
  })

  describe('volumen', () => {
    const volumeSlider = () => screen.getByLabelText('Controlar volumen') as HTMLInputElement

    it('empieza al máximo', () => {
      setup()

      expect(volumeSlider()).toHaveValue('100')
      expect(volumeSlider()).toHaveAttribute('aria-valuetext', '100%')
      expect(videoEl().volume).toBe(1)
    })

    it('al mover el control cambia el volumen del video', () => {
      setup()

      fireEvent.change(volumeSlider(), { target: { value: '50' } })

      expect(videoEl().volume).toBe(0.5)
      expect(volumeSlider()).toHaveAttribute('aria-valuetext', '50%')
    })

    it('el botón de silencio mutea el video y deja el volumen en 0', async () => {
      setup()

      await userEvent.click(tool('Volumen'))

      expect(videoEl().muted).toBe(true)
      expect(volumeSlider()).toHaveValue('0')
      expect(tool('Mutear video')).toHaveClass('video-player__button--disabled')
    })

    it('al quitar el silencio recupera el último volumen elegido', async () => {
      setup()
      fireEvent.change(volumeSlider(), { target: { value: '40' } })
      await userEvent.click(tool('Volumen'))

      await userEvent.click(tool('Mutear video'))

      expect(videoEl().muted).toBe(false)
      expect(volumeSlider()).toHaveValue('40')
    })

    it('subir el volumen estando muteado quita el silencio', async () => {
      setup()
      await userEvent.click(tool('Volumen'))
      expect(videoEl().muted).toBe(true)

      fireEvent.change(volumeSlider(), { target: { value: '70' } })

      expect(videoEl().muted).toBe(false)
      expect(volumeSlider()).toHaveValue('70')
    })
  })

  describe('subtítulos', () => {
    it('empiezan desactivados: botón sin presionar y clase que oculta las pistas', () => {
      setup({ caption: CAPTION })

      expect(tool('Subtítulos')).toHaveAttribute('aria-pressed', 'false')
      expect(videoEl()).toHaveClass('video-player__no-captions')
    })

    it('el botón los activa y los desactiva', async () => {
      setup({ caption: CAPTION })

      await userEvent.click(tool('Subtítulos'))
      expect(tool('Subtítulos')).toHaveAttribute('aria-pressed', 'true')
      expect(videoEl()).not.toHaveClass('video-player__no-captions')

      await userEvent.click(tool('Subtítulos'))
      expect(videoEl()).toHaveClass('video-player__no-captions')
    })
  })

  describe('transcripción', () => {
    const openTranscript = async () => {
      setup({ caption: CAPTION })
      await userEvent.click(tool('Transcripción'))
      return screen.findByRole('button', { name: 'Primer segmento' })
    }

    it('empieza oculta', () => {
      setup({ caption: CAPTION })

      expect(tool('Transcripción')).toHaveAttribute('aria-pressed', 'false')
      expect(document.querySelector('.video-player__transcription')).not.toBeInTheDocument()
    })

    it('al activarla descarga el VTT y lista los segmentos con sus tiempos', async () => {
      await openTranscript()

      expect(fetch).toHaveBeenCalledWith(CAPTION.src)
      expect(screen.getByRole('button', { name: 'Segundo segmento' })).toBeInTheDocument()
      const first = document.getElementById('cue-0') as HTMLElement
      expect(first).toHaveTextContent('00:05')
      expect(first).toHaveTextContent('00:09')
    })

    it('muestra el tiempo actual del video en el encabezado', async () => {
      await openTranscript()

      expect(document.querySelector('.video-player__transcription-header')).toHaveTextContent('00:00')
    })

    it('al hacer click en un segmento el video salta al inicio de ese segmento', async () => {
      await openTranscript()

      await userEvent.click(screen.getByRole('button', { name: 'Segundo segmento' }))

      await waitFor(() => expect(videoEl().currentTime).toBe(10))
    })

    it('se puede ocultar de nuevo', async () => {
      await openTranscript()

      await userEvent.click(tool('Transcripción'))

      expect(document.querySelector('.video-player__transcription')).not.toBeInTheDocument()
    })
  })

  describe('pantalla completa', () => {
    let fullscreenEl: Element | null = null
    const setFullscreenEl = (element: Element | null) => {
      fullscreenEl = element
    }

    beforeEach(() => {
      fullscreenEl = null
      Object.defineProperty(document, 'fullscreenElement', { get: () => fullscreenEl, configurable: true })
      Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true })
      Element.prototype.requestFullscreen = vi.fn(async function (this: Element) {
        setFullscreenEl(this)
      })
      document.exitFullscreen = vi.fn(async () => {
        setFullscreenEl(null)
      })
    })

    afterEach(() => {
      Object.defineProperty(document, 'fullscreenEnabled', { value: undefined, configurable: true })
    })

    it('está deshabilitado si el navegador no soporta pantalla completa', () => {
      Object.defineProperty(document, 'fullscreenEnabled', { value: undefined, configurable: true })
      setup()

      expect(tool('Ver en pantalla completa')).toBeDisabled()
    })

    it('entra en pantalla completa con el contenedor del reproductor', async () => {
      setup({ id: 'mi-video' })

      await userEvent.click(tool('Ver en pantalla completa'))

      await waitFor(() => expect(tool('Salir de pantalla completa')).toHaveAttribute('aria-pressed', 'true'))
      expect(fullscreenEl).toBe(document.querySelector('.video-player__container'))
      expect(document.querySelector('.video-player__container')).toHaveAttribute('data-vpf', 'true')
    })

    it('puede salir de pantalla completa con el mismo botón', async () => {
      setup()
      await userEvent.click(tool('Ver en pantalla completa'))

      await userEvent.click(await within(toolbar()).findByRole('button', { name: 'Salir de pantalla completa' }))

      await waitFor(() => expect(tool('Ver en pantalla completa')).toHaveAttribute('aria-pressed', 'false'))
    })
  })

  describe('audio descriptivo', () => {
    const openAD = async () => {
      setup({ audio: AUDIO })
      await userEvent.click(tool('Audio descriptivo'))
    }

    it('empieza oculto, con el botón sin presionar', () => {
      setup({ audio: AUDIO })

      expect(tool('Audio descriptivo')).toHaveAttribute('aria-pressed', 'false')
      expect(adToolbar()).not.toBeInTheDocument()
    })

    it('el botón muestra la barra de controles del audio descriptivo y le da el foco', async () => {
      await openAD()

      expect(adToolbar()).toBeInTheDocument()
      expect(adToolbar()).toHaveAttribute('aria-label', 'Controles del audio descriptivo')
      expect(tool('Audio descriptivo')).toHaveAttribute('aria-pressed', 'true')
      expect(adToolbar()).toHaveFocus()
    })

    it('al abrirla activa el audio descriptivo (el interruptor queda encendido)', async () => {
      await openAD()

      expect(within(adToolbar()).getByRole('switch', { name: 'Activar o desactivar el audio descriptivo' })).toBeChecked()
    })

    it('el interruptor activa y desactiva el audio descriptivo', async () => {
      await openAD()
      const toggle = within(adToolbar()).getByRole('switch')

      await userEvent.click(toggle)
      expect(toggle).not.toBeChecked()

      await userEvent.click(toggle)
      expect(toggle).toBeChecked()
    })

    it('el botón Cerrar oculta la barra y desactiva el audio descriptivo', async () => {
      await openAD()

      await userEvent.click(screen.getByRole('button', { name: 'Cerrar los controles del audio descriptivo' }))

      expect(adToolbar()).not.toBeInTheDocument()
      expect(tool('Audio descriptivo')).toHaveAttribute('aria-pressed', 'false')
    })

    it('Escape cierra la barra', async () => {
      await openAD()

      fireEvent.keyDown(adToolbar(), { key: 'Escape' })

      expect(adToolbar()).not.toBeInTheDocument()
    })

    it('el foco queda atrapado: Tab en el último elemento vuelve al primero', async () => {
      await openAD()
      const focusables = Array.from(adToolbar().querySelectorAll<HTMLElement>('a, button, input, [tabindex]:not([tabindex="-1"])'))
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      last.focus()

      fireEvent.keyDown(last, { key: 'Tab' })

      expect(first).toHaveFocus()
    })

    it('el foco queda atrapado: Shift+Tab en el primer elemento va al último', async () => {
      await openAD()
      const focusables = Array.from(adToolbar().querySelectorAll<HTMLElement>('a, button, input, [tabindex]:not([tabindex="-1"])'))
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      first.focus()

      fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })

      expect(last).toHaveFocus()
    })

    it('tiene su propio control de volumen, independiente del volumen del video', async () => {
      await openAD()
      const adVolume = adToolbar().querySelector('input[type="range"]') as HTMLInputElement

      fireEvent.change(adVolume, { target: { value: '80' } })

      expect(within(adToolbar()).getByText('Volumen del audio descriptivo (80%)')).toBeInTheDocument()
      expect(videoEl().volume).toBe(1)
    })

    // BUG CONOCIDO (accesibilidad): el <label> apunta con htmlFor a "volume-audio-description-slider",
    // pero el input tiene id="volume-audio-description"; al no coincidir, el control queda sin
    // nombre accesible. Cuando se corrija este test fallará: quitar `.fails`.
    it.fails('el control de volumen del audio descriptivo tiene nombre accesible', async () => {
      await openAD()

      expect(within(adToolbar()).getByLabelText('Controlar volumen del audio descriptivo')).toBeInTheDocument()
    })

    it('el botón de reproducción de la barra controla el mismo video', async () => {
      await openAD()

      await userEvent.click(within(adToolbar()).getByRole('button', { name: 'Reproducir video' }))

      expect(tool('Pausar video')).toBeInTheDocument()
      expect(within(adToolbar()).getByRole('button', { name: 'Pausar video' })).toBeInTheDocument()
    })

    it('crea un audio con la pista descriptiva y lo reproduce junto con el video', async () => {
      await openAD()
      media.play.mockClear()

      await userEvent.click(tool('Reproducir video'))

      const players = media.play.mock.instances as unknown as HTMLMediaElement[]
      expect(players).toContain(videoEl())
      expect(players.some((p) => p instanceof HTMLAudioElement && p.src.endsWith(AUDIO))).toBe(true)
    })

    describe('saltos de 10 segundos', () => {
      it('"Avanzar" suma 10 segundos al presionar y los aplica al video', async () => {
        await openAD()
        loadVideo(100)

        fireEvent.mouseDown(screen.getByRole('button', { name: 'Avanzar 10 segundos del video' }))

        expect(timeText()).toBe('00:10/01:40')
        expect(videoEl().currentTime).toBe(10)
      })

      it('"Retroceder" resta 10 segundos sin bajar de 0', async () => {
        await openAD()
        loadVideo(100)
        fireEvent.mouseDown(screen.getByRole('button', { name: 'Avanzar 10 segundos del video' }))
        fireEvent.mouseUp(screen.getByRole('button', { name: 'Avanzar 10 segundos del video' }))

        fireEvent.mouseDown(screen.getByRole('button', { name: 'Retroceder 10 segundos del video' }))
        expect(timeText()).toBe('00:00/01:40')

        fireEvent.mouseDown(screen.getByRole('button', { name: 'Retroceder 10 segundos del video' }))
        expect(timeText()).toBe('00:00/01:40')
      })

      it('"Avanzar" no pasa de la duración total', async () => {
        await openAD()
        loadVideo(15)

        const forward = screen.getByRole('button', { name: 'Avanzar 10 segundos del video' })
        fireEvent.mouseDown(forward)
        fireEvent.mouseUp(forward)
        fireEvent.mouseDown(forward)

        expect(timeText()).toBe('00:15/00:15')
      })

      it('también funcionan con el teclado (Enter)', async () => {
        await openAD()
        loadVideo(100)

        fireEvent.keyDown(screen.getByRole('button', { name: 'Avanzar 10 segundos del video' }), { key: 'Enter' })

        expect(timeText()).toBe('00:10/01:40')
      })
    })

    it('cerrar la barra no pierde la posición del video', async () => {
      await openAD()
      loadVideo(100)
      fireEvent.mouseDown(screen.getByRole('button', { name: 'Avanzar 10 segundos del video' }))
      fireEvent.mouseUp(screen.getByRole('button', { name: 'Avanzar 10 segundos del video' }))

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Cerrar los controles del audio descriptivo' }))
      })

      expect(timeText()).toBe('00:10/01:40')
    })
  })
})
