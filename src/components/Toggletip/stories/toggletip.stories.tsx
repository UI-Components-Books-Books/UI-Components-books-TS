import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../../Button'
import { Toggletip } from '../src/toggletip'

const meta = {
    title: 'Toggletip',
    component: Toggletip,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Toggletip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "El componente `Toggletip` es una pequeña burbuja de información que aclara el propósito de controles o herramientas que de otro modo serían ambiguos. Utilizando el motor de posicionamiento `popper.js`, permite colocarlo en cualquiera de los 4 ejes cardinales. Además, está diseñado con todos los criterios de accesibilidad necesarios para el manejo de este tipo de elementos. Para su implementación, solo necesitas importar el componente `<Toggletip />`. Haz clic en Show code en la parte inferior para ver y utilizar este ejemplo."
            }
        }
    },
    args: {
        label: 'Default',
        children: <Button label="default" />
    },
    render: (args) => <Toggletip {...args}></Toggletip>
}

export const HasArrow: Story = {
    parameters: {
        docs: {
            description: {
                story: "Con la propiedad `hasArrow` podemos agregar una flecha a nuestro componente."
            }
        }
    },
    args: {
        ...Default.args,
        hasArrow: true
    }
}


export const DisabledInteractionOutside: Story = {
    parameters: {
        docs: {
            description: {
                story: "Utilizando la propiedad `disabledInteractOutside`, podemos deshabilitar la funcionalidad que cierra este si se interactúa afuera del contenido del componente."
            }
        }
    },
    args: {
        ...Default.args,
        disabledInteractOutside: true
    }
}

export const Placement: Story = {
    parameters: {
        docs: {
            description: {
                story: "Por defecto, el componente se ubica automáticamente en la posición que permita visualizar correctamente su contenido. Sin embargo, si necesitas que esté en una posición específica, puedes usar la propiedad `placement`."
            }
        }
    },
    args: {
        ...Default.args,
       placement: 'top-start'
    },
}

export const Distance: Story = {
    parameters: {
        docs: {
            description: {
                story: "Utilizando la propiedad `distance`, podemos modificar la distancia entre nuestro `Button` y el `<Toggletip/>`."
            }
        }
    },
    args: {
        ...Default.args,
       distance: 50
    },
}