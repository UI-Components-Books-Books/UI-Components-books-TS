import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../Button'
import { Modal } from '../src/modal'

const meta = {
    title: 'Modal',
    component: ModalWithHooks,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof ModalWithHooks>

export default meta
type Story = StoryObj<typeof meta>


function ModalWithHooks() {
    const [isOpen, setIsOpen] = useState(false)

    const toggleModal = () => {
        setIsOpen(!isOpen)
    }

    return (
        <>
            <Button addClass='js-button' onClick={toggleModal}>open</Button>
            <Modal isOpen={isOpen} onClose={toggleModal} finalFocusRef=".js-button">
                <Modal.Overlay />
                <Modal.Content>
                    <p>Hola</p>
                    <button>Modal</button>
                    <Modal.CloseButton />
                </Modal.Content>
            </Modal>
        </>
    )
}

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "Description to a button test component"
            }
        }
    },
    render: () => <ModalWithHooks />
}