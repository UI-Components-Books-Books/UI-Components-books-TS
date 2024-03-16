import type { StoryObj, Meta }from '@storybook/react';

import { Pagination } from '../src/pagination';


const meta = {
    title: 'Pagination',
    component: Pagination,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Pagination>

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
        count: 10,
    },
    render: (args)  => <Pagination {...args}></Pagination>
}

export const WithMoreButtons: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        ...Default.args,
        showLastButton: true,
        showFirstButton: true,
    },
}

export const WithIcon: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        ...Default.args,
        renderItem: (item) => (
            <Pagination.Item 
                {...item} 
                icons={{ 
                    previous: <span>👈</span>, 
                    next: <span>👉</span>, 
                }}
            />
        )
    },
}    