import { useEffect, useLayoutEffect } from 'react'
import type { DependencyList, EffectCallback } from 'react'

/**
 * `useLayoutEffect` que no emite el aviso "useLayoutEffect does nothing on the server"
 * al renderizar en el servidor (SSR).
 *
 * En el navegador es exactamente `useLayoutEffect`. En el servidor ningún efecto se ejecuta,
 * por eso allí se usa `useEffect`, que no avisa. La elección depende del entorno y no cambia
 * mientras el componente vive, así que el orden de los hooks es siempre el mismo.
 *
 * @example
 * useIsomorphicLayoutEffect(() => {
 *   ref.current?.focus()
 * }, [])
 */
export function useIsomorphicLayoutEffect(effect: EffectCallback, deps?: DependencyList): void {
  const useEffectForEnvironment = typeof window === 'undefined' ? useEffect : useLayoutEffect

  useEffectForEnvironment(effect, deps)
}
