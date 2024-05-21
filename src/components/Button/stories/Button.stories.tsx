import type { Meta, StoryObj } from '@storybook/react'

import { Icon } from '../../Icon';
import { Button } from '../src/button'


const meta = {
    title: "Button",
    component: Button,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Button>;


export default meta;
type Story = StoryObj<typeof meta>;


export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "Componente `Button`: sencillo, fácil de personalizar y accesible."
            }
        }
    },
    argTypes: {
        size: {
            options: ['small', 'normal', 'big'],
            control: { type: 'radio' }
        },
        variant: {
            options: ['primary', 'secondary', 'no-line'],
            control: { type: 'radio' }
        },
        hasAriaLabel: {
            options: [true, false],
            control: { type: 'boolean' }
        },
        disabled: {
            options: [true, false],
            control: { type: 'boolean' }
        }
    },
    args: {
        children: ['button']
    },
    render: (args) => <Button {...args}></Button>,
}


export const DifferentSize: Story = {
    parameters: {
        docs: {
            description: {
                story: "La propiedad `size` nos permite modificar el tamaño del componente. Podemos usar los valores `small`, `normal` y `big` para ajustar el tamaño según nuestras necesidades específicas."
            }
        }
    },
    argTypes: {
        ...Default.argTypes
    },
    args: {
        label: 'small, normal and big',
        size: 'big'
    }
}

export const Variant: Story = {
    parameters: {
        docs: {
            description: {
               story: "Por defecto, el componente tiene el diseño de la propiedad `variant='primary'`, pero puedes usar diferentes tipos como `secondary` y `no-line` para cambiar el diseño del botón."
            }
        }
    },
    argTypes: {
        ...Default.argTypes
    },
    args: {
        label: 'variant',
        variant: 'secondary'
    }
}


export const WithAriaLabel: Story = {
    parameters: {
        docs: {
            description: {
                story: "Para el tema de accesibilidad (a11y), incluimos la propiedad `hasAriaLabel`. El uso de esta propiedad se ilustra en el ejemplo que aparece en la parte inferior. En el caso de un botón que no tiene una etiqueta ni un contenido claro, el lector de pantalla no podrá informar adecuadamente al usuario. Por esta razón, la propiedad `hasAriaLabel` agrega la propiedad `aria-label`. Es importante que la propiedad `label` esté presente, ya que su contenido se utilizará en la propiedad `aria-label`."
            }
        }
    },
    argTypes: {
        ...Default.argTypes
    },
    args: {
        hasAriaLabel: true,
        label: 'Destacar información',
        children: [
           <Icon>
             <svg xmlns="http://www.w3.org/2000/svg" height="80" viewBox="0 -960 960 960" width="80"><path d="m354-247 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-80l65-281L80-550l288-25 112-265 112 265 288 25-218 189 65 281-247-149L233-80Zm247-350Z" /></svg>
           </Icon>
        ]
    },
    render: (args) => <Button {...args}></Button>,
}



