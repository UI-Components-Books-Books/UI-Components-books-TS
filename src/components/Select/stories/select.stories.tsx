import type { Meta, StoryObj } from '@storybook/react';
import { Item } from "react-stately"

import { Select } from '../src/select';

const meta = {
    title: 'Select',
    component: Select,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Select>

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
        label: "Hola",
        name: "a",
        placeholder: "Select the correct answer",
    },
    render: (args) => (
        <Select {...args}>
            <Item>I Will see the Buckingham palace.</Item>
            <Item>If you miss the bus?</Item>
            <Item>I Will go to the beach.</Item>
            <Item>If you go to France.</Item>
        </Select>
    ),
}