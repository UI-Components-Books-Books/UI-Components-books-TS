import type { Meta, StoryObj } from '@storybook/react'

import css from '../assets/docs.module.css'
import { Tabs } from '../src/tabs'

const meta = {
    title: 'Tabs',
    component: Tabs,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Tabs>

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
        defaultIndex: 1,
        children: (
            <>
                <Tabs.TabList label='testing' orientation='horizontal' >
                    <Tabs.Tab>One</Tabs.Tab>
                    <Tabs.Tab>Two</Tabs.Tab>
                    <Tabs.Tab>Three</Tabs.Tab>
                </Tabs.TabList>
                <Tabs.TabPanels>
                    <Tabs.TabPanel>First panel 1️⃣</Tabs.TabPanel>
                    <Tabs.TabPanel>Second panel 2️⃣</Tabs.TabPanel>
                    <Tabs.TabPanel>Third panel 3️⃣</Tabs.TabPanel>
                </Tabs.TabPanels>
            </>
        )
    },
    render: (args) => (
        <Tabs {...args}></Tabs>
    )
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
        children: (
            <>
                <Tabs.TabList label='testing' orientation='horizontal' >
                    <Tabs.Tab icon={(isSelected) => isSelected ? '🥳' : '😥' }>One</Tabs.Tab>
                    <Tabs.Tab>Two</Tabs.Tab>
                </Tabs.TabList>
                <Tabs.TabPanels>
                    <Tabs.TabPanel>First panel 1️⃣</Tabs.TabPanel>
                    <Tabs.TabPanel>Second panel 2️⃣</Tabs.TabPanel>
                </Tabs.TabPanels>
            </>
        )
    }
}

export const StylingSelected: Story = {
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
                <Tabs.TabList label='testing' orientation='horizontal' >
                    <Tabs.Tab selected={css['tab--selected']}>One</Tabs.Tab>
                    <Tabs.Tab>Two</Tabs.Tab>
                </Tabs.TabList>
                <Tabs.TabPanels>
                    <Tabs.TabPanel>First panel 1️⃣</Tabs.TabPanel>
                    <Tabs.TabPanel>Second panel 2️⃣</Tabs.TabPanel>
                </Tabs.TabPanels>
            </>
        )
    }
}