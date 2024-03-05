import type { Meta, StoryObj } from '@storybook/react';

import { Image } from '../src/image';


const meta = {
    title: 'Image',
    component: Image,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Image>

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
        noCaption: {
            options: [true, false],
            control: { type: 'boolean' }
        }
    },
    args: {
        size: '350px'
    },
    render: (args) => <Image {...args} />
}

export const WithCaption: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    ...Default.argTypes,
    args: {
        ...Default.args,
        url: "https://images.pexels.com/photos/1545346/pexels-photo-1545346.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        alt: 'Autumn season.',
        title: 'Photography 1.'
    }
}


export const WithOtherSize: Story = {
    parameters: {
        docs: {
            descriptions: {
                story: "Descripticion to a image"
            }
        }
    },
    args: {
        url: 'https://images.unsplash.com/photo-1604223190546-a43e4c7f29d7?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW91bnRhaW4lMjBsYW5kc2NhcGV8ZW58MHx8MHx8fDA%3D',
        size: '80vw'
    }
}
