import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { mockMatchMedia } from '../../../test/matchMedia'
import { mockMediaPlayback, setMediaProps } from '../../../test/media'
import { Audio } from '../index'
import type { AudioProps } from '../types/types'

const audioEl = () => document.querySelector('audio') as HTMLAudioElement
const SRC = '/sonido.mp3'

const bar = (props: Partial<AudioProps> = {}) => render(<Audio src={SRC} {...props} />)
const button = (props: Partial<AudioProps> = {}) => render(<Audio src={SRC} type="button" {...props} />)

/** Simula que el navegador terminó de cargar los metadatos del audio. */
const loadMetadata = (duration: number, volume = 1) => {
  setMediaProps(audioEl(), { duration })
  audioEl().volume = volume
  fireEvent.loadedMetadata(audioEl())
}

const timeText = () => screen.getByText(/\d\d:\d\d \/ \d\d:\d\d/).textContent

describe('Audio', () => {
  describe('tipo "bar" (por defecto)', () => {
    it('renderiza un grupo etiquetado con una barra de reproducción', () => {
      mockMediaPlayback()
      bar()

      expect(screen.getByRole('group', { name: 'Barra de audio' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Controlar volumen' })).toBeInTheDocument()
    })

    it('usa la descripción recibida como nombre del grupo', () => {
      bar({ description: 'Entrevista a la autora' })

      expect(screen.getByRole('group', { name: 'Entrevista a la autora' })).toBeInTheDocument()
    })

    it('con a11y el grupo se llama "Audio description" y muestra el ícono de accesibilidad', () => {
      const { container } = bar({ a11y: true, description: 'ignorada' })

      expect(screen.getByRole('group', { name: 'Audio description' })).toBeInTheDocument()
      expect(container.querySelector('.c-audio__bar')).toHaveAttribute('data-a11y', 'true')
      expect(container.querySelector('.c-audio__bar > .c-icon')).toBeInTheDocument()
    })

    it('incluye el elemento <audio> oculto con la fuente indicada y preload de metadatos', () => {
      bar()

      expect(audioEl()).toHaveAttribute('hidden')
      expect(audioEl()).toHaveAttribute('preload', 'metadata')
      expect(audioEl().querySelector('source')).toHaveAttribute('src', SRC)
    })

    it('usa el id recibido para el audio y para sus controles', () => {
      bar({ id: 'mi-audio' })

      expect(audioEl()).toHaveAttribute('id', 'mi-audio')
      expect(document.getElementById('timemi-audio')).toBeInTheDocument()
    })

    it('agrega addClass a la barra y al audio', () => {
      const { container } = bar({ addClass: 'mi-clase', size: 'small' })

      expect(container.querySelector('.c-audio__bar')).toHaveClass('c-audio__bar--small', 'mi-clase')
      expect(audioEl()).toHaveClass('c-audio', 'mi-clase')
    })

    describe('reproducción', () => {
      it('al presionar play reproduce el audio y cambia el botón a "Pausar"', async () => {
        const media = mockMediaPlayback()
        bar()

        await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }))

        expect(media.play).toHaveBeenCalledTimes(1)
        expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()
      })

      it('al presionar de nuevo pausa el audio', async () => {
        const media = mockMediaPlayback()
        bar()
        await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }))

        await userEvent.click(screen.getByRole('button', { name: 'Pausar' }))

        expect(media.pause).toHaveBeenCalled()
        expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument()
      })

      it('pausa los demás audios de la página antes de reproducir', async () => {
        const media = mockMediaPlayback()
        const other = document.createElement('audio')
        document.body.appendChild(other)
        media.setPlaying(other)
        bar()

        await userEvent.click(screen.getByRole('button', { name: 'Reproducir' }))

        expect(media.pause).toHaveBeenCalledTimes(1)
        expect(media.pause.mock.instances[0]).toBe(other)
        other.remove()
      })

      it('sigue los eventos play y pause del propio elemento (p. ej. controles del navegador)', () => {
        mockMediaPlayback()
        bar()

        fireEvent.play(audioEl())
        expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()

        fireEvent.pause(audioEl())
        expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument()
      })
    })

    describe('tiempo', () => {
      it('empieza en 00:00 / 00:00', () => {
        bar()

        expect(timeText()).toBe('00:00 / 00:00')
      })

      it('muestra la duración al cargar los metadatos', () => {
        bar()

        loadMetadata(125)

        expect(timeText()).toBe('00:00 / 02:05')
      })

      it('actualiza el tiempo transcurrido con timeupdate', () => {
        bar()
        loadMetadata(125)

        setMediaProps(audioEl(), { currentTime: 65.4 })
        fireEvent.timeUpdate(audioEl())

        expect(timeText()).toBe('01:05 / 02:05')
        expect(screen.getByLabelText('Tiempo transcurrido')).toHaveValue('65')
      })

      it('el control deslizante de tiempo tiene como máximo la duración', () => {
        bar()
        loadMetadata(90)

        expect(screen.getByLabelText('Tiempo transcurrido')).toHaveAttribute('max', '90')
      })

      it('al mover el control deslizante cambia el tiempo de reproducción', () => {
        bar()
        loadMetadata(100)

        fireEvent.change(screen.getByLabelText('Tiempo transcurrido'), { target: { value: '42' } })

        expect(audioEl().currentTime).toBe(42)
        expect(timeText()).toBe('00:42 / 01:40')
      })
    })

    describe('volumen', () => {
      it('el control de volumen está cerrado al inicio', () => {
        bar()

        expect(screen.getByRole('button', { name: 'Controlar volumen' })).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByLabelText('Volumen')).not.toBeInTheDocument()
      })

      it('se abre y se cierra con el botón de volumen', async () => {
        bar()
        const volumeButton = screen.getByRole('button', { name: 'Controlar volumen' })

        await userEvent.click(volumeButton)
        expect(volumeButton).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByLabelText('Volumen')).toBeInTheDocument()

        await userEvent.click(volumeButton)
        expect(volumeButton).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByLabelText('Volumen')).not.toBeInTheDocument()
      })

      it('se cierra al hacer click fuera del control', async () => {
        render(
          <>
            <button>Fuera</button>
            <Audio src={SRC} />
          </>
        )
        await userEvent.click(screen.getByRole('button', { name: 'Controlar volumen' }))
        expect(screen.getByLabelText('Volumen')).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Fuera' }))

        expect(screen.queryByLabelText('Volumen')).not.toBeInTheDocument()
      })

      it('toma el volumen del audio al cargar los metadatos (dispositivo con puntero)', async () => {
        mockMatchMedia({ '(any-hover: none) and (any-pointer: coarse)': false })
        bar()
        loadMetadata(60, 0.5)

        await userEvent.click(screen.getByRole('button', { name: 'Controlar volumen' }))

        expect(screen.getByLabelText('Volumen')).toHaveValue('0.5')
        expect(screen.getByLabelText('Volumen')).toHaveAttribute('aria-valuetext', '50%')
      })

      it('en pantallas táctiles el volumen arranca al máximo', async () => {
        mockMatchMedia({ '(any-hover: none) and (any-pointer: coarse)': true })
        bar()
        loadMetadata(60, 0.5)

        await userEvent.click(screen.getByRole('button', { name: 'Controlar volumen' }))

        expect(screen.getByLabelText('Volumen')).toHaveValue('1')
      })

      it('al mover el control deslizante cambia el volumen del audio', async () => {
        bar()
        loadMetadata(60, 1)
        await userEvent.click(screen.getByRole('button', { name: 'Controlar volumen' }))

        fireEvent.change(screen.getByLabelText('Volumen'), { target: { value: '0.3' } })

        expect(audioEl().volume).toBeCloseTo(0.3)
        expect(screen.getByLabelText('Volumen')).toHaveValue('0.3')
      })

      it('el ícono del botón cambia según el nivel de volumen', async () => {
        bar()
        loadMetadata(60, 1)
        const iconPath = () =>
          screen.getByRole('button', { name: 'Controlar volumen' }).querySelector('path')?.getAttribute('d')
        const alto = iconPath()

        await userEvent.click(screen.getByRole('button', { name: 'Controlar volumen' }))
        fireEvent.change(screen.getByLabelText('Volumen'), { target: { value: '0.2' } })
        const bajo = iconPath()
        fireEvent.change(screen.getByLabelText('Volumen'), { target: { value: '0' } })
        const mudo = iconPath()

        expect(new Set([alto, bajo, mudo]).size).toBe(3)
      })

      it('sincroniza el volumen cuando el audio lo cambia por su cuenta (volumechange)', async () => {
        bar()
        loadMetadata(60, 1)
        await userEvent.click(screen.getByRole('button', { name: 'Controlar volumen' }))

        audioEl().volume = 0.7
        fireEvent.volumeChange(audioEl())

        expect(screen.getByLabelText('Volumen')).toHaveValue('0.7')
      })
    })
  })

  describe('tipo "button"', () => {
    it('renderiza un único botón y un audio oculto con la fuente', () => {
      button()

      expect(screen.getAllByRole('button')).toHaveLength(1)
      expect(audioEl()).toHaveAttribute('src', SRC)
      expect(audioEl()).toHaveClass('c-audio--hidden')
    })

    it('usa el id recibido en el audio', () => {
      button({ id: 'mi-audio' })

      expect(audioEl()).toHaveAttribute('id', 'mi-audio')
    })

    it('aplica la clase de tamaño y addClass al botón', () => {
      button({ size: 'small', addClass: 'mi-clase' })

      expect(screen.getByRole('button')).toHaveClass('c-audio__button', 'c-audio__button--small', 'mi-clase')
    })

    it('empieza en pausa y alterna el estado al presionar', async () => {
      const media = mockMediaPlayback()
      button()
      const btn = screen.getByRole('button')
      expect(btn).toHaveClass('is-button-paused')
      expect(btn).not.toHaveClass('is-button-playing')

      await userEvent.click(btn)
      expect(media.play).toHaveBeenCalledTimes(1)
      expect(btn).toHaveClass('is-button-playing')
      expect(btn).toHaveAttribute('aria-label', 'Pausar')

      await userEvent.click(btn)
      expect(media.pause).toHaveBeenCalled()
      expect(btn).toHaveClass('is-button-paused')
    })

    it('vuelve a pausa cuando el audio termina', () => {
      mockMediaPlayback()
      button()
      fireEvent.play(audioEl())
      expect(screen.getByRole('button')).toHaveClass('is-button-playing')

      fireEvent.ended(audioEl())

      expect(screen.getByRole('button')).toHaveClass('is-button-paused')
    })

    it('pausa los demás audios de la página antes de reproducir', async () => {
      const media = mockMediaPlayback()
      const other = document.createElement('audio')
      document.body.appendChild(other)
      media.setPlaying(other)
      button()

      await userEvent.click(screen.getByRole('button'))

      expect(media.pause.mock.instances[0]).toBe(other)
      other.remove()
    })

    it('con a11y el botón queda deshabilitado y lo indica con data-a11y', () => {
      button({ a11y: true })

      expect(screen.getByRole('button')).toBeDisabled()
      expect(screen.getByRole('button')).toHaveAttribute('data-a11y', 'true')
    })

    // BUG CONOCIDO: la etiqueta del botón en pausa está mal escrita: 'Reproduccir' (con la "c"
    // de más). Es lo que anuncia el lector de pantalla. Cuando se corrija este test fallará:
    // quitar `.fails`.
    it.fails('la etiqueta del botón en pausa se llama "Reproducir"', () => {
      button()

      expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument()
    })
  })
})
