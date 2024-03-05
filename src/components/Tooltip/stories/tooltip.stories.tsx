import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../Button'
import { Tooltip } from '../src/tooltip'

const meta = {
    title: 'Tooltip',
    component: Tooltip,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Tooltip>

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
    render: (args) => <Tooltip {...args}></Tooltip>
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
