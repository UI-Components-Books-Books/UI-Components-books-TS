import { useMemo, useSyncExternalStore } from 'react'

import { usePortal } from '@hooks'
import { createPortal } from 'react-dom'

import type { PortalProps } from '../types/types';

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/**
 * Indica si el componente se está renderizando en el navegador y ya no en el servidor.
 *
 * Retorna false al renderizar en el servidor y durante la hidratación, para que el primer render
 * coincida con el HTML del servidor, y true en cuanto esta terminó. Cuando no hay hidratación
 * (render solo en el cliente) retorna true desde el primer render, sin renderizados extra.
 */
const useIsClient = (): boolean => useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

/**
 * Crea un identificador único basado en el prop id (o 'portal' si no se pasa).
 * `crypto.randomUUID` solo existe en contextos seguros (HTTPS o localhost),
 * por eso hay un respaldo para el resto.
 */
const createUid = (id?: string): string => {
  const randomId: string =
    typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : Math.random().toString(16).slice(2, 7).padEnd(5, '0');

  return `${id || 'portal'}-${randomId.slice(0, 5)}`;
}

/**
 * Parte del portal que necesita el DOM del navegador (crea el contenedor y lo agrega al body),
 * por eso solo se monta en el cliente.
 */
const PortalContent: React.FC<PortalProps> = ({ children, id }) => {

  // Genera un identificador único basado en el prop id o uno aleatorio
  const uid: string = useMemo(() => createUid(id), [id]);

  /**
    * Utilizamos el custom hook usePortal para obtener el elemento
    * que vamos a usar para crear nuestro portal.
    */
  const target = usePortal(uid);

  // Renderiza los children en el portal target utilizando createPortal
  return createPortal(children, target);
}

/**
 * Renderiza sus hijos en un contenedor al final del body, fuera del árbol del componente.
 *
 * En el servidor (SSR) no renderiza nada: allí no existe el body, y los portales se usan para
 * contenido que aparece por interacción (modales, tooltips, popovers). Los hijos se montan
 * en el navegador, justo después de hidratar.
 */
export const Portal: React.FC<PortalProps> = ({ children, id }) => {
  const isClient = useIsClient();

  return isClient ? <PortalContent id={id}>{children}</PortalContent> : null;
}
