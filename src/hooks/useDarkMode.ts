import { useEffect } from 'react'

import { useLocalStorage } from './useLocalStorage'
import { useMedia } from './useMedia'

/**
 * Hook para manejar el Dark Mode.
 *
 * Agrega y remueve la propiedad "data-dark-mode" del Body element,
 * que sirve para controlar el tema en la aplicación. Además observa
 * las preferencias del usuario frente al modo oscuro.
 *
 * @example
 * const [darkMode, setDarkMode] = useDarkMode();
 *
 * @returns {Array} Retornamos nuestro enabled state y el setter.
 */
const useDarkMode = (): [boolean, (value: boolean) => void] => {
    /**
     * Usamos nuestro useLocalStorage Hook para guardar nuestro
     * estado sin importar que la página se recargue.
     */
    const [enableState, setEnableState] = useLocalStorage<boolean>('dark-mode-enabled', false);

    /**
     * Comprueba si el usuario tiene en Navegador o el Sistema Operativo
     * con preferencia para dark mode.
     */
    const prefersDarkMode = useMedia<boolean>(['(prefers-color-scheme: dark)'], [true], false)

    /**
     * Si enableState está definido entonces usar este, de otra manera usar el valor de
     * prefersDarkMode.
     */
    const enabled = typeof enableState !== 'undefined' ? enableState : prefersDarkMode

    /**
     * Observa cambios en nuestra Media Query y lanza una
     * actualización a nuestro localStorage.
     */
    useEffect(() => {
        setEnableState(prefersDarkMode);
    }, [prefersDarkMode]);

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
