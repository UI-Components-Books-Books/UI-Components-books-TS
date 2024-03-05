import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../Button'
import { Toggletip } from '../src/toggletip'

const meta = {
    title: 'Toggletip',
    component: Toggletip,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Toggletip>

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
        label: 'Default',
        children: <Button label="default" />
    },
    render: (args) => <Toggletip {...args}></Toggletip>
}

export const WithArrow: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        ...Default.args,
        hasArrow: true
    }
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
        ...Default.args,
        isVisible: true
    }
}
