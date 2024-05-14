import { useEffect, useRef, useState } from "react"


/**
 * Hook personalizado para gestionar la funcionalidad de pantalla completa para un elemento específico identificado por su ID.
 *
 * Este hook permite controlar fácilmente el estado de pantalla completa de un elemento específico en la página. Utiliza la API Fullscreen y su funcionalidad asociada.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 *
 * @example
 *  const [isFullScreen, toggleFullScreen] = useFullScreen('myElement');
 *
 * @param {string} uid - Identificador único del elemento que se controlará en pantalla completa.
 *
 * @returns {Array} isFullScreen - Booleano que indica si el elemento está en pantalla completa o no.
 * @returns {Array} toggleFullScreen - Función para alternar el estado de pantalla completa del elemento.
 */
export const useFullScreen = (uid: string): [boolean, () => void] => {
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
    const elementRef = useRef<HTMLElement>();

    // Función para obtener el elemento por su ID
    const getElement = (uid: string): HTMLElement | undefined => {
        if (!elementRef.current && uid) {
            elementRef.current = document.getElementById(uid) as HTMLElement;
        }
        return elementRef.current;
    }

    // Función para alternar el estado de pantalla completa del elemento
    const handleFullScreen = () => {
        const element = getElement(uid);

        if (!element) {
            console.error(`The element with the id "${uid}" is not found.`);
            return;
        }

        let changeFullScreen;

        // Comprobar si el documento está actualmente en modo de pantalla completa
        if (!document.fullscreenElement) {
            // Si no está en pantalla completa, solicitar pantalla completa para el elemento
            element.requestFullscreen();
            changeFullScreen = true;

        } else {
            // Si ya está en pantalla completa, salir de pantalla completa
            document.exitFullscreen();
            changeFullScreen = false;
        }

        setIsFullScreen(changeFullScreen);
    }

    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement && isFullScreen) {
                setIsFullScreen(false);
            }
        }

        document.addEventListener("fullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
        }
    }, [uid, isFullScreen]);


    return [isFullScreen, handleFullScreen];
}
