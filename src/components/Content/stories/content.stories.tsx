import type { Meta, StoryObj } from '@storybook/react'

import { Col } from '../../Col';
import { Image } from '../../Image';
import { Row } from '../../Row';
import { Content } from '../src/content';

const meta = {
    title: 'Content',
    component: Content,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Content>;

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
        children: (
            <Row justify-content="center" align-items="center">
                <Col xs="11" mm="10" md="9" lg="4" hd="3">
                    <Image
                        url='https://images.pexels.com/photos/1545346/pexels-photo-1545346.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
                        alt='Autumn season.'
                        title='Photography 1.'
                    />
                </Col>
                <Col xs='11' mm='10' md='9' lg='5' hd='4'>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis porro
                        provident animi veniam ducimus quisquam, alias facilis eos iusto
                        architecto ea recusandae ex exercitationem laboriosam corrupti
                        facere. Obcaecati fugit aspernatur fuga ad, perferendis, repudiandae
                        aut quibusdam pariatur explicabo qui fugiat nobis? Eos cum enim
                        aliquam dignissimos nam facilis rem consequuntur, nulla molestiae
                        dicta excepturi architecto reiciendis blanditiis nobis id incidunt
                        fugit voluptatem consequatur veniam quisquam libero, fugiat
                        voluptate animi quis.
                    </p>
                </Col>
            </Row>
        )
    },
    render: (args) => (
        <Content {...args}></Content>
    ),
}

