import { useRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useIsChecked } from '../useIsChecked'

const Probe = ({ type, name, defaultChecked, label }: { type: 'checkbox' | 'radio'; name?: string; defaultChecked?: boolean; label: string }) => {
  const ref = useRef<HTMLInputElement>(null)
  const isChecked = useIsChecked(ref, Boolean(defaultChecked))
  return (
    <>
      <input ref={ref} type={type} name={name} defaultChecked={defaultChecked} aria-label={label} />
      <output data-testid={label}>{String(isChecked)}</output>
    </>
  )
}

const value = (label: string) => screen.getByTestId(label).textContent

describe('useIsChecked', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('empieza con el valor inicial y sigue al input al marcarlo y desmarcarlo', async () => {
    render(<Probe type="checkbox" label="a" defaultChecked />)
    expect(value('a')).toBe('true')

    await userEvent.click(screen.getByRole('checkbox'))
    expect(value('a')).toBe('false')

    await userEvent.click(screen.getByRole('checkbox'))
    expect(value('a')).toBe('true')
  })

  it('en un radio se entera de que lo desmarcaron al marcar otro del grupo', async () => {
    render(
      <>
        <Probe type="radio" name="g" label="uno" />
        <Probe type="radio" name="g" label="dos" />
      </>
    )

    await userEvent.click(screen.getByRole('radio', { name: 'uno' }))
    expect(value('uno')).toBe('true')

    await userEvent.click(screen.getByRole('radio', { name: 'dos' }))
    expect(value('dos')).toBe('true')
    expect(value('uno')).toBe('false')
  })

  it('un radio no se entera de los cambios de otro grupo', async () => {
    render(
      <>
        <Probe type="radio" name="a" label="uno" defaultChecked />
        <Probe type="radio" name="b" label="dos" />
      </>
    )

    await userEvent.click(screen.getByRole('radio', { name: 'dos' }))

    expect(value('dos')).toBe('true')
    expect(value('uno')).toBe('true')
  })

  it('los radios sin nombre no forman grupo: cada uno es independiente', async () => {
    render(
      <>
        <Probe type="radio" label="uno" defaultChecked />
        <Probe type="radio" label="dos" />
      </>
    )

    await userEvent.click(screen.getByRole('radio', { name: 'dos' }))

    expect(value('dos')).toBe('true')
    expect(value('uno')).toBe('true')
  })

  it('quita sus oyentes al desmontar', () => {
    const removeDocument = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(
      <form>
        <Probe type="checkbox" label="a" />
      </form>
    )
    const form = document.querySelector('form') as HTMLFormElement
    const removeForm = vi.spyOn(form, 'removeEventListener')

    unmount()

    expect(removeDocument).toHaveBeenCalledWith('change', expect.any(Function), true)
    expect(removeForm).toHaveBeenCalledWith('reset', expect.any(Function))
  })
})
