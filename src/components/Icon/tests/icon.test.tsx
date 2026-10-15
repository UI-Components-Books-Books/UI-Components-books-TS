import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Icon } from '../index'

const Svg = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="svg" {...props}>
    <path d="M0 0" />
  </svg>
)

describe('Icon', () => {
  it('renderiza el elemento hijo con las clases c-icon y el tamaño normal por defecto', () => {
    render(
      <Icon>
        <Svg />
      </Icon>
    )

    const svg = screen.getByTestId('svg')
    expect(svg).toHaveClass('c-icon', 'c-normal')
  })

  it.each(['small', 'normal', 'big'] as const)('aplica el tamaño %s', (size) => {
    render(
      <Icon size={size}>
        <Svg />
      </Icon>
    )

    expect(screen.getByTestId('svg')).toHaveClass(`c-${size}`)
  })

  it('lo oculta de las tecnologías de asistencia con aria-hidden', () => {
    render(
      <Icon>
        <Svg />
      </Icon>
    )

    expect(screen.getByTestId('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('conserva las props del hijo', () => {
    render(
      <Icon>
        <Svg width="24" height="24" />
      </Icon>
    )

    expect(screen.getByTestId('svg')).toHaveAttribute('width', '24')
    expect(screen.getByTestId('svg')).toHaveAttribute('height', '24')
  })

  it('conserva la className que ya tenía el hijo', () => {
    render(
      <Icon>
        <Svg className="mi-icono" />
      </Icon>
    )

    expect(screen.getByTestId('svg')).toHaveClass('c-icon', 'mi-icono')
  })

  it('avisa si el hijo no es un elemento React válido', () => {
    render(<Icon>{'texto' as unknown as React.ReactElement}</Icon>)

    expect(screen.getByText("It isn't a valid element")).toBeInTheDocument()
  })
})
