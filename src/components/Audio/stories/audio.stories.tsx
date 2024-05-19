import type { Meta, StoryObj } from "@storybook/react";


import { Audio } from "../src/audio";


const meta = {
    title: 'Audio',
    component: Audio,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Audio>


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
            options: ['small'],
            control: { type: 'check'}
        },
        type: {
            options: ['bar', 'button'],
            control: { type: 'radio'}
        }
    },
    args: {
        src: 'https://mdn.github.io/learning-area/accessibility/multimedia/viper.mp3'
    },
    render: (args) => (
        <Audio {...args}></Audio>
    ),
}

export const ButtonType: Story = {
    parameters: {
        docs: {
            description: {
                story: 'test'
            }
        }
    },
    ...Default.argTypes,
    args: {
        ...Default.args,
        type: 'button'
    },
    render: (args) => (
        <Audio {...args}></Audio>
    ),
}