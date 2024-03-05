import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../Button";
import { Popover } from "../src/popover";

const meta = {
    title: 'Popover',
    component: Popover,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Popover>

export default meta
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
                <Popover.Button>
                    <Button>Open popover</Button>
                </Popover.Button>
                <Popover.Content>
                    <p style={{ marginBlock: '2rem' }}>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis,
                        ipsam!
                    </p>
                    <Button>Learn more</Button>
                </Popover.Content>
            </>
        )
    },
    render: (args) => <Popover {...args}></Popover>
}

export const DisabledInteractionOutside: Story = {
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
                <Popover.Button>
                    <Button>Open popover</Button>
                </Popover.Button>
                <Popover.Content disabledInteractOutside>
                    <p style={{ marginBlock: '2rem' }}>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis,
                        ipsam!
                    </p>
                    <Button>Learn more</Button>
                </Popover.Content>
            </>
        )
    },
}

export const HasArrow: Story = {
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
                <Popover.Button>
                    <Button>Open popover</Button>
                </Popover.Button>
                <Popover.Content hasArrow>
                    <p style={{ marginBlock: '2rem' }}>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis,
                        ipsam!
                    </p>
                    <Button>Learn more</Button>
                </Popover.Content>
            </>
        )
    },
}