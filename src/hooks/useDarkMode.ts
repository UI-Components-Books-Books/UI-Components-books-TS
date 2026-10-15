import { useEffect } from 'react'

import { useLocalStorage } from './useLocalStorage'
import { useMedia } from './useMedia'

/**
 * Hook para manejar el Dark Mode.
 *
 * Agrega y remueve la propiedad "data-dark-mode" del Body element,
 * que sirve para controlar el tema en la aplicación.
 *
 * La elección explícita del usuario (guardada en el localStorage) siempre tiene prioridad.
 * Mientras el usuario no haya elegido, se sigue la preferencia del Navegador o del
 * Sistema Operativo, sin guardarla.
 *
 * @example
 * const [darkMode, setDarkMode] = useDarkMode();
 *
 * @returns {Array} Retornamos nuestro enabled state y el setter.
 */
const useDarkMode = (): [boolean, (value: boolean) => void] => {
    /**
     * Usamos nuestro useLocalStorage Hook para guardar la elección del usuario
     * sin importar que la página se recargue. Su valor inicial es undefined,
     * que significa "el usuario aún no ha elegido".
     */
    const [enableState, setEnableState] = useLocalStorage<boolean | undefined>(
        'dark-mode-enabled',
        undefined
    );

    /**
     * Comprueba si el usuario tiene en Navegador o el Sistema Operativo
     * con preferencia para dark mode.
     */
    const prefersDarkMode = useMedia<boolean>(['(prefers-color-scheme: dark)'], [true], false)

    /**
     * Si enableState está definido entonces usar este, de otra manera usar el valor de
     * prefersDarkMode.
     */
    const enabled = enableState ?? prefersDarkMode

    /**
     * Efecto que agrega/remueve la propiedad "data-dark-mode"
     * del body element.
     */
    useEffect(() => {
        const bodyElement = window.document.body;

        if (enabled) {
            bodyElement.setAttribute('data-dark-mode', 'true');
        } else {
            bodyElement.removeAttribute('data-dark-mode');
        }
    }, [enabled]);

    /**
     * Retornamos nuestro enabled state y el setter.
     */
    return [enabled, setEnableState]
}

export { useDarkMode }
