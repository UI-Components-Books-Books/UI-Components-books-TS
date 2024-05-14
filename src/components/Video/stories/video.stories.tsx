import { StoryObj, Meta } from "@storybook/react";

import { VideoPlayer } from "../src";


const meta = {
    title: 'Video player',
    component: VideoPlayer,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof VideoPlayer>

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
        src: "https://demos.booksandbooksdigital.com.co/120-ovas/ova-98/assets/videos/slide3-1.mp4",
        poster: "https://demos.booksandbooksdigital.com.co/120-ovas/ova-98/assets/images/poster.webp",
        caption: {
            src: "/slide3-1.vtt",
            lang: 'es'
        },
        audio: "/slide3-1-description.mp3"
    },
    render: (args) => <VideoPlayer {...args} />
}
