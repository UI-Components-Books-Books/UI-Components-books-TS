import { useRef } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useInteractOutside } from '../useInteractOutside'

type Handlers = {
  onInteractionOutside?: (e: MouseEvent) => void
  onInteractionOutsideStart?: (e: MouseEvent) => void
}

const Probe = (handlers: Handlers) => {
  const ref = useRef<HTMLDivElement>(null)
  useInteractOutside({ ref, ...handlers })
  return (
    <div>
      <div ref={ref} data-testid="inside">
        <button>dentro</button>
      </div>
      <button data-testid="outside">fuera</button>
    </div>
  )
}

const click = (element: Element) => {
  fireEvent.mouseDown(element)
  fireEvent.mouseUp(element)
}

describe('useInteractOutside', () => {
  it('llama a onInteractionOutside al hacer click fuera del elemento', () => {
    const onInteractionOutside = vi.fn()
    const { getByTestId } = render(<Probe onInteractionOutside={onInteractionOutside} />)

    click(getByTestId('outside'))

    expect(onInteractionOutside).toHaveBeenCalledTimes(1)
  })

  it('no la llama al hacer click dentro del elemento ni en sus hijos', () => {
    const onInteractionOutside = vi.fn()
    const { getByTestId, getByText } = render(<Probe onInteractionOutside={onInteractionOutside} />)

    click(getByTestId('inside'))
    click(getByText('dentro'))

    expect(onInteractionOutside).not.toHaveBeenCalled()
  })

  it('llama a onInteractionOutsideStart en mousedown, antes del mouseup', () => {
    const onInteractionOutside = vi.fn()
    const onInteractionOutsideStart = vi.fn()
    const { getByTestId } = render(
      <Probe
        onInteractionOutside={onInteractionOutside}
        onInteractionOutsideStart={onInteractionOutsideStart}
      />
    )

    fireEvent.mouseDown(getByTestId('outside'))
    expect(onInteractionOutsideStart).toHaveBeenCalledTimes(1)
    expect(onInteractionOutside).not.toHaveBeenCalled()

    fireEvent.mouseUp(getByTestId('outside'))
    expect(onInteractionOutside).toHaveBeenCalledTimes(1)
  })

  it('ignora un mouseup suelto que no empezó con un mousedown fuera', () => {
    const onInteractionOutside = vi.fn()
    const { getByTestId } = render(<Probe onInteractionOutside={onInteractionOutside} />)

    fireEvent.mouseUp(getByTestId('outside'))

    expect(onInteractionOutside).not.toHaveBeenCalled()
  })

  it('no hace nada sin onInteractionOutside', () => {
    const onInteractionOutsideStart = vi.fn()
    const { getByTestId } = render(<Probe onInteractionOutsideStart={onInteractionOutsideStart} />)

    click(getByTestId('outside'))

    expect(onInteractionOutsideStart).not.toHaveBeenCalled()
  })

  it('usa el callback más reciente cuando onInteractionOutside cambia entre renders', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { getByTestId, rerender } = render(<Probe onInteractionOutside={first} />)

    rerender(<Probe onInteractionOutside={second} />)
    click(getByTestId('outside'))

    expect(second).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
  })

  it('usa el callback más reciente de onInteractionOutsideStart', () => {
    const onInteractionOutside = vi.fn()
    const firstStart = vi.fn()
    const secondStart = vi.fn()
    const { getByTestId, rerender } = render(
      <Probe onInteractionOutside={onInteractionOutside} onInteractionOutsideStart={firstStart} />
    )

    rerender(<Probe onInteractionOutside={onInteractionOutside} onInteractionOutsideStart={secondStart} />)
    click(getByTestId('outside'))

    expect(secondStart).toHaveBeenCalledTimes(1)
    expect(firstStart).not.toHaveBeenCalled()
  })

  it('deja de reaccionar si el callback se quita en un render posterior', () => {
    const onInteractionOutside = vi.fn()
    const { getByTestId, rerender } = render(<Probe onInteractionOutside={onInteractionOutside} />)

    rerender(<Probe />)
    click(getByTestId('outside'))

    expect(onInteractionOutside).not.toHaveBeenCalled()
  })

  it('deja de escuchar al desmontar', () => {
    const onInteractionOutside = vi.fn()
    const { getByTestId, unmount } = render(<Probe onInteractionOutside={onInteractionOutside} />)
    const outside = getByTestId('outside')

    unmount()
    click(outside)

    expect(onInteractionOutside).not.toHaveBeenCalled()
  })
})
