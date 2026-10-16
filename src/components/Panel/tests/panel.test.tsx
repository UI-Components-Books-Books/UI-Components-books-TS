import { createRef } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Panel } from '../index'
import type { NavSectionProps, PanelAriaLabelGenerator, PanelProps } from '../types/types'

const setup = (panelProps: Partial<PanelProps> = {}, navProps: NavSectionProps | null = {}) =>
  render(
    <Panel {...panelProps}>
      {navProps && <Panel.Nav {...navProps} />}
      <Panel.Section id="s1">Primera</Panel.Section>
      <Panel.Section id="s2">Segunda</Panel.Section>
      <Panel.Section id="s3">Tercera</Panel.Section>
    </Panel>
  )

const sectionEl = (id: string) => document.querySelector(`section[data-value="${id}"]`) as HTMLElement
const visibleIds = () =>
  Array.from(document.querySelectorAll('section'))
    .filter((s) => !s.hidden)
    .map((s) => s.getAttribute('data-value'))
const tabs = () => screen.getAllByRole('tab')
const selectedTab = () => tabs().findIndex((t) => t.getAttribute('aria-selected') === 'true')

// Se simula con fireEvent para controlar el elemento que recibe cada tecla.
const arrow = (element: HTMLElement, direction: 'left' | 'right') =>
  fireEvent.keyDown(element, {
    key: direction === 'left' ? 'ArrowLeft' : 'ArrowRight',
  })

describe('Panel', () => {
  describe('secciones', () => {
    it('muestra solo la primera sección por defecto', () => {
      setup()

      expect(visibleIds()).toEqual(['s1'])
      expect(sectionEl('s1')).toHaveTextContent('Primera')
      expect(sectionEl('s2')).toHaveAttribute('aria-hidden', 'true')
    })

    it('respeta defaultIndex', () => {
      setup({ defaultIndex: 2 })

      expect(visibleIds()).toEqual(['s3'])
    })

    it.each([-1, 3, 99])('no muestra ninguna sección con un defaultIndex fuera de rango (%i)', (defaultIndex) => {
      setup({ defaultIndex })

      expect(visibleIds()).toEqual([])
    })

    it('las secciones son tabpanel y la visible es accesible por rol', () => {
      setup()

      expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Primera')
      expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3)
    })

    it('cada sección tiene un texto para lectores de pantalla con su número (desde 1)', () => {
      setup()

      expect(sectionEl('s1').querySelector('.u-sr-only')).toHaveTextContent('Sección 1')
      expect(sectionEl('s3').querySelector('.u-sr-only')).toHaveTextContent('Sección 3')
      const label = document.getElementById(sectionEl('s2').getAttribute('aria-labelledby') as string)
      expect(label).toHaveTextContent('Sección 2')
      expect(sectionEl('s2')).toContainElement(label)
    })

    it('genera ids únicos cuando las secciones no reciben id', () => {
      render(
        <Panel>
          <Panel.Section>Uno</Panel.Section>
          <Panel.Section>Dos</Panel.Section>
        </Panel>
      )

      const [a, b] = Array.from(document.querySelectorAll('section')).map((s) => s.getAttribute('data-value'))
      expect(a).toBeTruthy()
      expect(a).not.toBe(b)
    })

    it('expone la sección abierta en data-value del contenedor', () => {
      const { container } = setup({ defaultIndex: 1 })

      expect(container.querySelector('.c-panel')).toHaveAttribute('data-value', 's2')
    })

    it('agrega addClass al panel y a la sección', () => {
      const { container } = render(
        <Panel addClass="mi-panel">
          <Panel.Section id="x" addClass="mi-seccion">
            Contenido
          </Panel.Section>
        </Panel>
      )

      expect(container.querySelector('.c-panel')).toHaveClass('mi-panel')
      expect(sectionEl('x')).toHaveClass('c-section', 'mi-seccion')
    })

    it('reenvía la ref de la sección', () => {
      const ref = createRef<HTMLDivElement>()
      render(
        <Panel>
          <Panel.Section id="x" ref={ref}>
            Contenido
          </Panel.Section>
        </Panel>
      )

      expect(ref.current).toBe(sectionEl('x'))
    })
  })

  describe('modo carrousel', () => {
    it('el panel es un grupo "Slider" y cada sección un grupo "Sección"', () => {
      const { container } = setup({ type: 'carrousel' })

      expect(container.querySelector('.c-panel')).toHaveAttribute('role', 'group')
      expect(container.querySelector('.c-panel')).toHaveAttribute('aria-roledescription', 'Slider')
      expect(sectionEl('s1')).toHaveAttribute('role', 'group')
      expect(sectionEl('s1')).toHaveAttribute('aria-roledescription', 'Sección')
    })

    it('sin type="carrousel" no agrega esos roles al contenedor', () => {
      const { container } = setup()

      expect(container.querySelector('.c-panel')).not.toHaveAttribute('role')
      expect(sectionEl('s1')).toHaveAttribute('role', 'tabpanel')
    })
  })

  describe('Panel.Nav', () => {
    it('dibuja un tablist con una pestaña por sección y un título oculto', () => {
      setup()

      expect(screen.getByRole('tablist', { name: 'Lista de secciones' })).toBeInTheDocument()
      expect(tabs()).toHaveLength(3)
    })

    it('permite personalizar el label y agrega addClass', () => {
      setup({}, { label: 'Capítulos', addClass: 'mi-nav' })

      expect(screen.getByRole('tablist', { name: 'Capítulos' })).toHaveClass('c-navigation', 'mi-nav')
    })

    it('la pestaña de la sección activa está seleccionada y es la única tabulable', () => {
      setup({ defaultIndex: 1 })

      expect(selectedTab()).toBe(1)
      expect(tabs()[1]).toHaveAttribute('tabindex', '0')
      expect(tabs()[0]).toHaveAttribute('tabindex', '-1')
      expect(tabs()[2]).toHaveAttribute('tabindex', '-1')
    })

    it('al hacer click en una pestaña muestra su sección', async () => {
      setup()

      await userEvent.click(tabs()[2])

      expect(visibleIds()).toEqual(['s3'])
      expect(selectedTab()).toBe(2)
    })

    it('no dibuja botones anterior/siguiente por defecto', () => {
      setup()

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('showPrevButton y showNextButton dibujan los botones con su aria-label en español', () => {
      setup({}, { showPrevButton: true, showNextButton: true })

      expect(screen.getByRole('button', { name: 'Ir a la anterior sección' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Ir a la siguiente sección' })).toBeInTheDocument()
    })

    it('deshabilita "anterior" en la primera sección y "siguiente" en la última', async () => {
      setup({}, { showPrevButton: true, showNextButton: true })
      const prev = screen.getByRole('button', { name: 'Ir a la anterior sección' })
      const next = screen.getByRole('button', { name: 'Ir a la siguiente sección' })
      expect(prev).toBeDisabled()
      expect(next).toBeEnabled()

      await userEvent.click(tabs()[2])

      expect(next).toBeDisabled()
      expect(prev).toBeEnabled()
    })

    it('los botones anterior/siguiente navegan entre secciones', async () => {
      setup({ defaultIndex: 1 }, { showPrevButton: true, showNextButton: true })

      await userEvent.click(screen.getByRole('button', { name: 'Ir a la siguiente sección' }))
      expect(visibleIds()).toEqual(['s3'])

      await userEvent.click(screen.getByRole('button', { name: 'Ir a la anterior sección' }))
      expect(visibleIds()).toEqual(['s2'])
    })

    it('permite personalizar los aria-label con getItemAriaLabel', () => {
      setup(
        {},
        {
          showNextButton: true,
          getItemAriaLabel: (type, selected, section) => `${type}-${section ?? 'x'}-${selected}`,
        }
      )

      expect(screen.getByRole('tab', { name: 'section-0-true' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'section-1-false' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'next-x-false' })).toBeInTheDocument()
    })

    it('la pestaña seleccionada y las no seleccionadas tienen aria-label distintos', () => {
      setup()

      expect(tabs()[0].getAttribute('aria-label')).not.toBe(tabs()[1].getAttribute('aria-label'))
      expect(tabs()[1].getAttribute('aria-label')).toMatch(/^Ir a la /)
    })

    it('las etiquetas de las pestañas numeran las secciones desde 1, igual que cada sección', () => {
      setup()

      expect(tabs()[0]).toHaveAttribute('aria-label', 'sección 1')
      expect(tabs()[1]).toHaveAttribute('aria-label', 'Ir a la sección 2')
      expect(tabs()[2]).toHaveAttribute('aria-label', 'Ir a la sección 3')
    })

    it('la etiqueta de cada pestaña coincide con el texto "Sección N" de la sección que abre', () => {
      setup()

      tabs().forEach((tab, index) => {
        const sectionText = sectionEl(['s1', 's2', 's3'][index]).querySelector('.u-sr-only')?.textContent
        const number = sectionText?.replace('Sección ', '')
        expect(tab.getAttribute('aria-label')).toMatch(new RegExp(`sección ${number}$`))
      })
    })

    it('getItemAriaLabel sigue recibiendo el índice de la sección desde 0', () => {
      const getItemAriaLabel = vi.fn<PanelAriaLabelGenerator>(() => 'x')
      setup({}, { getItemAriaLabel })

      const sectionCalls = getItemAriaLabel.mock.calls.filter(([type]) => type === 'section')
      expect(sectionCalls.map(([, , section]) => section)).toEqual(expect.arrayContaining([0, 1, 2]))
    })

    describe('navegación con teclado', () => {
      it('flecha derecha mueve el foco a la siguiente pestaña', () => {
        setup()
        tabs()[0].focus()

        arrow(tabs()[0], 'right')

        expect(tabs()[1]).toHaveFocus()
      })

      it('flecha izquierda mueve el foco a la pestaña anterior', () => {
        setup()
        tabs()[2].focus()

        arrow(tabs()[2], 'left')

        expect(tabs()[1]).toHaveFocus()
      })

      it('es circular: desde el último elemento va al primero y viceversa', () => {
        // En una sección intermedia ni "anterior" ni "siguiente" están deshabilitados.
        setup({ defaultIndex: 1 }, { showPrevButton: true, showNextButton: true })
        const prev = screen.getByRole('button', { name: 'Ir a la anterior sección' })
        const next = screen.getByRole('button', { name: 'Ir a la siguiente sección' })
        next.focus()

        arrow(next, 'right')
        expect(prev).toHaveFocus()

        arrow(prev, 'left')
        expect(next).toHaveFocus()
      })

      it('flecha izquierda no deja el foco atascado cuando "anterior" está deshabilitado', () => {
        setup({}, { showPrevButton: true, showNextButton: true })
        tabs()[0].focus()

        arrow(tabs()[0], 'left')

        // "anterior" está deshabilitado en la primera sección: se salta y el foco da la vuelta.
        expect(screen.getByRole('button', { name: 'Ir a la siguiente sección' })).toHaveFocus()
      })

      it('flecha derecha salta "siguiente" si está deshabilitado (última sección) y vuelve al inicio', () => {
        setup({ defaultIndex: 2 }, { showPrevButton: true, showNextButton: true })
        tabs()[2].focus()

        arrow(tabs()[2], 'right')

        expect(screen.getByRole('button', { name: 'Ir a la anterior sección' })).toHaveFocus()
      })

      it('funciona con las teclas pulsadas como lo haría un usuario (userEvent)', async () => {
        setup()
        tabs()[0].focus()

        await userEvent.keyboard('{ArrowRight}')
        expect(tabs()[1]).toHaveFocus()

        await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
        expect(tabs()[2]).toHaveFocus()
      })

      it('ignora otras teclas', () => {
        setup()
        tabs()[0].focus()

        fireEvent.keyDown(tabs()[0], { key: 'a' })

        expect(tabs()[0]).toHaveFocus()
      })

      it('mover el foco no cambia la sección visible', () => {
        setup()
        tabs()[0].focus()

        arrow(tabs()[0], 'right')

        expect(visibleIds()).toEqual(['s1'])
      })
    })

    describe('onValue', () => {
      it('se llama al cambiar de sección con el total de secciones', async () => {
        const onValue = vi.fn()
        setup({}, { onValue })

        await userEvent.click(tabs()[1])

        expect(onValue).toHaveBeenCalledTimes(1)
        expect(onValue.mock.calls[0][1]).toBe(3)
      })

      it('recibe el índice de la nueva sección, no el de la que se abandona', async () => {
        const onValue = vi.fn()
        setup({}, { onValue })

        await userEvent.click(tabs()[1])

        expect(onValue).toHaveBeenCalledWith(1, 3)
      })

      it('con los botones anterior/siguiente también informa la sección de destino', async () => {
        const onValue = vi.fn()
        setup({ defaultIndex: 1 }, { onValue, showPrevButton: true, showNextButton: true })

        await userEvent.click(screen.getByRole('button', { name: 'Ir a la siguiente sección' }))
        expect(onValue).toHaveBeenLastCalledWith(2, 3)

        await userEvent.click(screen.getByRole('button', { name: 'Ir a la anterior sección' }))
        expect(onValue).toHaveBeenLastCalledWith(1, 3)
      })

      it('informa la sección elegida aunque se haga click en varias seguidas', async () => {
        const onValue = vi.fn()
        setup({}, { onValue })

        await userEvent.click(tabs()[2])
        await userEvent.click(tabs()[0])

        expect(onValue.mock.calls.map(([section]) => section)).toEqual([2, 0])
      })
    })
  })

  describe('ids únicos', () => {
    const repeatedIds = () => {
      const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id)
      return ids.filter((id, index) => ids.indexOf(id) !== index)
    }

    it('un solo panel con navegación no repite ningún id', () => {
      render(
        <Panel>
          <Panel.Nav />
          <Panel.Section id="s1">Primera</Panel.Section>
          <Panel.Section id="s2">Segunda</Panel.Section>
        </Panel>
      )

      expect(repeatedIds()).toEqual([])
      expect(document.querySelectorAll('[role="tab"][id]')).toHaveLength(2)
    })

    const renderTwoPanels = () =>
      render(
        <>
          <Panel>
            <Panel.Nav label="Capítulos" />
            <Panel.Section id="intro">Uno</Panel.Section>
            <Panel.Section id="fin">Dos</Panel.Section>
          </Panel>
          <Panel>
            <Panel.Nav label="Ejercicios" />
            <Panel.Section id="intro">Tres</Panel.Section>
            <Panel.Section id="fin">Cuatro</Panel.Section>
          </Panel>
        </>
      )

    it('dos paneles con los mismos ids de sección no repiten ningún id', () => {
      renderTwoPanels()

      expect(repeatedIds()).toEqual([])
    })

    it('cada lista de pestañas se nombra con el título de su propia navegación', () => {
      renderTwoPanels()

      expect(screen.getByRole('tablist', { name: 'Capítulos' })).toBeInTheDocument()
      expect(screen.getByRole('tablist', { name: 'Ejercicios' })).toBeInTheDocument()
    })

    it('cada sección se nombra con su propio texto "Sección N", dentro de su panel', () => {
      renderTwoPanels()

      const panels = Array.from(document.querySelectorAll<HTMLElement>('.c-panel'))
      const sections = panels.map((panel) => Array.from(panel.querySelectorAll('section')))
      sections.forEach((panelSections, panelIndex) => {
        panelSections.forEach((section, index) => {
          const label = document.getElementById(section.getAttribute('aria-labelledby') as string)
          expect(label).toHaveTextContent(`Sección ${index + 1}`)
          expect(panels[panelIndex]).toContainElement(label)
        })
      })
    })

    it('dos navegaciones dentro del mismo panel tampoco repiten ids y se nombran cada una', () => {
      render(
        <Panel>
          <Panel.Nav label="Arriba" />
          <Panel.Section id="s1">Primera</Panel.Section>
          <Panel.Section id="s2">Segunda</Panel.Section>
          <Panel.Nav label="Abajo" />
        </Panel>
      )

      expect(repeatedIds()).toEqual([])
      expect(screen.getByRole('tablist', { name: 'Arriba' })).toBeInTheDocument()
      expect(screen.getByRole('tablist', { name: 'Abajo' })).toBeInTheDocument()
    })

    it('con ids de sección automáticos tampoco se repite ninguno', () => {
      render(
        <>
          <Panel>
            <Panel.Nav />
            <Panel.Section>Uno</Panel.Section>
            <Panel.Section>Dos</Panel.Section>
          </Panel>
          <Panel>
            <Panel.Nav />
            <Panel.Section>Tres</Panel.Section>
          </Panel>
        </>
      )

      expect(repeatedIds()).toEqual([])
    })
  })

  describe('Panel.Button', () => {
    const withButtons = (extra: React.ReactNode = null) =>
      render(
        <Panel>
          <Panel.Button section={2}>
            <button>Ir a la tercera</button>
          </Panel.Button>
          <Panel.Button section={0}>
            <button>Ir a la primera</button>
          </Panel.Button>
          {extra}
          <Panel.Section id="s1">Primera</Panel.Section>
          <Panel.Section id="s2">Segunda</Panel.Section>
          <Panel.Section id="s3">Tercera</Panel.Section>
        </Panel>
      )

    it('lleva a la sección indicada (índice desde 0)', async () => {
      withButtons()

      await userEvent.click(screen.getByRole('button', { name: 'Ir a la tercera' }))
      expect(visibleIds()).toEqual(['s3'])

      await userEvent.click(screen.getByRole('button', { name: 'Ir a la primera' }))
      expect(visibleIds()).toEqual(['s1'])
    })

    it('conserva el onClick original del botón', async () => {
      const onClick = vi.fn()
      render(
        <Panel>
          <Panel.Button section={1}>
            <button onClick={onClick}>Ir</button>
          </Panel.Button>
          <Panel.Section id="s1">Primera</Panel.Section>
          <Panel.Section id="s2">Segunda</Panel.Section>
        </Panel>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Ir' }))

      expect(onClick).toHaveBeenCalledTimes(1)
      expect(visibleIds()).toEqual(['s2'])
    })

    it.each([-1, 7])('ignora un índice de sección inválido (%i)', async (section) => {
      render(
        <Panel>
          <Panel.Button section={section}>
            <button>Inválido</button>
          </Panel.Button>
          <Panel.Section id="s1">Primera</Panel.Section>
          <Panel.Section id="s2">Segunda</Panel.Section>
        </Panel>
      )

      await userEvent.click(screen.getByRole('button', { name: 'Inválido' }))

      expect(visibleIds()).toEqual(['s1'])
    })
  })

  describe('audios', () => {
    const addAudio = (paused: boolean) => {
      const audio = document.createElement('audio')
      Object.defineProperty(audio, 'paused', { value: paused, configurable: true })
      const pause = vi.spyOn(audio, 'pause').mockImplementation(() => {})
      document.body.appendChild(audio)
      return { audio, pause }
    }

    it('pausa los audios que están sonando cuando se muestra una sección', async () => {
      const playing = addAudio(false)
      setup()

      playing.pause.mockClear()
      await userEvent.click(tabs()[1])

      expect(playing.pause).toHaveBeenCalled()
      playing.audio.remove()
    })

    it('no toca los audios que ya estaban en pausa', async () => {
      const stopped = addAudio(true)
      setup()

      await userEvent.click(tabs()[1])

      expect(stopped.pause).not.toHaveBeenCalled()
      stopped.audio.remove()
    })
  })
})
