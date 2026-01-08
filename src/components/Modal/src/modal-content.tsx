import { useLayoutEffect, useRef } from "react";

import classnames from "classnames";
import gsap from "gsap";

import { useModalContext } from "./modal-context";
import type { ModalContentProps } from "../types/types";

import "./modal.css";

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar la key de la tecla "ESC".
 */
const KEYCODE = Object.freeze({
  ESC: "Escape",
});

export const ModalContent: React.FC<ModalContentProps> = ({
  addClass,
  children,
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
    if (!refModalContent.current) return;

    // Aplicamos la animación de entrada
    gsap.fromTo(
      refModalContent.current,
      { y: "-100vh", opacity: 0 },
      {
        y: "-50%",
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.2)",
      }
    );

    setTimeout(() => {
      // Establecemos el enfoque en el elemento del modal
      refModalContent.current?.focus();
    }, 100);
  }, []);

  /**
   * Cierra el modal al presionar la tecla "ESC".
   * @param {event} event - Evento del teclado
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === KEYCODE.ESC) {
      onClose();
    }
  };

  return (
    <div
      ref={refModalContent}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      onKeyDown={handleKeyDown}
      className={classnames("c-modal", { [addClass ?? ""]: addClass })}
      {...props}
    >
      <div className="c-modal-container">{children}</div>
    </div>
  );
};
