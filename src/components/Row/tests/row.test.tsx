import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Row } from '../index'

describe('Row', () => {
  it('renderiza un div con la clase c-row y sus hijos', () => {
    render(
      <Row data-testid="row">
        <span>hijo</span>
      </Row>
    )

    const row = screen.getByTestId('row')
    expect(row.tagName).toBe('DIV')
    expect(row).toHaveClass('c-row')
    expect(row).toHaveTextContent('hijo')
  })

  it('no agrega clases de modificador si no se pasan props de layout', () => {
    render(<Row data-testid="row" />)

    expect(screen.getByTestId('row').className).toBe('c-row')
  })

  it('traduce justifyContent, alignItems y flexDirection a clases', () => {
    render(
      <Row
        data-testid="row"
        justifyContent="space-between"
        alignItems="center"
        flexDirection="column"
      />
    )

    expect(screen.getByTestId('row')).toHaveClass(
      'c-row--justify-content-space-between',
      'c-row--align-items-center',
      'c-row--flex-direction-column'
    )
  })

  it('agrega la clase adicional addClass', () => {
    render(<Row data-testid="row" addClass="mi-fila" />)

    expect(screen.getByTestId('row')).toHaveClass('c-row', 'mi-fila')
  })

  it('no filtra las props de layout al DOM', () => {
    render(<Row data-testid="row" justifyContent="center" alignItems="center" flexDirection="row" />)

    const row = screen.getByTestId('row')
    expect(row).not.toHaveAttribute('justifyContent')
    expect(row).not.toHaveAttribute('alignItems')
    expect(row).not.toHaveAttribute('flexDirection')
  })

  it('reenvía la ref al div', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Row ref={ref} data-testid="row" />)

    expect(ref.current).toBe(screen.getByTestId('row'))
  })
})
