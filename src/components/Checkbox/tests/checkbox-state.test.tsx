import { createRef } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { CheckBox } from '../index'

const box = () => screen.getByRole('checkbox') as HTMLInputElement

describe('CheckBox: resultado para lectores de pantalla', () => {
  describe('cuándo se anuncia', () => {
    it('marcado y correcto: se lee «Correcto» como descripción, sin cambiar el nombre', () => {
      render(<CheckBox label="Opción" state="right" defaultChecked />)

      expect(box()).toHaveAccessibleDescription('Correcto')
      expect(box()).toHaveAccessibleName('Opción')
    })

    it('marcado e incorrecto: se lee «Incorrecto»', () => {
      render(<CheckBox label="Opción" state="wrong" defaultChecked />)

      expect(box()).toHaveAccessibleDescription('Incorrecto')
    })

    it.each(['right', 'wrong'] as const)(
      'sin marcar no se anuncia el resultado (%s): el icono tampoco se ve',
      (state) => {
        render(<CheckBox label="Opción" state={state} />)

        expect(box()).not.toHaveAttribute('aria-describedby')
        expect(document.querySelector('.u-sr-only')).toBeNull()
      }
    )

    it('sin resultado (normal) no se anuncia nada, ni siquiera marcado', () => {
      render(<CheckBox label="Opción" defaultChecked />)

      expect(box()).not.toHaveAttribute('aria-describedby')
    })

    it('al marcarlo se anuncia y al desmarcarlo deja de anunciarse', async () => {
      render(<CheckBox label="Opción" state="right" />)
      expect(box()).not.toHaveAccessibleDescription('Correcto')

      await userEvent.click(box())
      expect(box()).toHaveAccessibleDescription('Correcto')

      await userEvent.click(box())
      expect(box()).not.toHaveAttribute('aria-describedby')
    })

    it('controlado: sigue la prop checked', () => {
      const { rerender } = render(<CheckBox label="Opción" state="wrong" checked={false} onChange={() => {}} />)
      expect(box()).not.toHaveAttribute('aria-describedby')

      rerender(<CheckBox label="Opción" state="wrong" checked onChange={() => {}} />)
      expect(box()).toHaveAccessibleDescription('Incorrecto')

      rerender(<CheckBox label="Opción" state="wrong" checked={false} onChange={() => {}} />)
      expect(box()).not.toHaveAttribute('aria-describedby')
    })

    it('si el resultado llega después de marcarlo (como al comprobar una actividad) se anuncia', async () => {
      const { rerender } = render(<CheckBox label="Opción" />)
      await userEvent.click(box())
      expect(box()).not.toHaveAttribute('aria-describedby')

      rerender(<CheckBox label="Opción" state="right" />)

      expect(box()).toHaveAccessibleDescription('Correcto')
    })

    it('al reiniciar el formulario vuelve a anunciarse según el valor por defecto', async () => {
      render(
        <form>
          <CheckBox label="Opción" state="right" defaultChecked />
        </form>
      )
      await userEvent.click(box())
      expect(box()).not.toHaveAttribute('aria-describedby')

      ;(document.querySelector('form') as HTMLFormElement).reset()

      await waitFor(() => expect(box()).toHaveAccessibleDescription('Correcto'))
    })
  })

  describe('textos y enlaces', () => {
    it('los textos se pueden reemplazar con messages', () => {
      const { rerender } = render(
        <CheckBox label="Option" state="right" defaultChecked messages={{ right: 'Correct', wrong: 'Wrong' }} />
      )
      expect(box()).toHaveAccessibleDescription('Correct')

      rerender(<CheckBox label="Option" state="wrong" defaultChecked messages={{ right: 'Correct', wrong: 'Wrong' }} />)
      expect(box()).toHaveAccessibleDescription('Wrong')
    })

    it('si messages solo cambia un estado, el otro conserva su texto por defecto', () => {
      render(<CheckBox label="Opción" state="wrong" defaultChecked messages={{ right: 'Bien' }} />)

      expect(box()).toHaveAccessibleDescription('Incorrecto')
    })

    it('combina el aria-describedby propio con el resultado', () => {
      render(
        <>
          <p id="externo">Dato externo</p>
          <CheckBox label="Opción" state="right" defaultChecked aria-describedby="externo" />
        </>
      )

      expect(box()).toHaveAccessibleDescription('Dato externo Correcto')
    })

    it('conserva el aria-describedby propio cuando no hay resultado que anunciar', () => {
      render(
        <>
          <p id="externo">Dato externo</p>
          <CheckBox label="Opción" aria-describedby="externo" />
        </>
      )

      expect(box()).toHaveAccessibleDescription('Dato externo')
    })

    it('el id del texto se deriva del id del CheckBox y no se repite entre varios', () => {
      render(
        <>
          <CheckBox label="Uno" state="right" defaultChecked id="uno" />
          <CheckBox label="Dos" state="wrong" defaultChecked />
          <CheckBox label="Tres" state="wrong" defaultChecked />
        </>
      )

      expect(screen.getByText('Correcto')).toHaveAttribute('id', 'uno-state')
      const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('iconos y ref', () => {
    it.each(['normal', 'right', 'wrong'] as const)('el icono del estado %s es decorativo', (state) => {
      render(<CheckBox label="Opción" state={state} />)

      expect(document.querySelector('.c-input-check__icon svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('sigue entregando la ref (objeto o función) al input', () => {
      const objectRef = createRef<HTMLInputElement>()
      const callbackRef = vi.fn()

      const { unmount } = render(
        <>
          <CheckBox label="Uno" ref={objectRef} />
          <CheckBox label="Dos" ref={callbackRef} />
        </>
      )

      expect(objectRef.current).toBe(screen.getByLabelText('Uno'))
      expect(callbackRef).toHaveBeenCalledWith(screen.getByLabelText('Dos'))
      unmount()
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

    it('marcado con resultado correcto o incorrecto no tiene violaciones', async () => {
      render(
        <>
          <CheckBox label="Primera" state="right" defaultChecked />
          <CheckBox label="Segunda" state="wrong" defaultChecked />
          <CheckBox label="Tercera" state="right" />
        </>
      )

      expect(await violations()).toEqual([])
    })
  })
})
