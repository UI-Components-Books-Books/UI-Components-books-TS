import { StrictMode, useEffect, useLayoutEffect } from 'react'

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

  describe('el contenido se monta con su contenedor ya dentro del documento', () => {
    // Un elemento fuera del documento no puede recibir el foco, así que el contenido necesita que
    // su contenedor ya esté en el documento cuando se monta.
    const Content = ({ seen }: { seen: Record<string, boolean> }) => (
      <input
        aria-label="Campo"
        ref={(node) => {
          if (node) seen.enRef = document.contains(node)
        }}
      />
    )
    const Probe = ({ seen }: { seen: Record<string, boolean> }) => {
      const target = usePortal('conectado')
      return createPortal(<Content seen={seen} />, target)
    }

    it('antes de que se ejecuten los efectos de layout de los hijos', () => {
      const seen: Record<string, boolean> = {}
      const Child = () => {
        useLayoutEffect(() => {
          seen.enLayoutEffect = document.contains(document.getElementById('conectado-wrapper'))
        }, [])
        useEffect(() => {
          seen.enEffect = document.contains(document.getElementById('conectado-wrapper'))
        }, [])
        return null
      }
      const Page = () => {
        const target = usePortal('conectado')
        return createPortal(<Child />, target)
      }

      render(<Page />)

      expect(seen).toEqual({ enLayoutEffect: true, enEffect: true })
    })

    it('cuando se asigna la ref de sus hijos', () => {
      const seen: Record<string, boolean> = {}

      render(<Probe seen={seen} />)

      expect(seen.enRef).toBe(true)
    })

    it('con StrictMode deja un único contenedor y lo limpia al desmontar', () => {
      const seen: Record<string, boolean> = {}
      const { unmount } = render(
        <StrictMode>
          <Probe seen={seen} />
        </StrictMode>
      )

      expect(document.querySelectorAll('#conectado-parent')).toHaveLength(1)
      expect(document.querySelectorAll('#conectado-wrapper')).toHaveLength(1)
      expect(seen.enRef).toBe(true)

      unmount()

      expect(document.getElementById('conectado-parent')).toBeNull()
    })
  })
})
