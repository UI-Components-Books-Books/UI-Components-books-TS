import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Filter } from '../index'

/** Filtros de color que ofrece la extensión de alto contraste, cada uno con su variante "_back". */
const COLOR_FILTERS = [
  'grayscale',
  'green_on_blue',
  'highcontrast',
  'invert',
  'red_on_white',
  'white_on_black',
  'yellow_on_black',
  'yellow_on_blue',
] as const

describe('Filter', () => {
  it('renderiza el contenedor con el id esperado por la extensión de alto contraste', () => {
    const { container } = render(<Filter />)

    const wrapper = container.firstElementChild
    expect(wrapper?.tagName).toBe('SPAN')
    expect(wrapper).toHaveAttribute('id', 'hc_extension_svg_filters')
  })

  it('contiene un svg sin altura para que no ocupe espacio en pantalla', () => {
    const { container } = render(<Filter />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('height', '0')
  })

  it('define el filtro "off"', () => {
    const { container } = render(<Filter />)

    expect(container.querySelector('filter#hc_extension_off')).toBeInTheDocument()
  })

  it.each(COLOR_FILTERS)('define el filtro %s y su variante _back', (name) => {
    const { container } = render(<Filter />)

    expect(container.querySelector(`filter#hc_extension_${name}`)).toBeInTheDocument()
    expect(container.querySelector(`filter#hc_extension_${name}_back`)).toBeInTheDocument()
  })

  it('define exactamente 17 filtros (off + 8 colores × 2 variantes)', () => {
    const { container } = render(<Filter />)

    expect(container.querySelectorAll('filter')).toHaveLength(1 + COLOR_FILTERS.length * 2)
  })

  it('cada filtro transforma los tres canales de color (R, G y B)', () => {
    const { container } = render(<Filter />)

    container.querySelectorAll('filter').forEach((filter) => {
      expect(filter.querySelector('feFuncR')).toBeInTheDocument()
      expect(filter.querySelector('feFuncG')).toBeInTheDocument()
      expect(filter.querySelector('feFuncB')).toBeInTheDocument()
    })
  })

  it('reenvía props adicionales al contenedor', () => {
    const { container } = render(<Filter data-testid="filtros" aria-hidden="true" />)

    expect(container.firstElementChild).toHaveAttribute('data-testid', 'filtros')
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
