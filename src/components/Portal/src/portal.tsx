import { useMemo } from 'react'

import { createPortal } from 'react-dom'

import { usePortal } from '../../../hooks'

interface Props {
  id?: string
  children: React.ReactNode,
}

export const Portal: React.FC<Props> = ({ children, id }) => {

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
