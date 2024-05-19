import type { Meta, StoryObj } from '@storybook/react'

import { Icon } from '../../Icon';
import { Button } from '../src/button'


const meta = {
    title: "Button",
    component: Button,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Button>;


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
    argTypes: {
        size: {
            options: ['small', 'normal', 'big'],
            control: { type: 'radio' }
        },
        variant: {
            options: ['primary', 'secondary', 'no-line'],
            control: { type: 'radio' }
        },
        hasAriaLabel: {
            options: [true, false],
            control: { type: 'boolean' }
        },
        disabled: {
            options: [true, false],
            control: { type: 'boolean' }
        }
    },
    args: {
        children: ['button']
    },
    render: (args) => <Button {...args}></Button>,
}


export const WithIcon: Story = {
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
        hasAriaLabel: true,
        hasIcon: true,
        children: [
           <Icon>
             <svg xmlns="http://www.w3.org/2000/svg" height="80" viewBox="0 -960 960 960" width="80"><path d="m354-247 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-80l65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Zm247-350Z" /></svg>
           </Icon>
        ]
    },
    render: (args) => <Button {...args}></Button>,
}



