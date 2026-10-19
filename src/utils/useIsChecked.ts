import { useState } from 'react'
import type { RefObject } from 'react'

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

/**
 * Indica si un `<input type="checkbox">` o `<input type="radio">` está marcado, leyéndolo del DOM.
 *
 * Hace falta porque el navegador guarda el estado marcado y React no se entera de todos los cambios:
 * - Al marcar un radio se desmarcan los otros de su grupo sin que ellos reciban ningún evento.
 * - Reiniciar el formulario también lo cambia sin eventos de cambio.
 * - La prop `checked` (controlado) cambia el DOM sin que haya un evento.
 *
 * @param ref - Ref del input.
 * @param initial - Valor para el primer render (y el del servidor), antes de poder leer el DOM.
 */
export function useIsChecked(ref: RefObject<HTMLInputElement>, initial: boolean) {
  const [isChecked, setIsChecked] = useState(initial)

  // Tras cada render: cubre la prop `checked`, que cambia el DOM sin evento. Si el valor no cambió,
  // React no vuelve a renderizar, así que no hay un ciclo de actualizaciones.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIsomorphicLayoutEffect(() => {
    setIsChecked(Boolean(ref.current?.checked))
  })

  useIsomorphicLayoutEffect(() => {
    const input = ref.current
    if (!input) return

    const sync = () => setIsChecked(input.checked)

    // Los eventos `change` suben hasta el documento: se oye el propio input y, si es un radio,
    // los demás de su grupo (mismo nombre y mismo formulario), que se desmarcan sin aviso.
    const onChange = (event: Event) => {
      const target = event.target
      if (!(target instanceof HTMLInputElement)) return

      const sameGroup =
        input.type === 'radio' &&
        target.type === 'radio' &&
        input.name !== '' &&
        target.name === input.name &&
        target.form === input.form

      if (target === input || sameGroup) sync()
    }

    // `reset` se dispara antes de que el formulario cambie los valores: se lee un instante después.
    let resetTimer: ReturnType<typeof setTimeout> | undefined
    const onReset = () => {
      clearTimeout(resetTimer)
      resetTimer = setTimeout(sync)
    }

    const form = input.form
    document.addEventListener('change', onChange, true)
    form?.addEventListener('reset', onReset)

    return () => {
      document.removeEventListener('change', onChange, true)
      form?.removeEventListener('reset', onReset)
      clearTimeout(resetTimer)
    }
  }, [ref])

  return isChecked
}
