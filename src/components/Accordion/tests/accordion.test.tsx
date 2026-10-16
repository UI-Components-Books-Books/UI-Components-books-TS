import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Accordion } from '../index'
import { ExpandLessIcon, ExpandMoreIcon } from '../src/accordion-icons'
import type { AccordionProps } from '../types/types'

const setup = (props: Partial<AccordionProps> = {}) =>
  render(
    <Accordion {...props}>
      <Accordion.Item id="a">
        <Accordion.Button>Uno</Accordion.Button>
        <Accordion.Panel>Contenido uno</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="b">
        <Accordion.Button>Dos</Accordion.Button>
        <Accordion.Panel>Contenido dos</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="c">
        <Accordion.Button>Tres</Accordion.Button>
        <Accordion.Panel>Contenido tres</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )

const button = (name: string) => screen.getByRole('button', { name })
// Un panel cerrado lleva aria-hidden y, según la especificación de nombres accesibles, su nombre
// queda vacío; por eso se localiza a través del aria-controls de su botón y no por rol + nombre.
const panel = (name: string) => document.getElementById(button(name).getAttribute('aria-controls')!)!

describe('Accordion', () => {
  describe('estado inicial', () => {
    it('empieza con todos los paneles cerrados', () => {
      setup()

      ;['Uno', 'Dos', 'Tres'].forEach((name) => {
        expect(button(name)).toHaveAttribute('aria-expanded', 'false')
        expect(panel(name)).toHaveAttribute('aria-hidden', 'true')
        expect(panel(name)).toHaveAttribute('inert')
      })
    })

    it('abre el panel indicado por defaultIndex', () => {
      setup({ defaultIndex: 1 })

      expect(button('Dos')).toHaveAttribute('aria-expanded', 'true')
      expect(panel('Dos')).toHaveAttribute('aria-hidden', 'false')
      expect(panel('Dos')).not.toHaveAttribute('inert')
      expect(button('Uno')).toHaveAttribute('aria-expanded', 'false')
    })

    it.each([-1, 3, 99])('ignora un defaultIndex fuera de rango (%i)', (defaultIndex) => {
      setup({ defaultIndex })

      expect(screen.getAllByRole('button').every((b) => b.getAttribute('aria-expanded') === 'false')).toBe(true)
    })
  })

  describe('accesibilidad', () => {
    it('relaciona el botón con su panel mediante aria-controls y aria-labelledby', () => {
      setup()

      expect(button('Uno')).toHaveAttribute('id', 'accordion-button-a')
      expect(button('Uno')).toHaveAttribute('aria-controls', 'accordion-panel-a')
      expect(panel('Uno')).toHaveAttribute('id', 'accordion-panel-a')
      expect(panel('Uno')).toHaveAttribute('aria-labelledby', 'accordion-button-a')
    })

    it('genera ids únicos cuando los items no reciben id', () => {
      render(
        <Accordion>
          <Accordion.Item>
            <Accordion.Button>Sin id 1</Accordion.Button>
            <Accordion.Panel>p1</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Button>Sin id 2</Accordion.Button>
            <Accordion.Panel>p2</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )

      expect(button('Sin id 1').id).not.toBe(button('Sin id 2').id)
      expect(panel('Sin id 1')).toHaveAttribute('aria-labelledby', button('Sin id 1').id)
      expect(panel('Sin id 2')).toHaveAttribute('aria-labelledby', button('Sin id 2').id)
      expect(panel('Sin id 1')).not.toBe(panel('Sin id 2'))
    })

    it('se puede operar con el teclado (Enter y espacio)', async () => {
      setup()

      await userEvent.tab()
      await userEvent.keyboard('{Enter}')
      expect(button('Uno')).toHaveAttribute('aria-expanded', 'true')

      await userEvent.keyboard(' ')
      expect(button('Uno')).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('modo exclusivo (allowMultiple = false)', () => {
    it('abre un panel al hacer click y lo cierra al volver a hacer click', async () => {
      setup()

      await userEvent.click(button('Uno'))
      expect(button('Uno')).toHaveAttribute('aria-expanded', 'true')
      expect(panel('Uno')).toHaveAttribute('aria-hidden', 'false')

      await userEvent.click(button('Uno'))
      expect(button('Uno')).toHaveAttribute('aria-expanded', 'false')
    })

    it('al abrir otro panel cierra el anterior', async () => {
      setup()

      await userEvent.click(button('Uno'))
      await userEvent.click(button('Dos'))

      expect(button('Uno')).toHaveAttribute('aria-expanded', 'false')
      expect(button('Dos')).toHaveAttribute('aria-expanded', 'true')
    })

    it('el contenido del panel abierto es accesible y el de los cerrados no', async () => {
      setup()
      await userEvent.click(button('Dos'))

      expect(screen.getByRole('region', { name: 'Dos' })).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Uno' })).not.toBeInTheDocument()
    })
  })

  describe('modo múltiple (allowMultiple)', () => {
    it('permite tener varios paneles abiertos a la vez', async () => {
      setup({ allowMultiple: true })

      await userEvent.click(button('Uno'))
      await userEvent.click(button('Tres'))

      expect(button('Uno')).toHaveAttribute('aria-expanded', 'true')
      expect(button('Dos')).toHaveAttribute('aria-expanded', 'false')
      expect(button('Tres')).toHaveAttribute('aria-expanded', 'true')
    })

    it('cierra solo el panel sobre el que se hace click', async () => {
      setup({ allowMultiple: true })
      await userEvent.click(button('Uno'))
      await userEvent.click(button('Dos'))

      await userEvent.click(button('Uno'))

      expect(button('Uno')).toHaveAttribute('aria-expanded', 'false')
      expect(button('Dos')).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('AccordionButton', () => {
    it('llama a onClick y además alterna el panel', async () => {
      const onClick = vi.fn()
      render(
        <Accordion>
          <Accordion.Item id="x">
            <Accordion.Button onClick={onClick}>Botón</Accordion.Button>
            <Accordion.Panel>Panel</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )

      await userEvent.click(button('Botón'))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(button('Botón')).toHaveAttribute('aria-expanded', 'true')
    })

    it('por defecto muestra la flecha hacia abajo con el item cerrado y hacia arriba con el abierto', async () => {
      const pathOf = (icon: React.ReactElement) =>
        render(icon).container.querySelector('path')?.getAttribute('d')
      const down = pathOf(<ExpandMoreIcon />)
      const up = pathOf(<ExpandLessIcon />)
      setup()
      const currentPath = () => button('Uno').querySelector('svg path')?.getAttribute('d')

      expect(currentPath()).toBe(down)

      await userEvent.click(button('Uno'))
      expect(currentPath()).toBe(up)

      await userEvent.click(button('Uno'))
      expect(currentPath()).toBe(down)
    })

    it('muestra un ícono por defecto, que cambia al expandirse', async () => {
      setup()
      const pathBefore = button('Uno').querySelector('svg path')?.getAttribute('d')

      await userEvent.click(button('Uno'))
      const pathAfter = button('Uno').querySelector('svg path')?.getAttribute('d')

      expect(pathBefore).toBeTruthy()
      expect(pathAfter).toBeTruthy()
      expect(pathAfter).not.toBe(pathBefore)
    })

    // `expandedIcon` es el ícono que invita a expandir (visible con el item cerrado) y `closedIcon`
    // el que invita a cerrar (visible con el item abierto). Es así desde la primera versión y es lo
    // que muestra la story: invertirlo cambiaría los íconos de quien ya pasa las dos props.
    it('usa expandedIcon con el item cerrado y closedIcon con el item abierto', async () => {
      render(
        <Accordion>
          <Accordion.Item id="x">
            <Accordion.Button expandedIcon={<i>ICONO-A</i>} closedIcon={<i>ICONO-B</i>}>
              Con íconos
            </Accordion.Button>
            <Accordion.Panel>Panel</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )
      expect(screen.getByText('ICONO-A')).toBeInTheDocument()
      expect(screen.queryByText('ICONO-B')).not.toBeInTheDocument()

      await userEvent.click(button('Con íconos ICONO-A'))

      expect(screen.getByText('ICONO-B')).toBeInTheDocument()
      expect(screen.queryByText('ICONO-A')).not.toBeInTheDocument()
    })

    it('agrega addClass y reenvía atributos HTML al botón', () => {
      render(
        <Accordion>
          <Accordion.Item id="x">
            <Accordion.Button addClass="mi-boton" data-testid="btn">
              Botón
            </Accordion.Button>
            <Accordion.Panel>Panel</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )

      expect(screen.getByTestId('btn')).toHaveClass('c-accordion__button', 'mi-boton')
    })
  })

  describe('clases personalizadas', () => {
    it('aplica addClass al item y al panel', () => {
      const { container } = render(
        <Accordion>
          <Accordion.Item id="x" addClass="mi-item">
            <Accordion.Button>B</Accordion.Button>
            <Accordion.Panel addClass="mi-panel">P</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )

      expect(container.querySelector('.c-accordion__item')).toHaveClass('mi-item')
      expect(container.querySelector('.c-accordion__panel')).toHaveClass('mi-panel')
    })
  })
})
