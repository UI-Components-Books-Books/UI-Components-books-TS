import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Switch } from '../index'

describe('Switch', () => {
  it('renderiza un input con role="switch" accesible por su label', () => {
    render(<Switch label="Modo oscuro" />)

    const toggle = screen.getByRole('switch', { name: 'Modo oscuro' })
    expect(toggle).toHaveAttribute('type', 'checkbox')
    expect(toggle).not.toBeChecked()
  })

  it('usa un label por defecto cuando no se pasa uno', () => {
    render(<Switch label={undefined as unknown as string} />)

    expect(screen.getByRole('switch', { name: 'Default switch label' })).toBeInTheDocument()
  })

  it('aplica el tamaño normal por defecto y permite small y big', () => {
    const { container, rerender } = render(<Switch label="S" />)
    expect(container.querySelector('.c-switch')).toHaveClass('c-switch--normal')

    rerender(<Switch label="S" size="small" />)
    expect(container.querySelector('.c-switch')).toHaveClass('c-switch--small')

    rerender(<Switch label="S" size="big" />)
    expect(container.querySelector('.c-switch')).toHaveClass('c-switch--big')
  })

  it('alterna su estado al hacer click y notifica con onChange', async () => {
    const onChange = vi.fn()
    render(<Switch label="Alternar" onChange={onChange} />)
    const toggle = screen.getByRole('switch')

    await userEvent.click(toggle)
    expect(toggle).toBeChecked()

    await userEvent.click(toggle)
    expect(toggle).not.toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('se puede activar con la barra espaciadora', async () => {
    render(<Switch label="Teclado" />)

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('respeta defaultChecked y disabled', async () => {
    render(<Switch label="Fijo" defaultChecked disabled />)
    const toggle = screen.getByRole('switch')

    await userEvent.click(toggle)

    expect(toggle).toBeChecked()
    expect(toggle).toBeDisabled()
  })

  it('oculta visualmente el label por defecto (solo lectores de pantalla)', () => {
    render(<Switch label="Oculto" />)

    expect(screen.getByText('Oculto')).toHaveClass('u-sr-only')
  })

  it('muestra el label cuando isLabelVisible es true', () => {
    render(<Switch label="Visible" isLabelVisible />)

    expect(screen.getByText('Visible')).not.toHaveClass('u-sr-only')
  })

  it('no deja la clase literal "false" cuando el label es visible', () => {
    render(<Switch label="Visible" isLabelVisible />)

    expect(screen.getByText('Visible')).not.toHaveClass('false')
    expect(screen.getByText('Visible')).not.toHaveAttribute('class')
  })

  it('asocia label e input con el id recibido', () => {
    render(<Switch label="Con id" id="mi-switch" />)

    expect(screen.getByRole('switch')).toHaveAttribute('id', 'mi-switch')
  })

  it('agrega la clase adicional addClass', () => {
    const { container } = render(<Switch label="Clase" addClass="mi-clase" />)

    expect(container.querySelector('.c-switch')).toHaveClass('mi-clase')
  })

  it('reenvía la ref al input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Switch label="Ref" ref={ref} />)

    expect(ref.current).toBe(screen.getByRole('switch'))
  })
})
