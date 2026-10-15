import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Portal } from '../index'

describe('Portal', () => {
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
})
