import { createRef } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { Radio } from '../index'

const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement

describe('Radio: resultado para lectores de pantalla', () => {
  describe('cuándo se anuncia', () => {
    it('marcado y correcto: se lee «Correcto» como descripción, sin cambiar el nombre', () => {
      render(<Radio label="Opción" name="g" state="right" defaultChecked />)

      expect(radio('Opción')).toHaveAccessibleDescription('Correcto')
      expect(radio('Opción')).toHaveAccessibleName('Opción')
    })

    it('marcado e incorrecto: se lee «Incorrecto»', () => {
      render(<Radio label="Opción" name="g" state="wrong" defaultChecked />)

      expect(radio('Opción')).toHaveAccessibleDescription('Incorrecto')
    })

    it.each(['right', 'wrong'] as const)('sin marcar no se anuncia el resultado (%s)', (state) => {
      render(<Radio label="Opción" name="g" state={state} />)

      expect(radio('Opción')).not.toHaveAttribute('aria-describedby')
      expect(document.querySelector('.u-sr-only')).toBeNull()
    })

    it('sin state no se anuncia nada, ni siquiera marcado', () => {
      render(<Radio label="Opción" name="g" defaultChecked />)

      expect(radio('Opción')).not.toHaveAttribute('aria-describedby')
    })

    it('controlado: sigue la prop checked', () => {
      const { rerender } = render(<Radio label="Opción" name="g" state="wrong" checked={false} onChange={() => {}} />)
      expect(radio('Opción')).not.toHaveAttribute('aria-describedby')

      rerender(<Radio label="Opción" name="g" state="wrong" checked onChange={() => {}} />)
      expect(radio('Opción')).toHaveAccessibleDescription('Incorrecto')
    })
  })

  describe('en un grupo', () => {
    // Como en una actividad tras comprobar: cada opción lleva su resultado, pero solo se ve (y se
    // anuncia) el de la opción que el usuario marcó.
    const Group = ({ name = 'grupo' }: { name?: string }) => (
      <>
        <Radio label="Madrid" name={name} state="wrong" />
        <Radio label="París" name={name} state="right" />
        <Radio label="Roma" name={name} state="wrong" />
      </>
    )

    it('solo anuncia el resultado de la opción marcada, no el de las demás', async () => {
      render(<Group />)
      await userEvent.click(radio('Madrid'))

      expect(radio('Madrid')).toHaveAccessibleDescription('Incorrecto')
      expect(radio('París')).not.toHaveAttribute('aria-describedby')
      expect(radio('Roma')).not.toHaveAttribute('aria-describedby')
    })

    it('al marcar otra opción, el anuncio pasa a ella y la anterior deja de anunciar', async () => {
      render(<Group />)
      await userEvent.click(radio('Madrid'))

      await userEvent.click(radio('París'))

      expect(radio('París')).toHaveAccessibleDescription('Correcto')
      expect(radio('Madrid')).not.toHaveAttribute('aria-describedby')
      expect(document.querySelectorAll('.u-sr-only')).toHaveLength(1)
    })

    it('funciona al cambiar con el teclado (flechas)', async () => {
      render(<Group />)
      await userEvent.click(radio('Madrid'))

      await userEvent.keyboard('{ArrowRight}')

      expect(radio('París')).toBeChecked()
      expect(radio('París')).toHaveAccessibleDescription('Correcto')
      expect(radio('Madrid')).not.toHaveAttribute('aria-describedby')
    })

    it('dos grupos con distinto nombre no se afectan entre sí', async () => {
      render(
        <>
          <fieldset>
            <legend>Uno</legend>
            <Radio label="A1" name="uno" state="right" />
            <Radio label="A2" name="uno" state="wrong" />
          </fieldset>
          <fieldset>
            <legend>Dos</legend>
            <Radio label="B1" name="dos" state="right" />
            <Radio label="B2" name="dos" state="wrong" />
          </fieldset>
        </>
      )

      await userEvent.click(radio('A1'))
      await userEvent.click(radio('B2'))

      expect(radio('A1')).toHaveAccessibleDescription('Correcto')
      expect(radio('B2')).toHaveAccessibleDescription('Incorrecto')
    })

    it('al reiniciar el formulario deja de anunciar la opción que estaba marcada', async () => {
      render(
        <form>
          <Group />
        </form>
      )
      await userEvent.click(radio('París'))
      expect(radio('París')).toHaveAccessibleDescription('Correcto')

      ;(document.querySelector('form') as HTMLFormElement).reset()

      await waitFor(() => expect(radio('París')).not.toHaveAttribute('aria-describedby'))
    })
  })

  describe('textos y enlaces', () => {
    it('los textos se pueden reemplazar con messages', () => {
      const { rerender } = render(
        <Radio label="Option" name="g" state="right" defaultChecked messages={{ right: 'Correct', wrong: 'Wrong' }} />
      )
      expect(radio('Option')).toHaveAccessibleDescription('Correct')

      rerender(<Radio label="Option" name="g" state="wrong" defaultChecked messages={{ right: 'Correct', wrong: 'Wrong' }} />)
      expect(radio('Option')).toHaveAccessibleDescription('Wrong')
    })

    it('combina el aria-describedby propio con el resultado', () => {
      render(
        <>
          <p id="externo">Dato externo</p>
          <Radio label="Opción" name="g" state="right" defaultChecked aria-describedby="externo" />
        </>
      )

      expect(radio('Opción')).toHaveAccessibleDescription('Dato externo Correcto')
    })

    it('el id del texto se deriva del id del radio y no se repite entre varios', () => {
      render(
        <>
          <Radio label="Uno" name="g" state="right" defaultChecked id="uno" />
          <Radio label="Dos" name="h" state="wrong" defaultChecked />
        </>
      )

      expect(screen.getByText('Correcto')).toHaveAttribute('id', 'uno-state')
      const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('iconos y ref', () => {
    it.each(['right', 'wrong'] as const)('el icono del estado %s es decorativo', (state) => {
      render(<Radio label="Opción" name="g" state={state} />)

      expect(document.querySelector('.c-input-radio__icon svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('sigue entregando la ref (objeto o función) al input', () => {
      const objectRef = createRef<HTMLInputElement>()
      const callbackRef = vi.fn()

      render(
        <>
          <Radio label="Uno" name="g" ref={objectRef} />
          <Radio label="Dos" name="g" ref={callbackRef} />
        </>
      )

      expect(objectRef.current).toBe(radio('Uno'))
      expect(callbackRef).toHaveBeenCalledWith(radio('Dos'))
    })
  })

  describe('accesibilidad (axe, WCAG 2.2 AA)', () => {
    /**
     * Reglas de WCAG 2.0/2.1/2.2 A y AA más las buenas prácticas de axe.
     * - `color-contrast` se desactiva porque jsdom no calcula estilos.
     * - `region` exige que toda la página esté en landmarks: es cosa de la página, no del componente.
     */
    const violations = async () => {
      const results = await axe.run(document.body, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
        rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      })
      return results.violations.map((v) => `${v.id}: ${v.help} → ${v.nodes[0]?.html.slice(0, 120)}`)
    }

    it('un grupo con resultado en la opción marcada no tiene violaciones', async () => {
      render(
        <fieldset>
          <legend>Capital de Francia</legend>
          <Radio label="Madrid" name="g" state="wrong" />
          <Radio label="París" name="g" state="right" defaultChecked />
        </fieldset>
      )

      expect(await violations()).toEqual([])
    })
  })
})
