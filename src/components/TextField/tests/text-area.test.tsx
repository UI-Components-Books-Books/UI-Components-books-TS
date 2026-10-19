import { createRef, useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { TextArea } from '../index'

const area = () => screen.getByRole('textbox') as HTMLTextAreaElement
const wrapper = () => area().closest('.c-text-field') as HTMLElement

describe('TextArea', () => {
  describe('estructura y etiqueta', () => {
    it('renderiza un textarea asociado a su etiqueta', () => {
      render(<TextArea label="Comentario" />)

      const field = screen.getByLabelText('Comentario')
      expect(field).toBe(area())
      expect(field.tagName).toBe('TEXTAREA')
      expect(field).not.toHaveAttribute('type')
    })

    it('muestra 4 líneas por defecto y admite otro número', () => {
      const { rerender } = render(<TextArea label="Comentario" />)
      expect(area()).toHaveAttribute('rows', '4')

      rerender(<TextArea label="Comentario" rows={8} />)
      expect(area()).toHaveAttribute('rows', '8')
    })

    it('muestra la etiqueta por defecto y con isLabelVisible en false la oculta sin perder el nombre', () => {
      const { rerender } = render(<TextArea label="Comentario" />)
      expect(screen.getByText('Comentario')).not.toHaveClass('u-sr-only')

      rerender(<TextArea label="Comentario" isLabelVisible={false} />)
      expect(screen.getByText('Comentario')).toHaveClass('u-sr-only')
      expect(screen.getByRole('textbox', { name: 'Comentario' })).toBeInTheDocument()
    })

    it('usa el id recibido y deriva de él los de la ayuda, el error y el resultado', () => {
      render(<TextArea label="Comentario" id="comentario" hint="Ayuda" error="Error" state="wrong" />)

      expect(area()).toHaveAttribute('id', 'comentario')
      expect(screen.getByText('Comentario')).toHaveAttribute('for', 'comentario')
      expect(screen.getByText('Ayuda')).toHaveAttribute('id', 'comentario-hint')
      expect(screen.getByText('Error')).toHaveAttribute('id', 'comentario-error')
      expect(screen.getByText('Incorrecto')).toHaveAttribute('id', 'comentario-state')
    })

    it('con varios campos sin id ningún id se repite', () => {
      render(
        <>
          <TextArea label="Uno" hint="a" error="b" state="right" />
          <TextArea label="Dos" hint="a" error="b" state="wrong" />
        </>
      )

      const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id)
      expect(ids.length).toBeGreaterThan(2)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('la etiqueta es texto: no interpreta HTML', () => {
      render(<TextArea label="<b>hola</b>" />)

      expect(screen.getByText('<b>hola</b>')).toBeInTheDocument()
      expect(document.querySelector('label b')).toBeNull()
    })

    it('el contenedor lleva la clase de varias líneas', () => {
      render(<TextArea label="Comentario" />)

      expect(wrapper()).toHaveClass('c-text-field', 'c-text-field--area', 'c-text-field--normal')
    })
  })

  describe('ayuda y error', () => {
    it('la ayuda se enlaza con aria-describedby', () => {
      render(<TextArea label="Comentario" hint="Cuéntanos qué pasó" />)

      expect(area()).toHaveAccessibleDescription('Cuéntanos qué pasó')
    })

    it('sin ayuda, error ni resultado no hay aria-describedby', () => {
      render(<TextArea label="Comentario" />)

      expect(area()).not.toHaveAttribute('aria-describedby')
    })

    it('el error marca el campo como inválido y enlaza el mensaje', () => {
      render(<TextArea label="Comentario" error="Escribe al menos una frase" />)

      expect(area()).toHaveAttribute('aria-invalid', 'true')
      expect(area()).toHaveAccessibleDescription('Escribe al menos una frase')
      expect(screen.getByText('Escribe al menos una frase')).toBeVisible()
    })

    it('al quitar el error el campo deja de ser inválido', () => {
      const { rerender } = render(<TextArea label="Comentario" error="Falta" />)

      rerender(<TextArea label="Comentario" />)

      expect(area()).not.toHaveAttribute('aria-invalid')
      expect(area()).not.toHaveAttribute('aria-describedby')
      expect(screen.queryByText('Falta')).not.toBeInTheDocument()
    })

    it('la ayuda se lee antes que el error', () => {
      render(<TextArea label="Comentario" hint="Una frase como mínimo" error="Está vacío" />)

      expect(area()).toHaveAccessibleDescription('Una frase como mínimo Está vacío')
    })
  })

  describe('obligatorio', () => {
    it('marca el campo como obligatorio con un marcador que el lector no repite', () => {
      render(<TextArea label="Comentario" required />)

      expect(area()).toBeRequired()
      expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByRole('textbox', { name: 'Comentario' })).toBeInTheDocument()
    })
  })

  describe('resultado de actividad', () => {
    it('normal: sin icono, sin texto de resultado y sin descripción', () => {
      render(<TextArea label="Respuesta" />)

      expect(wrapper()).toHaveAttribute('data-state', 'normal')
      expect(wrapper().querySelector('.c-text-field__icon')).toBeNull()
      expect(area()).not.toHaveAttribute('aria-describedby')
    })

    it('right: se lee «Correcto», no es inválido y muestra el icono', () => {
      render(<TextArea label="Respuesta" state="right" />)

      expect(wrapper()).toHaveAttribute('data-state', 'right')
      expect(area()).toHaveAccessibleDescription('Correcto')
      expect(area()).not.toHaveAttribute('aria-invalid')
      expect(wrapper().querySelector('.c-text-field__icon svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('wrong: se lee «Incorrecto», es inválido y muestra el icono', () => {
      render(<TextArea label="Respuesta" state="wrong" />)

      expect(wrapper()).toHaveAttribute('data-state', 'wrong')
      expect(area()).toHaveAccessibleDescription('Incorrecto')
      expect(area()).toHaveAttribute('aria-invalid', 'true')
      expect(wrapper().querySelector('.c-text-field__icon svg')).toBeInTheDocument()
    })

    it('los textos del resultado se pueden reemplazar con messages', () => {
      const { rerender } = render(
        <TextArea label="Answer" state="right" messages={{ right: 'Correct', wrong: 'Wrong' }} />
      )
      expect(area()).toHaveAccessibleDescription('Correct')

      rerender(<TextArea label="Answer" state="wrong" messages={{ right: 'Correct', wrong: 'Wrong' }} />)
      expect(area()).toHaveAccessibleDescription('Wrong')
    })
  })

  describe('atributos del textarea', () => {
    it('pasa los atributos del textarea', () => {
      render(<TextArea label="Comentario" name="comentario" placeholder="Escribe aquí" maxLength={200} />)

      expect(area()).toHaveAttribute('name', 'comentario')
      expect(area()).toHaveAttribute('placeholder', 'Escribe aquí')
      expect(area()).toHaveAttribute('maxlength', '200')
    })

    it('puede estar deshabilitado o ser de solo lectura', () => {
      const { rerender } = render(<TextArea label="Campo" disabled />)
      expect(area()).toBeDisabled()

      rerender(<TextArea label="Campo" readOnly />)
      expect(area()).toHaveAttribute('readonly')
    })

    it('combina el aria-describedby propio con la ayuda', () => {
      render(
        <>
          <p id="externo">Dato externo</p>
          <TextArea label="Campo" hint="Ayuda" aria-describedby="externo" />
        </>
      )

      expect(area()).toHaveAccessibleDescription('Dato externo Ayuda')
    })

    it('conserva la clase del textarea y agrega addClass al contenedor', () => {
      render(<TextArea label="Campo" className="mi-area" addClass="mi-campo" />)

      expect(area()).toHaveClass('c-text-field__input', 'mi-area')
      expect(wrapper()).toHaveClass('c-text-field', 'c-text-field--area', 'mi-campo')
    })

    it('usa el tamaño normal por defecto y admite small y big', () => {
      const { rerender } = render(<TextArea label="Campo" />)
      expect(wrapper()).toHaveClass('c-text-field--normal')

      rerender(<TextArea label="Campo" size="small" />)
      expect(wrapper()).toHaveClass('c-text-field--small')

      rerender(<TextArea label="Campo" size="big" />)
      expect(wrapper()).toHaveClass('c-text-field--big')
    })

    it('entrega la ref al textarea', () => {
      const ref = createRef<HTMLTextAreaElement>()
      render(<TextArea label="Campo" ref={ref} />)

      expect(ref.current).toBe(area())
      ref.current?.focus()
      expect(area()).toHaveFocus()
    })

    it('es HTML válido dentro de un párrafo', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <p>
          <TextArea label="Comentario" hint="ayuda" error="error" state="wrong" />
        </p>
      )

      expect(consoleError).not.toHaveBeenCalled()
    })
  })

  describe('valor', () => {
    it('sin controlar: guarda lo que se escribe, con saltos de línea', async () => {
      render(<TextArea label="Comentario" />)

      await userEvent.type(area(), 'Línea 1{Enter}Línea 2')

      expect(area()).toHaveValue('Línea 1\nLínea 2')
    })

    it('controlado: muestra el valor recibido y avisa de los cambios', async () => {
      const onChange = vi.fn()
      const Controlled = () => {
        const [value, setValue] = useState('')
        return (
          <>
            <TextArea
              label="Comentario"
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

      await userEvent.type(area(), 'Hola')
      expect(area()).toHaveValue('Hola')
      expect(onChange).toHaveBeenLastCalledWith('Hola')

      await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
      expect(area()).toHaveValue('')
    })

    it('no bloquea pegar', async () => {
      render(<TextArea label="Comentario" />)

      await userEvent.click(area())
      await userEvent.paste('texto pegado')

      expect(area()).toHaveValue('texto pegado')
    })
  })

  describe('accesibilidad (axe, WCAG 2.2 AA)', () => {
    /**
     * Reglas de WCAG 2.0/2.1/2.2 A y AA más las buenas prácticas de axe.
     * - `color-contrast` se desactiva porque jsdom no calcula estilos; los contrastes de los colores
     *   por defecto los fija text-field-contrast.test.ts (TextArea usa los mismos).
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
      render(<TextArea label="Comentario" />)

      expect(await violations()).toEqual([])
    })

    it('con ayuda, error y obligatorio no tiene violaciones', async () => {
      render(<TextArea label="Comentario" hint="Una frase como mínimo" error="Está vacío" required />)

      expect(await violations()).toEqual([])
    })

    it('con la etiqueta oculta no tiene violaciones', async () => {
      render(<TextArea label="Comentario" isLabelVisible={false} />)

      expect(await violations()).toEqual([])
    })

    it('con resultado correcto o incorrecto no tiene violaciones', async () => {
      render(
        <>
          <TextArea label="Primera" state="right" />
          <TextArea label="Segunda" state="wrong" />
        </>
      )

      expect(await violations()).toEqual([])
    })
  })
})
