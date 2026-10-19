import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * axe no mide el contraste de lo que no es texto (WCAG 1.4.11) y jsdom no calcula estilos, así que
 * estos tests leen los colores por defecto de text-field.css (y la paleta de grises de la
 * librería) y comprueban los pares que importan.
 * (Los CSS se leen con `fs` porque la configuración de vitest desactiva el procesamiento de .css.)
 */
const css = readFileSync(resolve(import.meta.dirname, '../src/text-field.css'), 'utf8')
const palette = readFileSync(resolve(import.meta.dirname, '../../../styles/utilities/color.css'), 'utf8')

type Rgb = [number, number, number]

const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
  }
  return [channel(0), channel(8), channel(4)]
}

const declaration = (source: string, name: string) => {
  const match = new RegExp(`${name}:\\s*([^;]+);`).exec(source)
  if (!match) throw new Error(`No se encontró ${name}`)
  return match[1].trim()
}

/** Resuelve un valor de color: `#rgb`, `#rrggbb`, `hsl(...)` o `var(--token)` (en el CSS o en la paleta). */
const toRgb = (value: string): Rgb => {
  const variable = /^var\((--[\w-]+)\)$/.exec(value)
  if (variable) {
    const name = variable[1]
    return toRgb(declaration(css.includes(`${name}:`) ? css : palette, name))
  }

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join('') : hex[1]
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as Rgb
  }

  const hsl = /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/.exec(value)
  if (hsl) return hslToRgb(Number(hsl[1]), Number(hsl[2]) / 100, Number(hsl[3]) / 100)

  throw new Error(`Color no reconocido: ${value}`)
}

const luminance = ([r, g, b]: Rgb) => {
  const [lr, lg, lb] = [r, g, b]
    .map((value) => value / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

const contrast = (a: Rgb, b: Rgb) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

const token = (name: string) => toRgb(declaration(css, `--text-field-${name}`))

describe('contraste de los colores por defecto del TextField', () => {
  const background = token('bg')

  it('el texto se distingue del fondo (WCAG 1.4.3, 4.5:1)', () => {
    expect(contrast(token('color'), background)).toBeGreaterThanOrEqual(4.5)
  })

  it('el marcador de posición se distingue del fondo (4.5:1)', () => {
    expect(contrast(token('placeholder'), background)).toBeGreaterThanOrEqual(4.5)
  })

  it('el texto de ayuda se distingue del fondo (4.5:1, se asume que la página tiene el mismo fondo)', () => {
    expect(contrast(token('hint-color'), background)).toBeGreaterThanOrEqual(4.5)
  })

  it('el borde del campo se distingue del fondo (WCAG 1.4.11, 3:1)', () => {
    expect(contrast(token('border'), background)).toBeGreaterThanOrEqual(3)
  })

  it('el borde y el icono del resultado correcto se distinguen del fondo (3:1)', () => {
    expect(contrast(token('right'), background)).toBeGreaterThanOrEqual(3)
  })

  it('el texto del error, que usa el color de incorrecto, se distingue del fondo (4.5:1)', () => {
    expect(contrast(token('wrong'), background)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('el resultado no depende solo del color (WCAG 1.4.1)', () => {
  it('el resultado incorrecto cambia el estilo del borde', () => {
    expect(css).toMatch(/\[data-state="wrong"\]\s+\.c-text-field__input\s*\{[^}]*border-style:\s*dashed/)
  })

  it('el resultado correcto y el incorrecto muestran un icono', () => {
    expect(css).toMatch(/\[data-state="right"\]\s+\.c-text-field__icon/)
    expect(css).toMatch(/\[data-state="wrong"\]\s+\.c-text-field__icon/)
  })
})
