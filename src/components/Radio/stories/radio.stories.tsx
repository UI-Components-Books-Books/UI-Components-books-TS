import type { Meta , StoryObj } from "@storybook/react";

import { Radio } from "../src/radio";

const meta = {
    title: 'Radio',
    component: Radio,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Radio>

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
    argTypes: {
        state: {
            options: ['right', 'wrong'],
            control: { type: 'radio' }
        }
    },
    args: {
        label: 'Default radio label'
    },
    render: (args) => (
        <Radio {...args}></Radio>
    ),
}

export const Checked: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    argTypes: {
        ...Default.argTypes
    },
    args: {
      ...Default.args,
      defaultChecked: true
    }
}