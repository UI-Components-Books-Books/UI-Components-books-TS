import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useOnScreen } from '../useOnScreen'

type ObserverCallback = (entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting'>>) => void

let instances: FakeObserver[] = []

class FakeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(
    public callback: ObserverCallback,
    public options: IntersectionObserverInit
  ) {
    instances.push(this)
  }
}

const Probe = ({ options }: { options?: IntersectionObserverInit | null }) => {
  const [setRef, isVisible] = useOnScreen(options)
  return (
    <div ref={setRef} data-testid="target">
      {String(isVisible)}
    </div>
  )
}

describe('useOnScreen', () => {
  beforeEach(() => {
    instances = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('empieza como no visible y observa el elemento', () => {
    const { getByTestId } = render(<Probe />)

    expect(getByTestId('target')).toHaveTextContent('false')
    expect(instances).toHaveLength(1)
    expect(instances[0].observe).toHaveBeenCalledWith(getByTestId('target'))
  })

  it('usa las opciones por defecto cuando no se pasan', () => {
    render(<Probe />)

    expect(instances[0].options).toEqual({ root: null, rootMargin: '0px', threshold: 0 })
  })

  it('pasa las opciones personalizadas al IntersectionObserver', () => {
    render(<Probe options={{ rootMargin: '20px 10px', threshold: 0.5 }} />)

    expect(instances[0].options).toMatchObject({ rootMargin: '20px 10px', threshold: 0.5 })
  })

  it('refleja los cambios de visibilidad que reporta el observer', () => {
    const { getByTestId } = render(<Probe />)

    act(() => instances[0].callback([{ isIntersecting: true }]))
    expect(getByTestId('target')).toHaveTextContent('true')

    act(() => instances[0].callback([{ isIntersecting: false }]))
    expect(getByTestId('target')).toHaveTextContent('false')
  })

  it('deja de observar el elemento al desmontar', () => {
    const { getByTestId, unmount } = render(<Probe />)
    const target = getByTestId('target')

    unmount()

    expect(instances[0].unobserve).toHaveBeenCalledWith(target)
  })
})
