import { useLayoutEffect, useRef } from "react";

import { cn } from '@utils/cn';
import gsap from "gsap";

import { useModalContext } from "./modal-context";
import type { ModalContentProps } from "../types/types";

import "./modal.css";

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar la key de la tecla "ESC".
 */
const KEY = Object.freeze({
  ESC: "Escape",
});

export const ModalContent: React.FC<ModalContentProps> = ({
  addClass,
  children,
  role = "dialog",
  ...props
}) => {
  /**
   * Se obtienen las propiedades del contexto generado por el componente Modal.
   */
  const { onClose } = useModalContext();

  /**
   * Referencia al elemento del modal content para
   * manejar el focus y las animaciones.
   */
  const refModalContent = useRef<HTMLDivElement>(null);

  /**
   * Efecto para enfocar el modal y aplicar la animación de entrada.
   */
  useLayoutEffect(() => {
    const modalContent = refModalContent.current;

    if (!modalContent) return;

    // Aplicamos la animación de entrada
    gsap.fromTo(
      modalContent,
      { y: "-100vh", opacity: 0 },
      {
        y: "-50%",
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.2)",
      }
    );

    const focusTimeout = setTimeout(() => {
      // Establecemos el enfoque en el elemento del modal, salvo que el focus ya esté
      // dentro (p. ej. un campo con autoFocus), para no quitárselo.
      if (!modalContent.contains(document.activeElement)) {
        modalContent.focus();
      }
    }, 100);

    return () => clearTimeout(focusTimeout);
  }, []);

  /**
   * Cierra el modal al presionar la tecla "ESC".
   * @param {event} event - Evento del teclado
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === KEY.ESC) {
      onClose();
    }
  };

  return (
    <div
      ref={refModalContent}
      role={role}
      tabIndex={-1}
      aria-modal="true"
      onKeyDown={handleKeyDown}
      className={cn("c-modal", addClass)}
      {...props}
    >
      <div className="c-modal-container">{children}</div>
    </div>
  );
};
