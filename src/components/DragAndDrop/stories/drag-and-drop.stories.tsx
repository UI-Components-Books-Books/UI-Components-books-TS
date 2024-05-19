import type { StoryObj, Meta } from "@storybook/react";

import { Col } from "../../Col";
import { Row } from "../../Row";
import { DragAndDrop } from "../src/drag-and-drop";

import '../assets/docs.css'

const meta = {
    title: 'DragAndDrop',
    component: DragAndDrop,

} satisfies Meta<typeof DragAndDrop>

export default meta;
type Story = StoryObj<typeof meta>;


export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        id: 'default-drag',
        children: (
            <Row justify-content="center" align-items="center">
                <Col xs='11' mm='10' md='9' lg='5' hd='4' >
                    <DragAndDrop.Container id="general-1" label="container" addClass="drop-story">
                        <DragAndDrop.Drag id='A' label='Draggable item' addClass="drag-story" dragging="drag-story--active" >
                            Draggable
                        </DragAndDrop.Drag>
                        <DragAndDrop.Drag id='B' label='Draggable item' addClass="drag-story" dragging="drag-story--active" >
                            Draggable 2
                        </DragAndDrop.Drag>
                    </DragAndDrop.Container>
                </Col>
                <Col xs='11' mm='10' md='9' lg='5' hd='4'>
                    <DragAndDrop.Drop id='droppable' validate={['A']} label='droppable' addClass="drop-story">
                        <p>Droppable</p>
                    </DragAndDrop.Drop>
                </Col>
            </Row>
        )
    },
    render: (args) => <DragAndDrop {...args}></DragAndDrop>
}


export const MultipleDropContainers: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        id: 'default-drag',
        children: (
            <Row justify-content="center" align-items="center">
                <Col xs='11' mm='10' md='9' lg='5' hd='4' >
                    <DragAndDrop.Container id="general-1" label="container" addClass="drop-story">
                        <DragAndDrop.Drag id='A' label='Draggable item' addClass="drag-story" dragging="drag-story--active" >
                            Draggable
                        </DragAndDrop.Drag>
                    </DragAndDrop.Container>
                </Col>
                <Col md="12">
                    <Row justify-content="center" align-items="center">
                        <Col xs='11' mm='10' md='9' lg='5' hd='4'>
                            <DragAndDrop.Drop id='droppable' validate={['A']} label='droppable' addClass="drop-story">
                                <p>Droppable</p>
                            </DragAndDrop.Drop>
                        </Col>
                        <Col xs='11' mm='10' md='9' lg='5' hd='4'>
                            <DragAndDrop.Drop id='droppable-2' validate={['A']} label='droppable' addClass="drop-story">
                                <p>Droppable</p>
                            </DragAndDrop.Drop>
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    },
}

export const MultipleDrags: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        ...Default.args,
        multipleDrags: true,
    },
}
