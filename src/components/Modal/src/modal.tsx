import { useEffect, useId, useRef } from "react";

import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import "wicg-inert";

import { ModalCloseButton } from "./modal-close-button";
import { ModalContent } from "./modal-content";
import { ModalProvider } from "./modal-context";
import { ModalOverlay } from "./modal-overlay";
import { Portal } from "../../Portal";
import type { ModalProps, ModalSubModules } from "../types/types";

const Modal: React.FC<ModalProps> & ModalSubModules = ({
  id = "js-modal",
  children,
  isOpen = false,
  onClose,
  finalFocusRef,
  hasCustomModalContentComponent = false,
}) => {
  /**
   * Obtenemos la referencia del modal para
   * agregarle el focus cuando este se abra.
   */
  const refModal = useRef<HTMLDivElement>(null);

  const modalId = useId();

  /**
   * Referencia utilizada como "flag", para que cuando
   * cambie el estado isOpen.
   */
  const flagUpdatedState = useRef(false);

  /**
   * Función para habilitar o deshabilitar la propiedad `inert`
   * en el elemento #root.
   * La propiedad `inert` se utiliza para quitar el focus y la interacción
   * de los elementos contenidos en el elemento #root.
   *
   * @param {boolean} state - Estado para habilitar o deshabilitar `inert`
   */
  const inertToggle = (state: boolean) => {
    // Busca el elemento #root en el DOM
    const root = document.querySelector("#root") as HTMLDivElement;

    // Si no se encuentra el elemento #root, salir de la función
    if (!root) return;

    // Habilita o deshabilita la propiedad `inert` según el estado
    root.inert = state;
  };

  /**
   * Función utilizada para enfocar el elemento
   * disponible cuando se cierra el modal.
   * @param {string | string[]} elements - Elementos que se enfocarán
   */
  const setElementFocusOnModalClose = (elements: string | string[]) => {
    // Obtenemos todos los elementos a los que queremos enfocar
    const listElements = document.querySelectorAll<HTMLElement>(
      elements.toString()
    );
    console.log(
      "🚀 ~ setElementFocusOnModalClose ~ listElements:",
      listElements
    );

    // Iteramos sobre los elementos y los enfocamos
    listElements.forEach((element) => {
      element.focus();
    });
  };

  /**
   * Efecto encargado de mostrar el componente
   * cuando la propiedad isOpen es true.
   */
  useEffect(() => {
    if (isOpen && refModal.current) {
      // Marcamos el estado de actualización como verdadero para rastrear si se ha actualizado.
      flagUpdatedState.current = isOpen;

      // Si el modal está abierto y hay una referencia válida al elemento del modal
      if (refModal.current) {
        // Establecemos el enfoque en el elemento del modal para que el usuario pueda interactuar con él.
        refModal.current.focus();
      }

      // Aplicamos el estado inert al #root
      inertToggle(isOpen);
      return;
    }

    // Cuando el modal se cierra
    if (flagUpdatedState.current) {
      flagUpdatedState.current = isOpen;

      // Quitamos el estado inert del #root
      inertToggle(isOpen);

      setTimeout(() => {
        // Establecemos el enfoque en los elementos que queremos cuando el modal se cierra
        setElementFocusOnModalClose(finalFocusRef);
      }, 100);
    }
  }, [isOpen, refModal, finalFocusRef]);

  return (
    <ModalProvider value={{ onClose, refModal }}>
      <Portal id={id}>
        {hasCustomModalContentComponent ? (
          children
        ) : (
          <AnimatePresence initial={false}>
            {isOpen ? <motion.div key={modalId}>{children}</motion.div> : null}
          </AnimatePresence>
        )}
      </Portal>
    </ModalProvider>
  );
};

Modal.Content = ModalContent;
Modal.Overlay = ModalOverlay;
Modal.CloseButton = ModalCloseButton;

export { Modal };
