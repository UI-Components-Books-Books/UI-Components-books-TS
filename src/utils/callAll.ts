/**
 * Combina varios manejadores de eventos en uno solo que los llama en orden.
 * Ignora los que no estén definidos, de modo que se puede pasar directamente la prop
 * opcional de un elemento hijo junto con el manejador propio del componente.
 *
 * @example
 * onFocus: callAll(child.props.onFocus, handleFocus)
 *
 * @param handlers - Manejadores a combinar (los `undefined` se omiten).
 * @returns Una función que llama a cada manejador con el mismo evento.
 */
export function callAll<E>(...handlers: Array<((event: E) => void) | undefined>) {
  return (event: E) => {
    handlers.forEach((handler) => handler?.(event))
  }
}
