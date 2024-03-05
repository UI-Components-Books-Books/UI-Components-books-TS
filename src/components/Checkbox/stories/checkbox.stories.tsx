import type { Meta, StoryObj } from '@storybook/react'

import { CheckBox } from '../src/checkbox';

const meta = {
    title: 'CheckBox',
    component: CheckBox,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof CheckBox>;

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
    argTypes: {
        state: {
            options: ['normal', 'right', 'wrong'],
            control: { type: 'radio' }
        }
    },
    args: {
        label: 'Default checkbox label'
    },
    render: (args) => (
        <CheckBox {...args}></CheckBox>
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
