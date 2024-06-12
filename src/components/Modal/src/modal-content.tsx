
import classnames from 'classnames'
import { motion } from 'framer-motion'

import { useModalContext } from './modal-context'
import type { ModalContentProps } from '../types/types'

import './modal.css'

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar el keyCode de la tecla "ESC".
 */
const KEYCODE = Object.freeze({
    ESC: 27
})

const dropIn = {
    hidden: {
        y: "-100vh",
        opacity: 0,
    },
    visible: {
        y: "-50%",
        opacity: 1,
        transition: {
            duration: 0.1,
            type: "spring",
            damping: 40,
            stiffness: 500,
        },
    },
    exit: {
        y: "100vh",
        opacity: 0,
    },
};

export const ModalContent: React.FC<ModalContentProps> = ({ addClass, children, ...props }) => {
    /**
     * Se obtienen las propiedades onClose y refModal
     * del contexto generado por el componente Modal.
     */
    const { onClose, refModal } = useModalContext()


    /**
     * Cierra el modal al presionar la tecla "ESC".
     * @param {event} event - Evento del teclado
     */
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if ((event.keyCode || event.which) === KEYCODE.ESC) {
            onClose()
        }
    }

    return (
        <motion.div
            ref={refModal}
            role='dialog'
            tabIndex={-1}
            aria-modal='true'
            onKeyDown={handleKeyDown}
            className={classnames('c-modal', { [addClass ?? ""]: addClass })}
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            {...props}
        >
            <div className="c-modal-container">
                {children}
            </div>
        </motion.div>
    )
}

