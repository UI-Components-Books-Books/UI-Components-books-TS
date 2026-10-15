import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mockMediaPlayback, setMediaProps } from '../../../test/media'
import { Interpreter } from '../index'

// La animación de salida avisa que terminó en `onComplete`; aquí se completa al instante.
vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
    to: vi.fn((_target: unknown, vars?: { onComplete?: () => void }) => vars?.onComplete?.()),
  },
}))

const SOURCES_EVENT = 'changeInterpreteVideoSources'
const VISIBILITY_EVENT = 'changeInterpreteVideoVisibility'
const URLS = { accesibilityURL: '/descriptivo.mp4', contentURL: '/contenido.mp4' }

const floatButton = () => screen.getByRole('button', { name: 'Intérprete de lenguaje de señas' })
const openButton = async () => userEvent.click(floatButton())
const sendSources = (detail: { accesibilityURL?: string; contentURL?: string }) =>
  act(() => {
    document.dispatchEvent(new CustomEvent(SOURCES_EVENT, { detail }))
  })
const videos = () => Array.from(document.querySelectorAll('video'))
// Orden en el DOM: [video de contenido, video descriptivo (accesibilidad)]
const contentVideo = () => videos()[0]
const accesibilityVideo = () => videos()[1]
const playButton = () => screen.getByRole('button', { name: /(Reproducir|Pausar) video/ })
const scale = (container: HTMLElement) =>
  (container.querySelector('.c-interpreter__zoom') as HTMLElement).style.getPropertyValue('--scale')

/** Las URLs llegan ANTES de abrir el intérprete (flujo habitual: la página carga y luego se abre). */
const open = async (urls: { accesibilityURL?: string; contentURL?: string } = URLS) => {
  const utils = render(<Interpreter />)
  if (Object.keys(urls).length) await sendSources(urls)
  await openButton()
  return utils
}

let media: ReturnType<typeof mockMediaPlayback>

beforeEach(() => {
  media = mockMediaPlayback()
})

describe('Interpreter', () => {
  describe('botón flotante', () => {
    it('renderiza un botón accesible y no muestra el intérprete al inicio', () => {
      render(<Interpreter />)

      expect(floatButton()).toBeEnabled()
      expect(document.querySelector('.c-interpreter')).not.toBeInTheDocument()
    })

    it('agrega addClass al contenedor', () => {
      const { container } = render(<Interpreter addClass="mi-interprete" />)

      expect(container.firstElementChild).toHaveClass('c-interpreter__container', 'mi-interprete')
    })

    it('permite reemplazar el ícono', () => {
      render(<Interpreter icon={<svg data-testid="mi-icono" />} />)

      expect(screen.getByTestId('mi-icono')).toBeInTheDocument()
    })
  })

  describe('apertura y cierre', () => {
    it('al presionar el botón flotante muestra el intérprete y se deshabilita el botón', async () => {
      render(<Interpreter />)

      await openButton()

      expect(document.querySelector('.c-interpreter')).toBeInTheDocument()
      expect(floatButton()).toBeDisabled()
    })

    it('muestra todos los controles del intérprete', async () => {
      await open()

      ;['Video descriptivo', 'Video de contenido', 'Incrementar zoom del interprete', 'Arrastrar video', 'Cerrar'].forEach(
        (name) => expect(screen.getByRole('button', { name })).toBeInTheDocument()
      )
    })

    it('Cerrar oculta el intérprete y vuelve a habilitar el botón flotante', async () => {
      await open()

      await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

      expect(document.querySelector('.c-interpreter')).not.toBeInTheDocument()
      expect(floatButton()).toBeEnabled()
    })

    it('se puede volver a abrir después de cerrarlo', async () => {
      await open()
      await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

      await openButton()

      expect(document.querySelector('.c-interpreter')).toBeInTheDocument()
    })

    // CARACTERIZACIÓN: el evento de visibilidad lleva `detail.hidden === true` cuando el
    // intérprete se ABRE y `false` cuando se cierra, es decir, el nombre parece invertido.
    // No se marca como bug porque es API pública hacia las aplicaciones que lo escuchan
    // (cambiarlo sería un cambio incompatible). Si se corrige, actualizar este test.
    it('emite changeInterpreteVideoVisibility al abrir y al cerrar', async () => {
      const listener = vi.fn()
      document.addEventListener(VISIBILITY_EVENT, listener as EventListener)
      render(<Interpreter />)

      await openButton()
      await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

      document.removeEventListener(VISIBILITY_EVENT, listener as EventListener)
      expect(listener).toHaveBeenCalledTimes(2)
      expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ hidden: true })
      expect((listener.mock.calls[1][0] as CustomEvent).detail).toEqual({ hidden: false })
    })
  })

  describe('videos disponibles', () => {
    it('sin URLs oculta los botones de video y deshabilita la reproducción', async () => {
      await open({})

      expect(screen.queryByRole('button', { name: 'Video descriptivo' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Video de contenido' })).not.toBeInTheDocument()
      expect(playButton()).toBeDisabled()
    })

    it('solo muestra el botón del video que tiene URL', async () => {
      await open({ contentURL: '/solo-contenido.mp4' })

      expect(screen.queryByRole('button', { name: 'Video descriptivo' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Video de contenido' })).toBeInTheDocument()
    })

    it('asigna las URLs recibidas por el evento a cada <video>', async () => {
      await open()

      expect(contentVideo()).toHaveAttribute('src', URLS.contentURL)
      expect(accesibilityVideo()).toHaveAttribute('src', URLS.accesibilityURL)
    })

    it('muestra por defecto el video descriptivo cuando existe', async () => {
      await open()

      expect(accesibilityVideo()).not.toHaveClass('c-video__video--hidden')
      expect(contentVideo()).toHaveClass('c-video__video--hidden')
      expect(document.querySelector('[aria-live="polite"]')).toHaveAttribute(
        'aria-label',
        'Intérprete de lenguaje de señas, presentando video 1 (descriptivo)'
      )
    })

    it('si solo hay video de contenido, lo muestra', async () => {
      await open({ contentURL: '/solo-contenido.mp4' })

      expect(contentVideo()).not.toHaveClass('c-video__video--hidden')
    })

    it('permite cambiar entre el video descriptivo y el de contenido', async () => {
      await open()

      await userEvent.click(screen.getByRole('button', { name: 'Video de contenido' }))
      expect(contentVideo()).not.toHaveClass('c-video__video--hidden')
      expect(accesibilityVideo()).toHaveClass('c-video__video--hidden')
      expect(document.querySelector('[aria-live="polite"]')).toHaveAttribute(
        'aria-label',
        'Intérprete de lenguaje de señas, presentando video 2 (contenido)'
      )

      await userEvent.click(screen.getByRole('button', { name: 'Video descriptivo' }))
      expect(accesibilityVideo()).not.toHaveClass('c-video__video--hidden')
    })

    it('los videos arrancan silenciados y sin precarga', async () => {
      await open()

      videos().forEach((video) => {
        expect(video.muted).toBe(true)
        expect(video).toHaveAttribute('preload', 'none')
      })
    })

    // CARACTERIZACIÓN: el video por defecto solo se elige mientras el intérprete está cerrado
    // (la guarda `if (shouldRender) return` del efecto). Si las URLs llegan con el intérprete ya
    // abierto, aparecen los botones pero no se selecciona ningún video: hay que elegirlo a mano.
    it('si las URLs llegan con el intérprete abierto no elige un video automáticamente', async () => {
      await open({})

      await sendSources(URLS)

      expect(screen.getByRole('button', { name: 'Video descriptivo' })).toBeInTheDocument()
      expect(playButton()).toBeDisabled()

      await userEvent.click(screen.getByRole('button', { name: 'Video descriptivo' }))
      expect(playButton()).toBeEnabled()
    })

    it('deja de escuchar el evento de URLs al desmontarse', async () => {
      const { unmount } = await open()
      unmount()

      expect(() => sendSources(URLS)).not.toThrow()
    })
  })

  describe('zoom', () => {
    it('empieza en escala 1', async () => {
      const { container } = await open()

      expect(scale(container)).toBe('1')
    })

    it('cada click lo aumenta (1.1, 1.15, 1.2) y luego vuelve a 1', async () => {
      const { container } = await open()
      const zoom = screen.getByRole('button', { name: 'Incrementar zoom del interprete' })

      const levels: string[] = []
      for (let i = 0; i < 4; i++) {
        await userEvent.click(zoom)
        levels.push(scale(container))
      }

      expect(levels).toEqual(['1.1', '1.15', '1.2', '1'])
    })
  })

  describe('arrastre', () => {
    it('el botón de arrastre actúa como manejador del movimiento', async () => {
      await open()

      expect(screen.getByRole('button', { name: 'Arrastrar video' })).toHaveClass('js-c-interpreter-draggable')
    })

    it('al arrastrar desde el manejador mueve el intérprete', async () => {
      const { container } = await open()
      const handle = screen.getByRole('button', { name: 'Arrastrar video' })
      const draggable = container.querySelector('.react-draggable') as HTMLElement
      const before = draggable.style.transform

      fireEvent.mouseDown(handle, { clientX: 10, clientY: 10, button: 0 })
      fireEvent.mouseMove(document, { clientX: 60, clientY: 40 })
      fireEvent.mouseUp(document, { clientX: 60, clientY: 40 })

      expect(draggable.style.transform).not.toBe(before)
    })
  })

  describe('reproductor', () => {
    it('el botón de reproducir y el control de tiempo están deshabilitados sin video', async () => {
      await open({})

      expect(playButton()).toBeDisabled()
      expect(screen.getByLabelText('Tiempo transcurrido')).toBeDisabled()
    })

    it('al presionar reproducir inicia el video visible y cambia a "Pausar video"', async () => {
      await open()

      await userEvent.click(screen.getByRole('button', { name: 'Reproducir video' }))

      expect(media.play).toHaveBeenCalledTimes(1)
      expect(media.play.mock.instances[0]).toBe(accesibilityVideo())
      expect(screen.getByRole('button', { name: 'Pausar video' })).toBeInTheDocument()
    })

    it('al presionar pausar detiene el video', async () => {
      await open()
      await userEvent.click(screen.getByRole('button', { name: 'Reproducir video' }))

      await userEvent.click(screen.getByRole('button', { name: 'Pausar video' }))

      expect(media.pause).toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'Reproducir video' })).toBeInTheDocument()
    })

    it('vuelve al estado de pausa cuando el video termina', async () => {
      await open()
      await userEvent.click(screen.getByRole('button', { name: 'Reproducir video' }))

      fireEvent.ended(accesibilityVideo())

      expect(screen.getByRole('button', { name: 'Reproducir video' })).toBeInTheDocument()
    })

    it('al cambiar de video pausa y reinicia el anterior', async () => {
      await open()
      await userEvent.click(screen.getByRole('button', { name: 'Reproducir video' }))
      media.pause.mockClear()

      await userEvent.click(screen.getByRole('button', { name: 'Video de contenido' }))

      expect(media.pause.mock.instances).toContain(accesibilityVideo())
      expect(screen.getByRole('button', { name: 'Reproducir video' })).toBeInTheDocument()
    })

    it('muestra el tiempo transcurrido y la duración en el control deslizante', async () => {
      await open()
      setMediaProps(accesibilityVideo(), { duration: 90.4, currentTime: 12.2 })

      fireEvent.loadedMetadata(accesibilityVideo())
      fireEvent.timeUpdate(accesibilityVideo())

      const slider = screen.getByLabelText('Tiempo transcurrido')
      expect(slider).toHaveAttribute('max', '90')
      expect(slider).toHaveValue('12')
      expect(slider).toHaveAttribute('aria-valuetext', '00:12')
    })

    it('al mover el control deslizante cambia el tiempo del video', async () => {
      await open()
      setMediaProps(accesibilityVideo(), { duration: 100 })
      fireEvent.loadedMetadata(accesibilityVideo())

      fireEvent.change(screen.getByLabelText('Tiempo transcurrido'), { target: { value: '42' } })

      expect(accesibilityVideo().currentTime).toBe(42)
      expect(screen.getByLabelText('Tiempo transcurrido')).toHaveValue('42')
    })
  })
})
