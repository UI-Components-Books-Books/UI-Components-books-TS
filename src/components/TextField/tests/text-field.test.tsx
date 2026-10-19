import { createRef, useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { TextField } from '../index'

const input = () => screen.getByRole('textbox') as HTMLInputElement
const wrapper = () => input().closest('.c-text-field') as HTMLElement

describe('TextField', () => {
  describe('estructura y etiqueta', () => {
    it('renderiza un campo de texto asociado a su etiqueta', () => {
      render(<TextField label="Nombre" />)

      const field = screen.getByLabelText('Nombre')
      expect(field).toBe(input())
      expect(field).toHaveAttribute('type', 'text')
    })

    it.each(['email', 'tel', 'url', 'search', 'password'] as const)('acepta el tipo %s', (type) => {
      render(<TextField label="Campo" type={type} />)

      expect(screen.getByLabelText('Campo')).toHaveAttribute('type', type)
    })

    it('muestra la etiqueta por defecto', () => {
      render(<TextField label="Nombre" />)

      expect(screen.getByText('Nombre')).not.toHaveClass('u-sr-only')
    })

    it('con isLabelVisible en false la oculta pero sigue dando el nombre accesible', () => {
      render(<TextField label="Nombre" isLabelVisible={false} />)

      expect(screen.getByText('Nombre')).toHaveClass('u-sr-only')
      expect(screen.getByRole('textbox', { name: 'Nombre' })).toBeInTheDocument()
    })

    it('usa el id recibido y deriva de él los de la ayuda, el error y el resultado', () => {
      render(<TextField label="Nombre" id="nombre" hint="Ayuda" error="Error" state="wrong" />)

      expect(input()).toHaveAttribute('id', 'nombre')
      expect(screen.getByText('Nombre')).toHaveAttribute('for', 'nombre')
      expect(screen.getByText('Ayuda')).toHaveAttribute('id', 'nombre-hint')
      expect(screen.getByText('Error')).toHaveAttribute('id', 'nombre-error')
      expect(screen.getByText('Incorrecto')).toHaveAttribute('id', 'nombre-state')
    })

    it('con varios campos sin id ningún id se repite', () => {
      render(
        <>
          <TextField label="Uno" hint="a" error="b" state="right" />
          <TextField label="Dos" hint="a" error="b" state="wrong" />
        </>
      )

      const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id)
      expect(ids.length).toBeGreaterThan(2)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('la etiqueta es texto: no interpreta HTML', () => {
      render(<TextField label="<b>hola</b>" />)

      expect(screen.getByText('<b>hola</b>')).toBeInTheDocument()
      expect(document.querySelector('label b')).toBeNull()
    })

    it('acepta JSX como etiqueta', () => {
      render(<TextField label={<>Nombre <strong>completo</strong></>} />)

      expect(screen.getByRole('textbox', { name: 'Nombre completo' })).toBeInTheDocument()
    })
  })

  describe('ayuda', () => {
    it('la enlaza con aria-describedby', () => {
      render(<TextField label="Nombre" hint="Escribe tu nombre" />)

      expect(input()).toHaveAccessibleDescription('Escribe tu nombre')
    })

    it('sin ayuda, error ni resultado no hay aria-describedby', () => {
      render(<TextField label="Nombre" />)

      expect(input()).not.toHaveAttribute('aria-describedby')
    })
  })

  describe('error', () => {
    it('marca el campo como inválido y enlaza el mensaje', () => {
      render(<TextField label="Correo" error="Falta la arroba" />)

      expect(input()).toHaveAttribute('aria-invalid', 'true')
      expect(input()).toHaveAccessibleDescription('Falta la arroba')
      expect(screen.getByText('Falta la arroba')).toBeVisible()
    })

    it('al quitar el error el campo deja de ser inválido y desaparece el mensaje', () => {
      const { rerender } = render(<TextField label="Correo" error="Falta la arroba" />)

      rerender(<TextField label="Correo" />)

      expect(input()).not.toHaveAttribute('aria-invalid')
      expect(input()).not.toHaveAttribute('aria-describedby')
      expect(screen.queryByText('Falta la arroba')).not.toBeInTheDocument()
    })

    it('la ayuda se lee antes que el error', () => {
      render(<TextField label="Correo" hint="Usa el de tu institución" error="Falta la arroba" />)

      expect(input()).toHaveAccessibleDescription('Usa el de tu institución Falta la arroba')
    })

    it.each([['texto vacío', ''], ['false', false], ['null', null]])('un error %s no cuenta', (_name, error) => {
      render(<TextField label="Correo" error={error} />)

      expect(input()).not.toHaveAttribute('aria-invalid')
      expect(wrapper()).toHaveAttribute('data-state', 'normal')
    })
  })

  describe('obligatorio', () => {
    it('marca el campo como obligatorio y añade un marcador que el lector no repite', () => {
      render(<TextField label="Nombre" required />)

      expect(input()).toBeRequired()
      const marker = screen.getByText('*')
      expect(marker).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByRole('textbox', { name: 'Nombre' })).toBeInTheDocument()
    })

    it('sin required no hay marcador', () => {
      render(<TextField label="Nombre" />)

      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })
  })

  describe('resultado de actividad', () => {
    it('normal: sin icono, sin texto de resultado y sin descripción', () => {
      render(<TextField label="Respuesta" />)

      expect(wrapper()).toHaveAttribute('data-state', 'normal')
      expect(wrapper().querySelector('.c-text-field__icon')).toBeNull()
      expect(input()).not.toHaveAttribute('aria-describedby')
    })

    it('right: se lee «Correcto», no es inválido y muestra el icono', () => {
      render(<TextField label="Respuesta" state="right" />)

      expect(wrapper()).toHaveAttribute('data-state', 'right')
      expect(input()).toHaveAccessibleDescription('Correcto')
      expect(input()).not.toHaveAttribute('aria-invalid')
      expect(wrapper().querySelector('.c-text-field__icon svg')).toBeInTheDocument()
    })

    it('wrong: se lee «Incorrecto», es inválido y muestra el icono', () => {
      render(<TextField label="Respuesta" state="wrong" />)

      expect(wrapper()).toHaveAttribute('data-state', 'wrong')
      expect(input()).toHaveAccessibleDescription('Incorrecto')
      expect(input()).toHaveAttribute('aria-invalid', 'true')
      expect(wrapper().querySelector('.c-text-field__icon svg')).toBeInTheDocument()
    })

    it('los textos del resultado se pueden reemplazar con messages', () => {
      const { rerender } = render(
        <TextField label="Answer" state="right" messages={{ right: 'Correct', wrong: 'Wrong' }} />
      )
      expect(input()).toHaveAccessibleDescription('Correct')

      rerender(<TextField label="Answer" state="wrong" messages={{ right: 'Correct', wrong: 'Wrong' }} />)
      expect(input()).toHaveAccessibleDescription('Wrong')
    })

    it('si messages solo cambia un estado, el otro conserva su texto por defecto', () => {
      render(<TextField label="Respuesta" state="wrong" messages={{ right: 'Bien' }} />)

      expect(input()).toHaveAccessibleDescription('Incorrecto')
    })

    it('el icono es decorativo: está oculto para los lectores de pantalla', () => {
      render(<TextField label="Respuesta" state="right" />)

      expect(wrapper().querySelector('.c-text-field__icon svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('un error gana sobre un resultado correcto y se ve como incorrecto', () => {
      render(<TextField label="Respuesta" state="right" error="Falta algo" />)

      expect(input()).toHaveAttribute('aria-invalid', 'true')
      expect(wrapper()).toHaveAttribute('data-state', 'wrong')
    })
  })

  describe('atributos del input', () => {
    it('pasa los atributos del input', () => {
      render(
        <TextField
          label="Correo"
          name="correo"
          placeholder="nombre@correo.com"
          maxLength={40}
          autoComplete="email"
          inputMode="email"
        />
      )

      expect(input()).toHaveAttribute('name', 'correo')
      expect(input()).toHaveAttribute('placeholder', 'nombre@correo.com')
      expect(input()).toHaveAttribute('maxlength', '40')
      expect(input()).toHaveAttribute('autocomplete', 'email')
      expect(input()).toHaveAttribute('inputmode', 'email')
    })

    it('puede estar deshabilitado o ser de solo lectura', () => {
      const { rerender } = render(<TextField label="Campo" disabled />)
      expect(input()).toBeDisabled()

      rerender(<TextField label="Campo" readOnly />)
      expect(input()).toHaveAttribute('readonly')
    })

    it('combina el aria-describedby propio con la ayuda', () => {
      render(
        <>
          <p id="externo">Dato externo</p>
          <TextField label="Campo" hint="Ayuda" aria-describedby="externo" />
        </>
      )

      expect(input()).toHaveAccessibleDescription('Dato externo Ayuda')
    })

    it('respeta un aria-invalid propio cuando no hay error ni resultado incorrecto', () => {
      render(<TextField label="Campo" aria-invalid />)

      expect(input()).toHaveAttribute('aria-invalid', 'true')
    })

    it('conserva la clase del input y agrega addClass al contenedor', () => {
      render(<TextField label="Campo" className="mi-input" addClass="mi-campo" />)

      expect(input()).toHaveClass('c-text-field__input', 'mi-input')
      expect(wrapper()).toHaveClass('c-text-field', 'mi-campo')
    })

    it('usa el tamaño normal por defecto y admite small y big', () => {
      const { rerender } = render(<TextField label="Campo" />)
      expect(wrapper()).toHaveClass('c-text-field--normal')

      rerender(<TextField label="Campo" size="small" />)
      expect(wrapper()).toHaveClass('c-text-field--small')

      rerender(<TextField label="Campo" size="big" />)
      expect(wrapper()).toHaveClass('c-text-field--big')
    })

    it('entrega la ref al input', () => {
      const ref = createRef<HTMLInputElement>()
      render(<TextField label="Campo" ref={ref} />)

      expect(ref.current).toBe(input())
      ref.current?.focus()
      expect(input()).toHaveFocus()
    })
  })

  describe('en línea', () => {
    it('agrega la clase en línea', () => {
      render(<TextField label="Hueco" isLabelVisible={false} inline />)

      expect(wrapper()).toHaveClass('c-text-field--inline')
    })

    it('se puede escribir dentro de un párrafo sin generar HTML inválido', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <p>
          La capital de Francia es{' '}
          <TextField label="Capital" isLabelVisible={false} inline hint="una ciudad" error="Revísala" state="wrong" />.
        </p>
      )

      expect(consoleError).not.toHaveBeenCalled()
    })
  })

  describe('valor', () => {
    it('sin controlar: guarda lo que se escribe', async () => {
      render(<TextField label="Nombre" />)

      await userEvent.type(input(), 'Ana')

      expect(input()).toHaveValue('Ana')
    })

    it('controlado: muestra el valor recibido y avisa de los cambios', async () => {
      const onChange = vi.fn()
      const Controlled = () => {
        const [value, setValue] = useState('')
        return (
          <>
            <TextField
              label="Nombre"
              value={value}
              onChange={(event) => {
                onChange(event.target.value)
                setValue(event.target.value)
              }}
            />
            <button type="button" onClick={() => setValue('')}>
              Reiniciar
            </button>
          </>
        )
      }
      render(<Controlled />)

      await userEvent.type(input(), 'Ana')
      expect(input()).toHaveValue('Ana')
      expect(onChange).toHaveBeenLastCalledWith('Ana')

      await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
      expect(input()).toHaveValue('')
    })

    it('no bloquea pegar', async () => {
      render(<TextField label="Nombre" />)

      await userEvent.click(input())
      await userEvent.paste('texto pegado')

      expect(input()).toHaveValue('texto pegado')
    })
  })

  describe('accesibilidad (axe, WCAG 2.2 AA)', () => {
    /**
     * Reglas de WCAG 2.0/2.1/2.2 A y AA más las buenas prácticas de axe.
     * - `color-contrast` se desactiva porque jsdom no calcula estilos; los contrastes de los colores
     *   por defecto los fija text-field-contrast.test.ts.
     * - `region` exige que toda la página esté en landmarks: es cosa de la página, no del componente.
     */
    const violations = async () => {
      const results = await axe.run(document.body, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
        rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      })
      return results.violations.map((v) => `${v.id}: ${v.help} → ${v.nodes[0]?.html.slice(0, 120)}`)
    }

    it('un campo simple no tiene violaciones', async () => {
      render(<TextField label="Nombre" />)

      expect(await violations()).toEqual([])
    })

    it('con ayuda, error y obligatorio no tiene violaciones', async () => {
      render(<TextField label="Correo" type="email" autoComplete="email" hint="El de tu institución" error="Falta la arroba" required />)

      expect(await violations()).toEqual([])
    })

    it('con resultado correcto o incorrecto no tiene violaciones', async () => {
      render(
        <>
          <TextField label="Primera" state="right" />
          <TextField label="Segunda" state="wrong" />
        </>
      )

      expect(await violations()).toEqual([])
    })

    it('con la etiqueta oculta y en línea dentro de una frase no tiene violaciones', async () => {
      render(
        <p>
          La capital de Francia es <TextField label="Capital de Francia" isLabelVisible={false} inline />.
        </p>
      )

      expect(await violations()).toEqual([])
    })

    it('varios campos juntos no repiten ids ni dejan descripciones sin resolver', async () => {
      render(
        <>
          <TextField label="Uno" hint="a" error="b" state="wrong" />
          <TextField label="Dos" hint="a" error="b" state="wrong" />
        </>
      )

      for (const field of screen.getAllByRole('textbox')) {
        const ids = (field.getAttribute('aria-describedby') ?? '').split(' ')
        expect(ids.length).toBe(3)
        ids.forEach((id) => expect(document.getElementById(id)).toBeInTheDocument())
      }
      expect(await violations()).toEqual([])
    })
  })
})
