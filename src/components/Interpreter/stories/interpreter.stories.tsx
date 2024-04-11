import type { StoryObj, Meta } from "@storybook/react";

import { Interpreter } from "../src/interpreter";

const meta = {
    title: 'Interpreter',
    component: Interpreter,

    tags: ['autodocs']
} satisfies Meta<typeof Interpreter>

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
        accesibilityURL: "https://demos.booksandbooksdigital.com.co/120-ovas/ova-98/assets/videos/interprete/vid_int_ova-98_sld-1-contents.mp4",
        contentURL: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
    },
    render: (args) => <Interpreter {...args}/>
}