import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * axe no mide el contraste de lo que no es texto (WCAG 1.4.11) y jsdom no calcula estilos, así que
 * estos tests leen los colores declarados en video.css y comprueban los pares que importan.
 * (El CSS se lee con `fs` porque la configuración de vitest desactiva el procesamiento de .css.)
 */
const css = readFileSync(resolve(import.meta.dirname, '../src/video.css'), 'utf8')

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

const token = (name: string) => {
  const match = new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\b`).exec(css)
  if (!match) throw new Error(`No se encontró ${name} con un color #rrggbb en video.css`)
  return match[1]
}

describe('contraste del slider de progreso (WCAG 1.4.11, mínimo 3:1)', () => {
  const fill = token('--video-slider-bg')
  const track = token('--video-slider-track-bg')
  const toolbar = token('--video-bg')

  it('el relleno se distingue de la pista: así se ve cuánto se ha reproducido', () => {
    expect(contrast(fill, track)).toBeGreaterThanOrEqual(3)
  })

  it('la pista se distingue de la barra que tiene debajo', () => {
    expect(contrast(track, toolbar)).toBeGreaterThanOrEqual(3)
  })

  it('el relleno se distingue de la barra que tiene debajo', () => {
    expect(contrast(fill, toolbar)).toBeGreaterThanOrEqual(3)
  })

  it('la pista del slider usa su propio color y no el gris del interruptor', () => {
    const rule = /\.video-player__slider-track\s*\{[^}]*\}/.exec(css)?.[0]

    expect(rule).toContain('background-color: var(--video-slider-track-bg)')
    // `--video-track-bg` sigue siendo el color del interruptor del audio descriptivo.
    expect(css).toMatch(/--switch-bg:\s*var\(--video-track-bg\)/)
  })

  it('la bolita que marca la posición aparece también con el foco del teclado, no solo con el ratón', () => {
    expect(css).toMatch(/\.video-player__slider:focus-visible\s+\.video-player__slider-thumb[^{]*\{[^}]*opacity:\s*1/)
  })
})
