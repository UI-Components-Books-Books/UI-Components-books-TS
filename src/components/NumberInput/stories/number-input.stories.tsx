import type { StoryObj, Meta } from "@storybook/react";

import { NumberInput } from "../src/number-input";

const meta = {
    title: 'NumberInput',
    component: NumberInput,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof NumberInput>

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
    args: {
        children: (
            <>
                <NumberInput.Field label="Default NumberInput label" />
                <NumberInput.Stepper>
                    <NumberInput.IncrementStepper />
                    <NumberInput.DecrementStepper />
                </NumberInput.Stepper>
            </>
        )
    },
    render: (args) => <NumberInput {...args}></NumberInput>,
}

export const Controlled: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        ...Default.args,
        max: 10,
        min: 5,
        defaultValue: 5,
        keepWithinRange: true
    },
}

export const CustomIcon: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    args: {
        max: 20,
        min: 1,
        defaultValue: 1,
        keepWithinRange: true,
        children: (
            <>
                <NumberInput.Field label="Default NumberInput label" />
                <NumberInput.Stepper>
                    <NumberInput.IncrementStepper>🙌</NumberInput.IncrementStepper>
                    <NumberInput.DecrementStepper>😥</NumberInput.DecrementStepper>
                </NumberInput.Stepper>
            </>
        )
    },
}