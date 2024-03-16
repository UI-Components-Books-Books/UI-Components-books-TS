import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../Button'
import { Col } from '../../Col'
import { Row } from '../../Row'
import { Tour } from '../src/tour'

const meta = {
    title: 'Tour',
    component: TourWithHooks,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof TourWithHooks>

export default meta
type Story = StoryObj<typeof meta>

function TourWithHooks() {
    const [isOpen, setIsOpen] = useState(false)

    const toggleModal = () => {
        setIsOpen(!isOpen)
    }

    const steps = [
        {
            target: '.paragraph',
            content: 'Paragraph'
        },
        {
            target: '.download',
            content: 'Download button'
        },
        {
            target: '.next',
            content: 'Next button'
        }
    ]

    return (
        <>
            <>
                <Tour
                    steps={steps}
                    isOpen={isOpen}
                    onClose={toggleModal}
                    finalFocusRef=".start"
                >
                    <Tour.Layer />
                    <Tour.Modal />
                </Tour>

                <Col xs='11' mm='10' md='9' hd='8' lg='7'>
                    <Button
                        label='Start tour'
                        addClass='start'
                        onClick={() => setIsOpen(!isOpen)}
                    />
                </Col>

                <Col xs='11' mm='10' md='9' hd='8' lg='7'>

                    <p className='paragraph u-my-4'>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus soluta
                        minima neque saepe architecto cupiditate impedit mollitia nesciunt
                        similique accusantium tempora id enim, placeat omnis in, facere sit
                        quasi quisquam doloremque nisi officiis tempore porro temporibus
                        voluptatibus? Minus delectus pariatur porro officia deserunt,
                        voluptatum totam impedit? Rem recusandae sed ad? Molestias, distinctio
                        explicabo. Tenetur quis facere recusandae excepturi reiciendis soluta,
                        odio nobis itaque fugit adipisci ut officia corporis eligendi harum.
                        Minima in quasi doloribus reiciendis alias, beatae molestiae omnis
                        dolores impedit expedita magnam cupiditate quas velit.
                    </p>

                </Col>

                <Col xs='11' mm='10' md='9' hd='8' lg='7'>
                    <Row justify-content='space-evenly'>
                        <Button addClass='download' label='Download' />
                        <Button addClass='next' label='Next' />
                    </Row>
                </Col>
            </>
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
    render: () => <TourWithHooks />
}