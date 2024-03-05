import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../Button";
import { Panel } from "../src/panel"


const meta = {
    title: 'Panel',
    component: Panel,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Panel>

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
        children: [
            <>
                <Panel.Nav />
                <Panel.Section>
                    First section
                </Panel.Section>
                <Panel.Section>
                    Second section
                </Panel.Section>
                <Panel.Section>
                    Third section
                </Panel.Section>
                <Panel.Section>
                    Fourth section
                </Panel.Section>
            </>
        ]
    },
    render: (args) => <Panel {...args}></Panel>
}

export const WithNavigationButtons: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Kill'
            }
        }
    },
    args: {
        children: [
            <>
                <Panel.Nav showNextButton showPrevButton />
                <Panel.Section>
                    First section
                </Panel.Section>
                <Panel.Section>
                    Second section
                </Panel.Section>
                <Panel.Section>
                    Third section
                </Panel.Section>
                <Panel.Section>
                    Fourth section
                </Panel.Section>
            </>
        ]
    }
}

export const WithADefaultIndex: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Kill'
            }
        }
    },
    args: {
        defaultIndex: 3,
        children: [
            <>
                <Panel.Nav />
                <Panel.Section>
                    First section
                </Panel.Section>
                <Panel.Section>
                    Second section
                </Panel.Section>
                <Panel.Section>
                    Third section
                </Panel.Section>
                <Panel.Section>
                    Fourth section
                </Panel.Section>
            </>
        ]
    }
}

export const ButtonToNavigateBetweenSections: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Kill'
            }
        }
    },
    args: {
        children: [
            <>
                <Panel.Nav />
                <Panel.Section>
                    First section
                    <Panel.Button section={1}>
                        <Button>Go to the second section 👉</Button>
                    </Panel.Button>
                </Panel.Section>
                <Panel.Section>
                    Second section
                    <Panel.Button section={0}>
                        <Button>Go to the first section 👈</Button>
                    </Panel.Button>
                </Panel.Section>
            </>
        ]
    }
}