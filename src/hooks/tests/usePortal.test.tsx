import { render } from '@testing-library/react'
import { createPortal } from 'react-dom'
import { describe, expect, it } from 'vitest'

import { usePortal } from '../usePortal'

const PortalProbe = ({ id, text }: { id: string; text: string }) => {
  const target = usePortal(id)
  return createPortal(<span>{text}</span>, target)
}

describe('usePortal', () => {
  it('crea el contenedor padre en el body y monta el contenido dentro', () => {
    render(<PortalProbe id="my-portal" text="hola" />)

    const parent = document.getElementById('my-portal-parent')
    expect(parent).toBeInTheDocument()
    expect(parent?.parentElement).toBe(document.body)
    expect(document.getElementById('my-portal-wrapper')).toHaveTextContent('hola')
  })

  it('reutiliza un elemento existente con ese id en lugar de crear otro padre', () => {
    const existing = document.createElement('div')
    existing.id = 'already-here'
    document.body.append(existing)

    render(<PortalProbe id="already-here" text="dentro" />)

    expect(existing).toContainElement(document.getElementById('already-here-wrapper'))
    expect(document.getElementById('already-here-parent')).toBeNull()

    existing.remove()
  })

  it('limpia el wrapper y el padre creado al desmontar', () => {
    const { unmount } = render(<PortalProbe id="cleanup" text="x" />)
    expect(document.getElementById('cleanup-parent')).toBeInTheDocument()

    unmount()

    expect(document.getElementById('cleanup-wrapper')).toBeNull()
    expect(document.getElementById('cleanup-parent')).toBeNull()
  })

  it('devuelve siempre el mismo elemento entre renders', () => {
    const { rerender } = render(<PortalProbe id="stable" text="uno" />)
    const first = document.getElementById('stable-wrapper')

    rerender(<PortalProbe id="stable" text="dos" />)

    expect(document.getElementById('stable-wrapper')).toBe(first)
    expect(first).toHaveTextContent('dos')
  })
})
