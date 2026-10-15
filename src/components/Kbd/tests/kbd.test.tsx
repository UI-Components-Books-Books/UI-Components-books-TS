import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Kbd } from '../index'

describe('Kbd', () => {
  it('renderiza un elemento <kbd> con su contenido', () => {
    render(<Kbd>Ctrl</Kbd>)

    const kbd = screen.getByText('Ctrl')
    expect(kbd.tagName).toBe('KBD')
    expect(kbd).toHaveClass('c-kbd')
  })

  it('agrega la clase adicional addClass', () => {
    render(<Kbd addClass="mi-clase">K</Kbd>)

    expect(screen.getByText('K')).toHaveClass('c-kbd', 'mi-clase')
  })

  it('permite combinar varias teclas como hijos', () => {
    render(
      <p>
        <Kbd>
          <Kbd>Ctrl</Kbd>+<Kbd>C</Kbd>
        </Kbd>
      </p>
    )

    expect(screen.getByText('Ctrl')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })
})
