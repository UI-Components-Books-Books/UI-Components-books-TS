import type { Meta, StoryObj } from '@storybook/react'

import { Kbd } from '../src/kbd';
import '../assets/docs.css'

const meta = {
    title: 'Kbd',
    component: Kbd,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Kbd>

export default meta
type Story = StoryObj<typeof meta>


export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "El `kbd` existe para mostrar qué tecla o combinación de teclas realiza una acción determinada. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo."
            }
        }
    },
    args: {
        children: ['Ctrl']
    },
    render: (args) => <Kbd {...args} />
}

export const KbdStyling: Story = {
    parameters: {
        docs: {
            description: {
                story: "Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Además, también contamos con CSS custom properties, puedes usar `--kbd-bg-color`, `--kbd-border-radious` y `--kbd-color`. Puedes especificar estas variables en una clase personalizada de CSS." 
            }
        } 
    },
    args: {
        children: ['Shift'],
        addClass: 'kbd-story'
    },
}