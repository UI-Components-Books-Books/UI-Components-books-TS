import type { StoryObj, Meta } from "@storybook/react";

import { Switch } from "../src/switch";


const meta = {
    title: 'Switch',
    component: Switch,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Switch>

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
        size: {
            options: ['sm' ,'md' ,'lg'],
            control: { type: 'radio' }
        }
    },
    args: {
        id: 'switch',
        label: 'Default switch label'
    },
    render: (args) => (
        <Switch {...args}></Switch>
    ),
}

export const IsDisabled: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        id: 'switch',
        label: 'Default switch label',
        disabled: true
    },
    render: (args) => (
        <Switch {...args}></Switch>
    ),
}


