
import classnames from 'classnames'
import { motion } from 'framer-motion';

import { useModalContext } from './modal-context'
import type { ModalOverlayProps } from '../types/types';

import "./modal.css"

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ addClass, onClick }) => {
    /**
    * Se obtienen las propiedades isOpen y onClose del contexto generado por el componente Modal.
    */
    const { onClose } = useModalContext();


    /**
     * Función que maneja el clic en el overlay.
     * Si hay una función onClick pasada como prop, la ejecuta.
     * Luego cierra el modal llamando a onClose.
     * @param {React.MouseEvent} event - Evento de clic del mouse
     */
    const handleClick = (event: React.MouseEvent) => {
        // Ejecuta la función onClick si está definida y es una función
        if (onClick && typeof onClick === 'function') {
            onClick(event);
        }

        // Cierra el modal
        onClose();
    };

    return (
        <motion.div
            className={classnames('c-layout', { [addClass ?? ""]: addClass })}
            onClick={handleClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
        />
    )
}

