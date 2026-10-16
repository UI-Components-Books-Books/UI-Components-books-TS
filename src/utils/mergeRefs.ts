import type { MutableRefObject, Ref } from 'react'

/**
 * Combina varias refs (objeto o función) en una sola función que se puede pasar a la prop `ref`.
 * Sirve cuando un componente necesita su propia ref interna y además debe respetar la que le
 * pasa quien lo usa (`forwardRef`), sea de tipo objeto o callback.
 *
 * @example
 * const setRefs = useMemo(() => mergeRefs(innerRef, forwardedRef), [forwardedRef])
 * return <div ref={setRefs} />
 *
 * @param refs - Refs a las que se asignará el mismo nodo (las `undefined`/`null` se omiten).
 * @returns Una ref callback que asigna el nodo a todas.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        const mutableRef = ref as MutableRefObject<T | null>
        mutableRef.current = node
      }
    })
  }
}
