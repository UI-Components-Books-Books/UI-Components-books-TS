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
   * `finalFocusRef` como un único selector. Cuando llega como arreglo suele ser un literal nuevo
   * en cada render, así que se compara su contenido y no su referencia.
   */
  const finalFocusSelector = Array.isArray(finalFocusRef) ? finalFocusRef.join(', ') : finalFocusRef;

  /**
   * Siempre el último selector, para leerlo al cerrar sin que un cambio suyo
   * mientras el modal está abierto vuelva a ejecutar el efecto de apertura.
   */
  const finalFocusSelectorRef = useRef(finalFocusSelector);

  useEffect(() => {
    finalFocusSelectorRef.current = finalFocusSelector;
  }, [finalFocusSelector]);

  /**
   * Frame pendiente que devuelve el focus al cerrar.
   */
  const restoreFocusFrameRef = useRef<number>();

  /**
   * Efecto encargado de manejar el estado inert del root
   * y gestionar el focus al abrir/cerrar el modal.
   */
  useEffect(() => {
    if (!isOpen) return;

    // Si había un cierre pendiente (p. ej. React ejecuta dos veces los efectos en desarrollo)
    // el modal sigue abierto y no se debe mover el focus.
    if (restoreFocusFrameRef.current !== undefined) {
      cancelAnimationFrame(restoreFocusFrameRef.current);
      restoreFocusFrameRef.current = undefined;
    }

    // Guardar el elemento que actualmente tiene el focus ANTES de aplicar inert
    const previousFocus = document.activeElement as HTMLElement | null;

    // Aplicamos el estado inert al #root para bloquear interacciones.
    // Si la página no tiene #root el focus se gestiona igual, pero el resto no se bloquea.
    const root = document.querySelector<HTMLElement>("#root");
    if (root) root.inert = true;

    // Cleanup: se ejecuta al cerrar el modal y también si se desmonta estando abierto
    return () => {
      if (root) root.inert = false;

      // Devolvemos el focus: al elemento indicado en finalFocusRef (o, si no existe, al que
      // lo tenía antes de abrir el modal).
      restoreFocusFrameRef.current = requestAnimationFrame(() => {
        const selector = finalFocusSelectorRef.current;
        const target = (selector && document.querySelector<HTMLElement>(selector)) || previousFocus;
        target?.focus();
      });
    };
  }, [isOpen]);

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
