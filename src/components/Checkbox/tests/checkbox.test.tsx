import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CheckBox } from '../index'

describe('CheckBox', () => {
  it('renderiza un checkbox asociado a su label', () => {
    render(<CheckBox label="Acepto los términos" />)

    const checkbox = screen.getByLabelText('Acepto los términos')
    expect(checkbox).toHaveAttribute('type', 'checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('usa un label por defecto cuando no se pasa uno', () => {
    render(<CheckBox label={undefined as unknown as string} />)

    expect(screen.getByLabelText('Default checkbox label')).toBeInTheDocument()
  })

  it('asocia label e input con el id recibido', () => {
    render(<CheckBox label="Con id" id="mi-check" />)

    expect(screen.getByLabelText('Con id')).toHaveAttribute('id', 'mi-check')
  })

  it('genera ids únicos distintos para varias instancias sin id', () => {
    render(
      <>
        <CheckBox label="Uno" />
        <CheckBox label="Dos" />
      </>
    )

    expect(screen.getByLabelText('Uno').id).not.toBe(screen.getByLabelText('Dos').id)
  })

  it('se marca y desmarca al hacer click y notifica con onChange', async () => {
    const onChange = vi.fn()
    render(<CheckBox label="Opción" onChange={onChange} />)
    const checkbox = screen.getByLabelText('Opción')

    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('también se activa al hacer click en el texto del label', async () => {
    render(<CheckBox label="Click en el texto" />)

    await userEvent.click(screen.getByText('Click en el texto'))

    expect(screen.getByLabelText('Click en el texto')).toBeChecked()
  })

  it('respeta defaultChecked y disabled', async () => {
    render(<CheckBox label="Fijo" defaultChecked disabled />)
    const checkbox = screen.getByLabelText('Fijo')

    await userEvent.click(checkbox)

    expect(checkbox).toBeChecked()
    expect(checkbox).toBeDisabled()
  })

  it('refleja el estado en data-state del contenedor, label e input', () => {
    const { container } = render(<CheckBox label="Estado" state="right" />)

    expect(container.querySelector('.c-input-check')).toHaveAttribute('data-state', 'right')
    expect(screen.getByLabelText('Estado')).toHaveAttribute('data-state', 'right')
  })

  it('usa el estado normal por defecto', () => {
    const { container } = render(<CheckBox label="Normal" />)

    expect(container.querySelector('.c-input-check')).toHaveAttribute('data-state', 'normal')
  })

  it.each(['normal', 'right', 'wrong'] as const)('dibuja un ícono para el estado %s', (state) => {
    const { container } = render(<CheckBox label="Ícono" state={state} />)

    expect(container.querySelector('.c-input-check__icon svg')).toBeInTheDocument()
  })

  it('los íconos de cada estado son distintos', () => {
    const paths = (['normal', 'right', 'wrong'] as const).map((state) => {
      const { container, unmount } = render(<CheckBox label="x" state={state} />)
      const d = container.querySelector('.c-input-check__icon path')?.getAttribute('d')
      unmount()
      return d
    })

    expect(new Set(paths).size).toBe(3)
  })

  it('agrega la clase adicional addClass', () => {
    const { container } = render(<CheckBox label="Clase" addClass="mi-clase" />)

    expect(container.querySelector('.c-input-check')).toHaveClass('mi-clase')
  })

  it('reenvía la ref al input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<CheckBox label="Ref" ref={ref} />)

    expect(ref.current).toBe(screen.getByLabelText('Ref'))
  })

  // Comportamiento actual: el label se inyecta con dangerouslySetInnerHTML, por lo que
  // el HTML se interpreta y NO se sanitiza. Si algún día se cambia, actualizar este test.
  it('interpreta HTML dentro del label (comportamiento actual, sin sanitizar)', () => {
    const { container } = render(<CheckBox label="Acepto <strong>todo</strong>" />)

    expect(container.querySelector('label strong')).toHaveTextContent('todo')
  })
})
