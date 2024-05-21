import type { Meta, StoryObj } from '@storybook/react'

import { CheckBox } from '../src/checkbox';
import '../assets/docs.css'

const meta = {
    title: 'CheckBox',
    component: CheckBox,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof CheckBox>;

export default meta;
type Story = StoryObj<typeof meta>


export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: "El componente `Checkbox` es un elemento personalizado que permite manejar diferentes estados en su interior. Es especialmente útil en formularios cuando el usuario necesita seleccionar múltiples valores de distintas opciones disponibles. Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo."
            }
        }
    },
    argTypes: {
        state: {
            options: ['normal', 'right', 'wrong'],
            control: { type: 'radio' }
        }
    },
    args: {
        label: 'Default checkbox label'
    },
    render: (args) => (
        <CheckBox {...args}></CheckBox>
    ),
}

export const States: Story = {
    parameters: {
        docs: {
            description: {
                story: "Utilizando la propiedad `state`, se pueden manejar los múltiples estados del componente, tales como: `normal`, `right`, y `wrong`. Estos dos últimos muestran un ícono SVG dentro del componente."
            }
        }
    },
    argTypes: {
        ...Default.argTypes,
    },
    args: {
        label: "Right state ✔",
        state: 'right'
    }
}

export const Checked: Story = {
    parameters: {
        docs: {
            description: {
                story: "Al igual que en el estándar de HTML, podemos utilizar la propiedad nativa `defaultChecked` para que nuestro checkbox esté 'seleccionado' por defecto."
            }
        }
    },
    argTypes: {
        ...Default.argTypes
    },
    args: {
      ...Default.args,
      label: 'Default checked',
      defaultChecked: true
    }
}

export const CheckBoxStyling: Story = {
    parameters: {
        docs: {
            description: {
                story: "Si necesitas personalizar totalmente la apariencia del componente, puedes pasarle tus clases personalizadas de CSS a través de la propiedad `addClass`. Además, también contamos con CSS custom properties, que puedes usar: `--input-check-bg`, `--input-check-clr`, `--input-check-border-clr` y `--input-check-border-radius`. Puedes especificar estas variables en una clase personalizada de CSS. Por otra parte, para manejar los estilos dependiendo de los diferentes estados, puedes utilizar el atributo `data-state` presente en el componente. Haz clic en Show code en la parte inferior para ver y utilizar este ejemplo."
            }
        }
    },
    argTypes: {
        ...Default.argTypes
    },
    args: {
      ...Default.args,
      label: 'Change styles',
      addClass: 'checkbox-example',
      state: 'wrong',
      defaultChecked: true
    }
}