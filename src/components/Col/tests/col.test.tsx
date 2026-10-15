import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Col } from '../index'

describe('Col', () => {
  it('renderiza un div con la clase c-col y sus hijos', () => {
    render(
      <Col data-testid="col">
        <span>contenido</span>
      </Col>
    )

    const col = screen.getByTestId('col')
    expect(col.tagName).toBe('DIV')
    expect(col).toHaveClass('c-col')
    expect(col).toHaveTextContent('contenido')
  })

  it('agrega la clase adicional addClass', () => {
    render(<Col data-testid="col" addClass="mi-columna" />)

    expect(screen.getByTestId('col')).toHaveClass('c-col', 'mi-columna')
  })

  // El CSS usa selectores de atributo (p. ej. `.c-col[sm="6"]`), por eso los
  // tamaños responsivos deben llegar al DOM como atributos.
  it('reenvía los tamaños responsivos como atributos para que los use el CSS', () => {
    render(<Col data-testid="col" xs="12" sm="6" md="4" lg="3" hd="2" />)

    const col = screen.getByTestId('col')
    expect(col).toHaveAttribute('xs', '12')
    expect(col).toHaveAttribute('sm', '6')
    expect(col).toHaveAttribute('md', '4')
    expect(col).toHaveAttribute('lg', '3')
    expect(col).toHaveAttribute('hd', '2')
  })

  it('reenvía la ref al div', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Col ref={ref} data-testid="col" />)

    expect(ref.current).toBe(screen.getByTestId('col'))
  })
})
