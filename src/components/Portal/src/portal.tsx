import { useMemo } from 'react'

import { usePortal } from '@hooks'
import { createPortal } from 'react-dom'

import type { PortalProps } from '../types/types';

export const Portal: React.FC<PortalProps> = ({ children, id }) => {

  // Genera un identificador único basado en el prop id o uno aleatorio
  const uid: string = useMemo(() => {
    const randomId: string = window.crypto.randomUUID();
    return id ? `${id}-${randomId.substr(0, 5)}` : `portal-${randomId.substr(0, 5)}`;
  }, [id]);

  /**
    * Utilizamos el custom hook usePortal para obtener el elemento
    * que vamos a usar para crear nuestro portal.
    */
  const target = usePortal(uid);

  // Renderiza los children en el portal target utilizando createPortal
  return createPortal(children, target);
}
