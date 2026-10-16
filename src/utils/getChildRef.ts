import { Children, isValidElement } from 'react'
import type { ReactElement, ReactNode, Ref } from 'react'

/**
 * Devuelve la `ref` que ya trae el (primer) elemento hijo, si la tiene.
 *
 * Los componentes que clonan a su hijo con `cloneElement(child, { ref })` reemplazan la `ref` que
 * el hijo ya traía. Con esta función se puede leer antes de clonar y combinarla con la propia
 * mediante `mergeRefs`, para no dejar sin ref a quien usa el componente.
 *
 * En React 18 (versión que admite la librería) la ref está disponible como `element.ref`.
 *
 * @example
 * const mergedRef = useMemo(() => mergeRefs(ownRef, getChildRef(children)), [children])
 *
 * @param children - Hijo(s) del componente; se usa el primero.
 * @returns La ref del hijo, o `undefined` si no es un elemento o no tiene ref.
 */
export function getChildRef<T>(children: ReactNode): Ref<T> | undefined {
  const [first] = Children.toArray(children)

  if (!isValidElement(first)) return undefined

  return (first as ReactElement & { ref?: Ref<T> | null }).ref ?? undefined
}
