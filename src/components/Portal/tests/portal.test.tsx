import { StrictMode, useEffect, useLayoutEffect, useRef } from 'react'

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Portal } from '../index'

describe('Portal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renderiza los hijos fuera del árbol del componente, dentro del body', () => {
    const { container } = render(
      <div>
        <Portal id="mi-portal">
          <p>en el portal</p>
        </Portal>
      </div>
    )

    const content = screen.getByText('en el portal')
    expect(container).not.toContainElement(content)
    expect(document.body).toContainElement(content)
  })

  it('crea el contenedor con un id que empieza por el id recibido', () => {
    render(
      <Portal id="mi-portal">
        <p>contenido</p>
      </Portal>
    )

    const parent = document.querySelector('[id^="mi-portal-"][id$="-parent"]')
    expect(parent).toBeInTheDocument()
    expect(parent).toHaveTextContent('contenido')
  })

  it('usa el prefijo "portal" cuando no se pasa id', () => {
    render(
      <Portal>
        <p>sin id</p>
      </Portal>
    )

    expect(document.querySelector('[id^="portal-"][id$="-parent"]')).toBeInTheDocument()
  })

  it('genera un contenedor distinto por cada instancia con el mismo id', () => {
    render(
      <>
        <Portal id="dup">
          <p>uno</p>
        </Portal>
        <Portal id="dup">
          <p>dos</p>
        </Portal>
      </>
    )

    expect(document.querySelectorAll('[id^="dup-"][id$="-parent"]')).toHaveLength(2)
  })

  it('elimina el contenedor del DOM al desmontar', () => {
    const { unmount } = render(
      <Portal id="temporal">
        <p>efímero</p>
      </Portal>
    )
    expect(screen.getByText('efímero')).toBeInTheDocument()

    unmount()

    expect(screen.queryByText('efímero')).not.toBeInTheDocument()
    expect(document.querySelector('[id^="temporal-"]')).toBeNull()
  })

  it.each([
    ['sin crypto.randomUUID (contextos no seguros, como HTTP en una red local)', {}],
    ['sin crypto', undefined],
  ])('funciona %s', (_name, crypto) => {
    vi.stubGlobal('crypto', crypto)

    render(
      <Portal id="inseguro">
        <p>contenido</p>
      </Portal>
    )

    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(document.querySelector('[id^="inseguro-"][id$="-parent"]')).toBeInTheDocument()
  })

  describe('foco inicial dentro del portal', () => {
    // El contenido del portal se monta con su contenedor ya dentro del documento: antes enfocar
    // desde el montaje no hacía nada, porque un elemento fuera del documento no puede tener foco.
    const FocusOnMount = ({ when }: { when: 'effect' | 'layout' }) => {
      const ref = useRef<HTMLInputElement>(null)
      const useHook = when === 'effect' ? useEffect : useLayoutEffect
      useHook(() => ref.current?.focus(), [])
      return <input ref={ref} aria-label="Campo" />
    }

    it('el atributo autoFocus enfoca el campo', () => {
      render(
        <Portal id="foco">
          <input aria-label="Campo" autoFocus />
        </Portal>
      )

      expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveFocus()
    })

    it('enfocar desde un useEffect del contenido funciona', () => {
      render(
        <Portal id="foco">
          <FocusOnMount when="effect" />
        </Portal>
      )

      expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveFocus()
    })

    it('enfocar desde un useLayoutEffect del contenido funciona', () => {
      render(
        <Portal id="foco">
          <FocusOnMount when="layout" />
        </Portal>
      )

      expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveFocus()
    })

    it('funciona también con StrictMode', () => {
      render(
        <StrictMode>
          <Portal id="foco">
            <input aria-label="Campo" autoFocus />
          </Portal>
        </StrictMode>
      )

      expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveFocus()
      expect(document.querySelectorAll('[id^="foco-"][id$="-parent"]')).toHaveLength(1)
    })
  })
})
