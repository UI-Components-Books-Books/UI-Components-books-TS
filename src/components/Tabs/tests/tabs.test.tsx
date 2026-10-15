import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Tabs } from '../index'
import type { TabsProps } from '../types/types'

const setup = (props: Partial<TabsProps> = {}) =>
  render(
    <Tabs {...props}>
      <Tabs.TabList label="Secciones" orientation="horizontal">
        <Tabs.Tab>Uno</Tabs.Tab>
        <Tabs.Tab>Dos</Tabs.Tab>
        <Tabs.Tab>Tres</Tabs.Tab>
      </Tabs.TabList>
      <Tabs.TabPanels>
        <Tabs.TabPanel>Contenido uno</Tabs.TabPanel>
        <Tabs.TabPanel>Contenido dos</Tabs.TabPanel>
        <Tabs.TabPanel>Contenido tres</Tabs.TabPanel>
      </Tabs.TabPanels>
    </Tabs>
  )

const tab = (name: string) => screen.getByRole('tab', { name })

// La navegación con flechas lee `event.keyCode` (37 = izquierda, 39 = derecha).
// `userEvent.keyboard` no lo rellena, pero los navegadores sí.
const arrow = (element: HTMLElement, direction: 'left' | 'right') =>
  fireEvent.keyDown(element, {
    key: direction === 'left' ? 'ArrowLeft' : 'ArrowRight',
    keyCode: direction === 'left' ? 37 : 39,
  })

describe('Tabs', () => {
  describe('estructura y accesibilidad', () => {
    it('renderiza un tablist con tabs y tabpanels', () => {
      setup()

      expect(screen.getByRole('tablist', { name: 'Secciones' })).toBeInTheDocument()
      expect(screen.getAllByRole('tab')).toHaveLength(3)
      expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3)
    })

    it('expone la orientación del tablist', () => {
      render(
        <Tabs>
          <Tabs.TabList label="Vertical" orientation="vertical">
            <Tabs.Tab>Uno</Tabs.Tab>
          </Tabs.TabList>
          <Tabs.TabPanels>
            <Tabs.TabPanel>Contenido</Tabs.TabPanel>
          </Tabs.TabPanels>
        </Tabs>
      )

      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('relaciona cada tab con su panel (aria-controls / aria-labelledby)', () => {
      setup()

      expect(tab('Uno')).toHaveAttribute('id', 'tab-0')
      expect(tab('Uno')).toHaveAttribute('aria-controls', 'panel-0')
      const panel = document.getElementById('panel-0')
      expect(panel).toHaveAttribute('aria-labelledby', 'tab-0')
      expect(tab('Dos')).toHaveAttribute('aria-controls', 'panel-1')
    })

    // BUG CONOCIDO: los ids son `tab-${índice}` / `panel-${índice}` sin nada único por instancia,
    // así que dos <Tabs> en la misma página generan ids duplicados (y aria-controls apunta al
    // primer panel que encuentre el navegador). Cuando se corrija, este test fallará: quitar `.fails`.
    it.fails('dos instancias de Tabs en la misma página no repiten ids', () => {
      render(
        <>
          {[1, 2].map((n) => (
            <Tabs key={n}>
              <Tabs.TabList label={`Lista ${n}`} orientation="horizontal">
                <Tabs.Tab>Tab</Tabs.Tab>
              </Tabs.TabList>
              <Tabs.TabPanels>
                <Tabs.TabPanel>Panel</Tabs.TabPanel>
              </Tabs.TabPanels>
            </Tabs>
          ))}
        </>
      )

      const ids = Array.from(document.querySelectorAll('[id]')).map((el) => el.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('usa el label por defecto y la orientación horizontal cuando no se indican', () => {
      render(
        <Tabs>
          <Tabs.TabList {...({} as { label: string; orientation: 'horizontal' })}>
            <Tabs.Tab>Uno</Tabs.Tab>
          </Tabs.TabList>
          <Tabs.TabPanels>
            <Tabs.TabPanel>Contenido</Tabs.TabPanel>
          </Tabs.TabPanels>
        </Tabs>
      )

      const list = screen.getByRole('tablist', { name: 'Simple tabs' })
      expect(list).toHaveAttribute('aria-orientation', 'horizontal')
    })
  })

  describe('selección', () => {
    it('selecciona la primera pestaña por defecto', () => {
      setup()

      expect(tab('Uno')).toHaveAttribute('aria-selected', 'true')
      expect(tab('Dos')).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Contenido uno')
    })

    it('respeta defaultIndex', () => {
      setup({ defaultIndex: 2 })

      expect(tab('Tres')).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Contenido tres')
    })

    it('solo el panel activo es visible y accesible', () => {
      setup({ defaultIndex: 1 })

      const visible = screen.getAllByRole('tabpanel')
      expect(visible).toHaveLength(1)
      expect(visible[0]).toHaveClass('c-tab__panel--active')

      const hidden = screen.getAllByRole('tabpanel', { hidden: true }).filter((p) => p !== visible[0])
      hidden.forEach((p) => {
        expect(p).toHaveAttribute('hidden')
        expect(p).toHaveAttribute('aria-hidden', 'true')
        expect(p).not.toHaveClass('c-tab__panel--active')
      })
    })

    it('cambia de pestaña y de panel al hacer click', async () => {
      setup()

      await userEvent.click(tab('Dos'))

      expect(tab('Dos')).toHaveAttribute('aria-selected', 'true')
      expect(tab('Uno')).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Contenido dos')
    })

    it('solo la pestaña seleccionada es tabulable (roving tabindex)', async () => {
      setup()
      expect(tab('Uno')).toHaveAttribute('tabindex', '0')
      expect(tab('Dos')).toHaveAttribute('tabindex', '-1')

      await userEvent.click(tab('Tres'))

      expect(tab('Tres')).toHaveAttribute('tabindex', '0')
      expect(tab('Uno')).toHaveAttribute('tabindex', '-1')
    })

    it('llama al onClick de la pestaña y además cambia la selección', async () => {
      const onClick = vi.fn()
      render(
        <Tabs>
          <Tabs.TabList label="L" orientation="horizontal">
            <Tabs.Tab>Uno</Tabs.Tab>
            <Tabs.Tab onClick={onClick}>Dos</Tabs.Tab>
          </Tabs.TabList>
          <Tabs.TabPanels>
            <Tabs.TabPanel>A</Tabs.TabPanel>
            <Tabs.TabPanel>B</Tabs.TabPanel>
          </Tabs.TabPanels>
        </Tabs>
      )

      await userEvent.click(tab('Dos'))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(tab('Dos')).toHaveAttribute('aria-selected', 'true')
    })

    it('renderiza el ícono de la pestaña, informándole si está seleccionada', async () => {
      render(
        <Tabs>
          <Tabs.TabList label="L" orientation="horizontal">
            <Tabs.Tab icon={(selected) => <i data-testid="ic">{selected ? 'on' : 'off'}</i>}>Uno</Tabs.Tab>
            <Tabs.Tab>Dos</Tabs.Tab>
          </Tabs.TabList>
          <Tabs.TabPanels>
            <Tabs.TabPanel>A</Tabs.TabPanel>
            <Tabs.TabPanel>B</Tabs.TabPanel>
          </Tabs.TabPanels>
        </Tabs>
      )
      expect(screen.getByTestId('ic')).toHaveTextContent('on')

      await userEvent.click(screen.getByRole('tab', { name: 'Dos' }))

      expect(screen.getByTestId('ic')).toHaveTextContent('off')
    })
  })

  describe('navegación con teclado', () => {
    it('flecha derecha mueve el foco a la siguiente pestaña sin activarla', () => {
      setup()
      tab('Uno').focus()

      arrow(tab('Uno'), 'right')

      expect(tab('Dos')).toHaveFocus()
      expect(tab('Uno')).toHaveAttribute('aria-selected', 'true')
    })

    it('flecha izquierda mueve el foco a la pestaña anterior', () => {
      setup()
      tab('Dos').focus()

      arrow(tab('Dos'), 'left')

      expect(tab('Uno')).toHaveFocus()
    })

    it('desde la última pestaña, flecha derecha vuelve a la primera', () => {
      setup()
      tab('Tres').focus()

      arrow(tab('Tres'), 'right')

      expect(tab('Uno')).toHaveFocus()
    })

    it('desde la primera pestaña, flecha izquierda salta a la última', () => {
      setup()
      tab('Uno').focus()

      arrow(tab('Uno'), 'left')

      expect(tab('Tres')).toHaveFocus()
    })

    it('ignora otras teclas', () => {
      setup()
      tab('Uno').focus()

      fireEvent.keyDown(tab('Uno'), { key: 'a', keyCode: 65 })

      expect(tab('Uno')).toHaveFocus()
    })
  })

  describe('clases personalizadas', () => {
    it('aplica addClass al contenedor, a la lista, a los paneles y a cada tab/panel', () => {
      const { container } = render(
        <Tabs addClass="mis-tabs">
          <Tabs.TabList label="L" orientation="horizontal" addClass="mi-lista">
            <Tabs.Tab addClass="mi-tab">Uno</Tabs.Tab>
          </Tabs.TabList>
          <Tabs.TabPanels addClass="mis-paneles">
            <Tabs.TabPanel addClass="mi-panel">A</Tabs.TabPanel>
          </Tabs.TabPanels>
        </Tabs>
      )

      expect(container.firstElementChild).toHaveClass('mis-tabs')
      expect(container.querySelector('.c-tab__list')).toHaveClass('mi-lista')
      expect(container.querySelector('.c-tab__panels')).toHaveClass('mis-paneles')
      expect(screen.getByRole('tab')).toHaveClass('c-tab__button', 'mi-tab')
      expect(screen.getByRole('tabpanel')).toHaveClass('c-tab__panel', 'mi-panel')
    })

    it('no agrega atributo class al contenedor si no se pasa addClass', () => {
      const { container } = setup()

      expect(container.firstElementChild).not.toHaveAttribute('class')
    })
  })
})
