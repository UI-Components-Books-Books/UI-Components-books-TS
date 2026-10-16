import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Pagination } from '../index'
import { defaultAriaLabel } from '../utils/defaultAriaLabel'

describe('Pagination', () => {
  it('renderiza una navegación con lista y el aria-label recibido', () => {
    render(<Pagination count={5} onChange={() => {}} label="Paginación de resultados" />)

    const nav = screen.getByRole('navigation', { name: 'Paginación de resultados' })
    expect(nav).toHaveClass('c-pagination')
    expect(within(nav).getByRole('list')).toBeInTheDocument()
  })

  it('no agrega aria-label a la navegación si no se pasa label', () => {
    render(<Pagination count={5} onChange={() => {}} />)

    expect(screen.getByRole('navigation')).not.toHaveAttribute('aria-label')
  })

  it('agrega la clase adicional addClass', () => {
    render(<Pagination count={5} onChange={() => {}} addClass="mi-paginacion" />)

    expect(screen.getByRole('navigation')).toHaveClass('c-pagination', 'mi-paginacion')
  })

  it('renderiza un botón por página más anterior y siguiente', () => {
    render(<Pagination count={5} onChange={() => {}} />)

    expect(screen.getAllByRole('button')).toHaveLength(7)
    expect(screen.getByRole('button', { name: 'Ir a la anterior página' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir a la siguiente página' })).toBeInTheDocument()
  })

  it('marca la página actual con aria-current="page" y la clase de seleccionada', () => {
    render(<Pagination count={5} defaultPage={3} onChange={() => {}} />)

    const current = screen.getByRole('button', { name: 'página 3' })
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).toHaveClass('c-pagination-item--selected')
    expect(screen.getByRole('button', { name: 'Ir a la página 2' })).not.toHaveAttribute('aria-current')
  })

  it('deshabilita "anterior" en la primera página y "siguiente" en la última', () => {
    const { rerender } = render(<Pagination count={5} defaultPage={1} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Ir a la anterior página' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Ir a la siguiente página' })).toBeEnabled()

    rerender(<Pagination count={5} defaultPage={5} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Ir a la siguiente página' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Ir a la anterior página' })).toBeEnabled()
  })

  it('llama a onChange con la página elegida y mueve la selección', async () => {
    const onChange = vi.fn()
    render(<Pagination count={5} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Ir a la página 4' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][1]).toBe(4)
    expect(screen.getByRole('button', { name: 'página 4' })).toHaveAttribute('aria-current', 'page')
  })

  it('"siguiente" y "anterior" navegan de a una página', async () => {
    const onChange = vi.fn()
    render(<Pagination count={5} defaultPage={2} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'Ir a la siguiente página' }))
    expect(onChange.mock.lastCall?.[1]).toBe(3)

    await userEvent.click(screen.getByRole('button', { name: 'Ir a la anterior página' }))
    expect(onChange.mock.lastCall?.[1]).toBe(2)
  })

  it('muestra los botones de primera y última página solo si se piden', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<Pagination count={10} defaultPage={5} onChange={onChange} />)
    expect(screen.queryByRole('button', { name: 'Ir a la primera página' })).not.toBeInTheDocument()

    rerender(<Pagination count={10} defaultPage={5} onChange={onChange} showFirstButton showLastButton />)
    await userEvent.click(screen.getByRole('button', { name: 'Ir a la última página' }))

    expect(onChange.mock.lastCall?.[1]).toBe(10)
    expect(screen.getByRole('button', { name: 'Ir a la primera página' })).toBeInTheDocument()
  })

  it('pinta los ellipsis como texto "...", no como botones', () => {
    render(<Pagination count={10} defaultPage={5} onChange={() => {}} />)

    expect(screen.getAllByText('...')).toHaveLength(2)
    screen.getAllByText('...').forEach((ellipsis) => {
      expect(ellipsis.tagName).not.toBe('BUTTON')
    })
  })

  it('deshabilita todos los botones con disabled', () => {
    render(<Pagination count={5} disabled onChange={() => {}} />)

    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled())
  })

  it('permite personalizar los aria-label con getItemAriaLabel', () => {
    render(
      <Pagination
        count={3}
        onChange={() => {}}
        getItemAriaLabel={(type, selected, page) => `${type}-${page}-${selected}`}
      />
    )

    expect(screen.getByRole('button', { name: 'page-1-true' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'next-2-false' })).toBeInTheDocument()
  })

  it('permite reemplazar el render de cada item con renderItem', () => {
    render(
      <Pagination
        count={3}
        onChange={() => {}}
        renderItem={(item) => <span data-testid="custom">{item.type}</span>}
      />
    )

    expect(screen.getAllByTestId('custom')).toHaveLength(5)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('expone PaginationItem como submódulo', () => {
    expect(Pagination.Item).toBeTypeOf('function')
  })

  describe('Pagination.Item con un element propio', () => {
    const withElement = (element: JSX.Element, extra: Record<string, unknown> = {}) =>
      render(
        <Pagination
          count={3}
          defaultPage={2}
          onChange={() => {}}
          renderItem={(item) => <Pagination.Item {...item} element={element} {...extra} />}
        />
      )

    const current = () => screen.getAllByRole('button').find((b) => b.getAttribute('aria-current') === 'page') as HTMLElement

    it('suma la clase del element a las del item en lugar de reemplazarlas', () => {
      withElement(<button className="mi-boton" />)

      expect(current()).toHaveClass('mi-boton', 'c-pagination-item', 'c-pagination-item--selected')
    })

    it('las páginas no seleccionadas conservan la clase base y la del element, sin la de seleccionada', () => {
      withElement(<button className="mi-boton" />)

      const other = screen.getByRole('button', { name: 'Ir a la página 3' })
      expect(other).toHaveClass('mi-boton', 'c-pagination-item')
      expect(other).not.toHaveClass('c-pagination-item--selected')
    })

    it('también conserva addClass junto con la clase del element', () => {
      withElement(<button className="mi-boton" />, { addClass: 'extra' })

      expect(current()).toHaveClass('mi-boton', 'extra', 'c-pagination-item', 'c-pagination-item--selected')
    })

    it('sin className en el element sigue aplicando las clases de siempre', () => {
      withElement(<button />)

      expect(current()).toHaveClass('c-pagination-item', 'c-pagination-item--selected')
    })

    it('el botón por defecto lleva type="button"', () => {
      render(<Pagination count={3} onChange={() => {}} />)

      screen.getAllByRole('button').forEach((button) => expect(button).toHaveAttribute('type', 'button'))
    })
  })
})

describe('defaultAriaLabel', () => {
  it('describe la página actual sin el prefijo de navegación', () => {
    expect(defaultAriaLabel('page', true, 3)).toBe('página 3')
  })

  it('invita a ir a una página que no es la actual', () => {
    expect(defaultAriaLabel('page', false, 4)).toBe('Ir a la página 4')
  })

  it.each([
    ['first', 'Ir a la primera página'],
    ['last', 'Ir a la última página'],
    ['previous', 'Ir a la anterior página'],
    ['next', 'Ir a la siguiente página'],
  ] as const)('traduce el botón %s', (type, expected) => {
    expect(defaultAriaLabel(type, false, null)).toBe(expected)
  })
})
