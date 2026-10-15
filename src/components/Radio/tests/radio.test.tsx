import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Radio } from '../index'

describe('Radio', () => {
  it('renderiza un radio asociado a su label', () => {
    render(<Radio label="Opción A" name="grupo" />)

    const radio = screen.getByLabelText('Opción A')
    expect(radio).toHaveAttribute('type', 'radio')
    expect(radio).not.toBeChecked()
  })

  it('usa un label por defecto cuando no se pasa uno', () => {
    render(<Radio label={undefined as unknown as string} name="grupo" />)

    expect(screen.getByLabelText('Default radio label')).toBeInTheDocument()
  })

  it('asocia label e input con el id recibido y genera ids únicos si no hay', () => {
    render(
      <>
        <Radio label="Con id" id="mi-radio" name="g" />
        <Radio label="Sin id 1" name="g" />
        <Radio label="Sin id 2" name="g" />
      </>
    )

    expect(screen.getByLabelText('Con id')).toHaveAttribute('id', 'mi-radio')
    expect(screen.getByLabelText('Sin id 1').id).not.toBe(screen.getByLabelText('Sin id 2').id)
  })

  it('al elegir una opción del grupo se desmarca la anterior', async () => {
    render(
      <>
        <Radio label="Uno" name="grupo" value="1" />
        <Radio label="Dos" name="grupo" value="2" />
      </>
    )

    await userEvent.click(screen.getByLabelText('Uno'))
    expect(screen.getByLabelText('Uno')).toBeChecked()

    await userEvent.click(screen.getByLabelText('Dos'))
    expect(screen.getByLabelText('Dos')).toBeChecked()
    expect(screen.getByLabelText('Uno')).not.toBeChecked()
  })

  it('notifica con onChange al seleccionarse', async () => {
    const onChange = vi.fn()
    render(<Radio label="Opción" name="g" onChange={onChange} />)

    await userEvent.click(screen.getByLabelText('Opción'))

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('no se puede seleccionar cuando está disabled', async () => {
    render(<Radio label="Bloqueado" name="g" disabled />)

    await userEvent.click(screen.getByLabelText('Bloqueado'))

    expect(screen.getByLabelText('Bloqueado')).not.toBeChecked()
  })

  it('sin state no dibuja ícono ni data-state', () => {
    const { container } = render(<Radio label="Sin estado" name="g" />)

    expect(container.querySelector('.c-input-radio__icon svg')).not.toBeInTheDocument()
    expect(container.querySelector('.c-input-radio')).not.toHaveAttribute('data-state')
  })

  it.each(['right', 'wrong'] as const)('con state=%s dibuja un ícono y lo refleja en data-state', (state) => {
    const { container } = render(<Radio label="Con estado" name="g" state={state} />)

    expect(container.querySelector('.c-input-radio__icon svg')).toBeInTheDocument()
    expect(container.querySelector('.c-input-radio')).toHaveAttribute('data-state', state)
    expect(screen.getByLabelText('Con estado')).toHaveAttribute('data-state', state)
  })

  it('agrega la clase adicional addClass', () => {
    const { container } = render(<Radio label="Clase" name="g" addClass="mi-clase" />)

    expect(container.querySelector('.c-input-radio')).toHaveClass('mi-clase')
  })

  it('reenvía la ref al input', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Radio label="Ref" name="g" ref={ref} />)

    expect(ref.current).toBe(screen.getByLabelText('Ref'))
  })

  // Comportamiento actual: el label se inyecta con dangerouslySetInnerHTML (sin sanitizar).
  it('interpreta HTML dentro del label (comportamiento actual, sin sanitizar)', () => {
    const { container } = render(<Radio label="Elijo <em>esta</em>" name="g" />)

    expect(container.querySelector('label em')).toHaveTextContent('esta')
  })
})
