import { useEffect, useRef } from "react";

import classnames from "classnames";
import gsap from "gsap";

import { useModalContext } from "./modal-context";
import type { ModalOverlayProps } from "../types/types";

import "./modal.css";

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  addClass,
  onClick,
}) => {
  /**
   * Se obtienen las propiedades isOpen y onClose del contexto generado por el componente Modal.
   */
  const { onClose } = useModalContext();

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 0.6, duration: 0.2, ease: "power2.out" }
    );
  }, []);

  /**
   * Función que maneja el clic en el overlay.
   * Si hay una función onClick pasada como prop, la ejecuta.
   * Luego cierra el modal llamando a onClose.
   * @param {React.MouseEvent} event - Evento de clic del mouse
   */
  const handleClick = (event: React.MouseEvent) => {
    // Ejecuta la función onClick si está definida y es una función
    if (onClick && typeof onClick === "function") {
      onClick(event);
    }

    // Cierra el modal
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className={classnames("c-layout", { [addClass ?? ""]: addClass })}
      onClick={handleClick}
    />
  );
};
