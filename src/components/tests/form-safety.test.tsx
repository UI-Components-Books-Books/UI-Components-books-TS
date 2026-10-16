import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Item } from 'react-stately'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockMediaPlayback } from '../../test/media'
import {
  Accordion,
  Audio,
  Button,
  DragAndDrop,
  Interpreter,
  NumberInput,
  Pagination,
  Panel,
  Select,
  Tabs,
  VideoPlayer,
} from '../index'

/**
 * Un <button> sin `type` dentro de un <form> envía el formulario al hacer click (el valor por
 * defecto de HTML es "submit"). Los controles de la librería nunca deben hacerlo: estos tests
 * renderizan cada componente dentro de un formulario y comprueban que todos sus botones llevan
 * type="button" y que ningún click envía el formulario.
 */

vi.mock('gsap', () => ({
  default: {
    fromTo: vi.fn(),
    to: vi.fn((_target: unknown, vars?: { onComplete?: () => void }) => vars?.onComplete?.()),
  },
}))

// El adaptador de arrastre engancha eventos nativos que jsdom no simula; aquí solo importa el DOM.
vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: vi.fn(() => vi.fn()),
  dropTargetForElements: vi.fn(() => vi.fn()),
  monitorForElements: vi.fn(() => vi.fn()),
}))

const VTT = ['WEBVTT', '', '00:00:05.000 --> 00:00:09.000', 'Primer segmento', ''].join('\n')

beforeEach(() => {
  mockMediaPlayback()
  vi.stubGlobal('fetch', vi.fn(async () => ({ text: async () => VTT })))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Renderiza `ui` dentro de un formulario cuyo envío se registra (y se cancela). */
const renderInForm = (ui: React.ReactNode) => {
  const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
  render(
    <form data-testid="form" onSubmit={onSubmit}>
      {ui}
    </form>
  )
  return { form: screen.getByTestId('form') as HTMLFormElement, onSubmit }
}

/** Descripción de los <button> del formulario que NO tienen type="button". */
const buttonsWithoutType = (form: HTMLElement) =>
  Array.from(form.querySelectorAll('button'))
    .filter((button) => button.getAttribute('type') !== 'button')
    .map((button) => button.getAttribute('aria-label') ?? button.textContent?.trim() ?? button.className)

const clickEveryButton = (form: HTMLElement) =>
  Array.from(form.querySelectorAll('button')).forEach((button) => fireEvent.click(button))

type Scenario = {
  name: string
  ui: () => React.ReactNode
  /** Deja el componente en el estado en que muestra todos sus botones. */
  prepare?: () => Promise<void> | void
}

const scenarios: Scenario[] = [
  { name: 'Button', ui: () => <Button label="Cancelar" /> },
  {
    name: 'NumberInput (botones de incremento y decremento)',
    ui: () => (
      <NumberInput>
        <NumberInput.Field label="Cantidad" />
        <NumberInput.Stepper>
          <NumberInput.IncrementStepper />
          <NumberInput.DecrementStepper />
        </NumberInput.Stepper>
      </NumberInput>
    ),
  },
  {
    name: 'Accordion',
    ui: () => (
      <Accordion>
        <Accordion.Item id="a">
          <Accordion.Button>Título</Accordion.Button>
          <Accordion.Panel>Contenido</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    ),
  },
  {
    name: 'Tabs',
    ui: () => (
      <Tabs>
        <Tabs.TabList label="Secciones" orientation="horizontal">
          <Tabs.Tab>Uno</Tabs.Tab>
          <Tabs.Tab>Dos</Tabs.Tab>
        </Tabs.TabList>
        <Tabs.TabPanels>
          <Tabs.TabPanel>A</Tabs.TabPanel>
          <Tabs.TabPanel>B</Tabs.TabPanel>
        </Tabs.TabPanels>
      </Tabs>
    ),
  },
  {
    name: 'Pagination (incluidos primera y última página)',
    ui: () => <Pagination count={6} defaultPage={3} onChange={() => {}} showFirstButton showLastButton />,
  },
  {
    name: 'Panel (pestañas y botones anterior/siguiente)',
    ui: () => (
      <Panel>
        <Panel.Nav showPrevButton showNextButton />
        <Panel.Section id="s1">Uno</Panel.Section>
        <Panel.Section id="s2">Dos</Panel.Section>
        <Panel.Button section={1}>
          <button type="button">Ir a la segunda</button>
        </Panel.Button>
      </Panel>
    ),
  },
  {
    name: 'Select',
    ui: () => (
      <Select label="Fruta" name="fruta">
        <Item key="manzana">Manzana</Item>
        <Item key="pera">Pera</Item>
      </Select>
    ),
  },
  { name: 'Audio (barra)', ui: () => <Audio src="/a.mp3" /> },
  { name: 'Audio (botón)', ui: () => <Audio src="/a.mp3" type="button" /> },
  {
    name: 'Interpreter (abierto, con los dos videos)',
    ui: () => <Interpreter />,
    prepare: async () => {
      act(() => {
        document.dispatchEvent(
          new CustomEvent('changeInterpreteVideoSources', {
            detail: { accesibilityURL: '/descriptivo.mp4', contentURL: '/contenido.mp4' },
          })
        )
      })
      await userEvent.click(screen.getByRole('button', { name: 'Intérprete de lenguaje de señas' }))
    },
  },
  {
    name: 'VideoPlayer (con subtítulos, transcripción y audio descriptivo abiertos)',
    ui: () => <VideoPlayer src="/video.mp4" caption={{ src: '/subs.vtt', lang: 'es' }} audio="/ad.mp3" />,
    prepare: async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Audio descriptivo' }))
      await userEvent.click(screen.getByRole('button', { name: 'Transcripción' }))
      await screen.findByRole('button', { name: 'Primer segmento' })
    },
  },
  {
    name: 'DragAndDrop (control de movimiento de cada elemento)',
    ui: () => (
      <DragAndDrop id="dnd">
        <div>
          <DragAndDrop.Container id="origen" label="Origen">
            <DragAndDrop.Drag id="A" label="Opción A">
              Alfa
            </DragAndDrop.Drag>
          </DragAndDrop.Container>
          <DragAndDrop.Drop id="zona" label="Zona" validate={['A']} />
        </div>
      </DragAndDrop>
    ),
  },
]

describe('los botones de la librería no envían el formulario que los contiene', () => {
  // Control: comprueba que el detector sí detecta un <button> sin type; si este test fallara, los
  // demás podrían pasar sin comprobar nada.
  it('control: un <button> sin type SÍ se detecta y SÍ envía el formulario', () => {
    const { form, onSubmit } = renderInForm(<button>Sin type</button>)

    expect(buttonsWithoutType(form)).toEqual(['Sin type'])
    clickEveryButton(form)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  describe.each(scenarios)('$name', ({ ui, prepare }) => {
    it('todos sus botones llevan type="button"', async () => {
      const { form } = renderInForm(ui())
      await prepare?.()

      expect(form.querySelectorAll('button').length).toBeGreaterThan(0)
      expect(buttonsWithoutType(form)).toEqual([])
    })

    it('hacer click en cualquiera de ellos no envía el formulario', async () => {
      const { form, onSubmit } = renderInForm(ui())
      await prepare?.()

      clickEveryButton(form)

      expect(onSubmit).not.toHaveBeenCalled()
    })
  })
})
