import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../index'

describe('Button', () => {
  it('renderiza un button con el label como texto', () => {
    render(<Button label="Guardar" />)

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('aplica las clases por defecto: variante primary y tamaño normal', () => {
    render(<Button label="Ok" />)

    expect(screen.getByRole('button')).toHaveClass('c-button', 'c-button--primary', 'c-button--normal')
  })

  it.each(['primary', 'secondary', 'no-line'] as const)('aplica la variante %s', (variant) => {
    render(<Button label="Ok" variant={variant} />)

    expect(screen.getByRole('button')).toHaveClass(`c-button--${variant}`)
  })

  it.each(['small', 'normal', 'big'] as const)('aplica el tamaño %s', (size) => {
    render(<Button label="Ok" size={size} />)

    expect(screen.getByRole('button')).toHaveClass(`c-button--${size}`)
  })

  it('agrega la clase adicional addClass', () => {
    render(<Button label="Ok" addClass="mi-clase" />)

    expect(screen.getByRole('button')).toHaveClass('c-button', 'mi-clase')
  })

  it('con hasAriaLabel usa el label como aria-label y no lo muestra como texto', () => {
    render(
      <Button label="Cerrar" hasAriaLabel>
        <span data-testid="icon" />
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Cerrar' })
    expect(button).toHaveAttribute('aria-label', 'Cerrar')
    expect(button).not.toHaveTextContent('Cerrar')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('sin hasAriaLabel no agrega aria-label', () => {
    render(<Button label="Ok" />)

    expect(screen.getByRole('button')).not.toHaveAttribute('aria-label')
  })

  it('renderiza los children antes del label', () => {
    render(
      <Button label="Texto">
        <span>icono</span>
      </Button>
    )

    expect(screen.getByRole('button')).toHaveTextContent('iconoTexto')
  })

  it('llama a onClick al hacer click', async () => {
    const onClick = vi.fn()
    render(<Button label="Ok" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('no llama a onClick cuando está disabled', async () => {
    const onClick = vi.fn()
    render(<Button label="Ok" onClick={onClick} disabled />)

    await userEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('button')).toBeDisabled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('reenvía la ref al elemento button y el resto de atributos HTML', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button label="Ok" ref={ref} type="submit" data-testid="btn" />)

    expect(ref.current).toBe(screen.getByTestId('btn'))
    expect(ref.current).toHaveAttribute('type', 'submit')
  })

  describe('atributo type', () => {
    it('es type="button" por defecto', () => {
      render(<Button label="Ok" />)

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it.each(['submit', 'reset'] as const)('se puede sobrescribir con type="%s"', (type) => {
      render(<Button label="Ok" type={type} />)

      expect(screen.getByRole('button')).toHaveAttribute('type', type)
    })

    it('por defecto NO envía el formulario que lo contiene', async () => {
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
      render(
        <form onSubmit={onSubmit}>
          <Button label="Cancelar" />
        </form>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('con type="submit" sí envía el formulario', async () => {
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
      render(
        <form onSubmit={onSubmit}>
          <Button label="Guardar" type="submit" />
        </form>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('el onClick sigue funcionando dentro de un formulario', async () => {
      const onClick = vi.fn()
      render(
        <form onSubmit={(event) => event.preventDefault()}>
          <Button label="Acción" onClick={onClick} />
        </form>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Acción' }))

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })
})
