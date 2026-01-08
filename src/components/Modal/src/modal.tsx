import { useEffect, useRef } from "react";

import "wicg-inert";

import { Portal } from "@components";

import { ModalCloseButton } from "./modal-close-button";
import { ModalContent } from "./modal-content";
import { ModalProvider } from "./modal-context";
import { ModalOverlay } from "./modal-overlay";
import type { ModalProps, ModalSubModules } from "../types/types";

const Modal: React.FC<ModalProps> & ModalSubModules = ({
  id = "js-modal",
  children,
  isOpen = false,
  onClose,
  finalFocusRef,
}) => {
  /**
   * Guarda la referencia del elemento que tenía el focus antes de abrir el modal.
   * Esto garantiza que restauremos el focus al elemento correcto al cerrar.
   */
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /**
   * Efecto encargado de manejar el estado inert del root
   * y gestionar el focus al abrir/cerrar el modal.
   */
  useEffect(() => {
    // Selecciona el elemento root
    const root = document.querySelector("#root") as HTMLDivElement;
    
    if (!root) return;

    if (isOpen) {
      // Guardar el elemento que actualmente tiene el focus ANTES de aplicar inert
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Aplicamos el estado inert al #root para bloquear interacciones
      root.inert = true;
    } else {
      // Cuando se cierra, restaurar el focus inmediatamente
      if (previousFocusRef.current) {
        requestAnimationFrame(() => {
          if (finalFocusRef) {
            const elements = document.querySelectorAll<HTMLElement>(
              Array.isArray(finalFocusRef) ? finalFocusRef.join(', ') : finalFocusRef
            );
            elements[0]?.focus();
          } else {
            previousFocusRef.current?.focus();
          }
        });
      }
    }

    // Cleanup: se ejecuta cuando el componente se desmonta
    return () => {
      root.inert = false;
    };
  }, [isOpen, finalFocusRef]);

  return (
    <ModalProvider value={{ onClose }}>
      {isOpen && <Portal id={id}>{children}</Portal>}
    </ModalProvider>
  );
};

Modal.Content = ModalContent;
Modal.Overlay = ModalOverlay;
Modal.CloseButton = ModalCloseButton;

export { Modal };
