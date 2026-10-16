import type { ReactElement } from 'react'

import { Item } from 'react-stately'

import {
  Accordion,
  Audio,
  Button,
  CheckBox,
  Col,
  DragAndDrop,
  Filter,
  Icon,
  Image,
  Interpreter,
  Kbd,
  Modal,
  NumberInput,
  Pagination,
  Panel,
  Popover,
  Portal,
  Radio,
  Row,
  Select,
  Switch,
  Tabs,
  Toggletip,
  Tooltip,
  Tour,
  VideoPlayer,
} from '../index'

/**
 * Un caso por cada componente de la librería (y sus variantes que cambian lo que renderiza),
 * compartidos por el test de renderizado en el servidor y el de hidratación.
 */

const noop = () => {}

export const ssrCases: Array<[string, ReactElement]> = [
  ['Button', <Button label="Hola" />],
  ['Icon', <Icon><svg /></Icon>],
  ['Kbd', <Kbd>K</Kbd>],
  ['Row y Col', <Row><Col sm="6">a</Col></Row>],
  ['Image', <Image src="/a.png" alt="x" />],
  ['Filter', <Filter />],
  ['CheckBox', <CheckBox label="a" />],
  ['Radio', <Radio label="a" name="g" />],
  ['Switch', <Switch label="a" />],
  [
    'NumberInput',
    <NumberInput>
      <NumberInput.Field label="n" />
      <NumberInput.Stepper>
        <NumberInput.IncrementStepper />
        <NumberInput.DecrementStepper />
      </NumberInput.Stepper>
    </NumberInput>,
  ],
  [
    'Select',
    <Select label="f" name="f">
      <Item key="a">A</Item>
      <Item key="b">B</Item>
    </Select>,
  ],
  ['Pagination', <Pagination count={5} onChange={noop} />],
  [
    'Accordion',
    <Accordion>
      <Accordion.Item id="a">
        <Accordion.Button>T</Accordion.Button>
        <Accordion.Panel>P</Accordion.Panel>
      </Accordion.Item>
    </Accordion>,
  ],
  [
    'Tabs',
    <Tabs>
      <Tabs.TabList label="T" orientation="horizontal">
        <Tabs.Tab>A</Tabs.Tab>
      </Tabs.TabList>
      <Tabs.TabPanels>
        <Tabs.TabPanel>a</Tabs.TabPanel>
      </Tabs.TabPanels>
    </Tabs>,
  ],
  [
    'Panel',
    <Panel>
      <Panel.Nav />
      <Panel.Section id="s1">uno</Panel.Section>
    </Panel>,
  ],
  ['Audio en barra', <Audio src="/a.mp3" />],
  ['Audio en botón', <Audio src="/a.mp3" type="button" />],
  [
    'VideoPlayer',
    <VideoPlayer src="/v.mp4" caption={{ src: '/s.vtt', lang: 'es' }} audio="/ad.mp3" />,
  ],
  ['Interpreter', <Interpreter />],
  [
    'DragAndDrop',
    <DragAndDrop id="d">
      <div>
        <DragAndDrop.Container id="c" label="C">
          <DragAndDrop.Drag id="A" label="A">a</DragAndDrop.Drag>
        </DragAndDrop.Container>
        <DragAndDrop.Drop id="z" label="Z" validate={['A']} />
      </div>
    </DragAndDrop>,
  ],
  ['Portal', <Portal id="p"><p>portal</p></Portal>],
  [
    'Modal cerrado',
    <Modal isOpen={false} onClose={noop}><Modal.Content><p>x</p></Modal.Content></Modal>,
  ],
  [
    'Modal abierto',
    <Modal isOpen onClose={noop}><Modal.Content><p>x</p></Modal.Content></Modal>,
  ],
  ['Tooltip', <Tooltip label="Ayuda" id="t"><button>b</button></Tooltip>],
  ['Toggletip', <Toggletip label="Info" id="t"><button>b</button></Toggletip>],
  [
    'Popover',
    <Popover>
      <div>
        <Popover.Button><button>p</button></Popover.Button>
        <Popover.Content id="p">c</Popover.Content>
      </div>
    </Popover>,
  ],
  [
    'Tour cerrado',
    <Tour steps={[]} isOpen={false} onClose={noop} finalFocusRef="#a"><Tour.Modal /></Tour>,
  ],
  [
    'Tour abierto',
    <Tour steps={[{ target: '#a', content: 'x' }]} isOpen onClose={noop} finalFocusRef="#a">
      <Tour.Layer />
      <Tour.Modal />
    </Tour>,
  ],
]
