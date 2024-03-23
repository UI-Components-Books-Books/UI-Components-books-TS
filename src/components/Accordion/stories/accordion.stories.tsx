import type { Meta, StoryObj } from '@storybook/react'

import { Accordion } from '../src/accordion'
import '../assets/docs.css'

const meta = {
    title: 'Accordion',
    component: Accordion,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>


export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        children: (
            <>
                <Accordion.Item>
                    <Accordion.Button>
                        Accordion 1 title
                    </Accordion.Button>
                    <Accordion.Panel>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione ducimus praesentium quae assumenda cum similique vero? Deserunt quos libero veritatis ab commodi. Aspernatur, dignissimos. Doloribus minima tenetur quos iste porro?
                        </p>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item>
                    <Accordion.Button>
                        Accordion 2 title
                    </Accordion.Button>
                    <Accordion.Panel>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione ducimus praesentium quae assumenda cum similique vero? Deserunt quos libero veritatis ab commodi. Aspernatur, dignissimos. Doloribus minima tenetur quos iste porro?
                        </p>
                    </Accordion.Panel>
                </Accordion.Item>
            </>
        )
    },
    render: (args) => (
        <Accordion {...args}></Accordion>
    )
}

export const MultipleAccordionsOpen: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        allowMultiple: true,
        ...Default.args
    }
}

export const WithCustomButtonIcons: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Hola'
            }
        }
    },
    args: {
        children: (
            <Accordion.Item>
                <Accordion.Button expandedIcon={'👇'} closedIcon={'👆'}>
                    Accordion 1 title
                </Accordion.Button>
                <Accordion.Panel>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione ducimus praesentium quae assumenda cum similique vero? Deserunt quos libero veritatis ab commodi. Aspernatur, dignissimos. Doloribus minima tenetur quos iste porro?
                    </p>
                </Accordion.Panel>
            </Accordion.Item>
        )
    },
    render: (args) => (
        <Accordion {...args}></Accordion>
    ),
}

export const ButtonStyling: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Hola'
            }
        }
    },
    args: {
        children: (
            <Accordion.Item>
                <Accordion.Button addClass='accordion__button--active'>
                    Accordion 1 title
                </Accordion.Button>
                <Accordion.Panel>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione ducimus praesentium quae assumenda cum similique vero? Deserunt quos libero veritatis ab commodi. Aspernatur, dignissimos. Doloribus minima tenetur quos iste porro?
                    </p>
                </Accordion.Panel>
            </Accordion.Item>
        )
    },
    render: (args) => (
        <Accordion {...args}></Accordion>
    ),
}