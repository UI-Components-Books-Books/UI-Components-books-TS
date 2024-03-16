import { useState } from 'react'
/**
 * Hook para manejar el localStorage.
 *
 * Maneja automáticamente la creación y actualización de la información en el localStorage.
 * El uso es similar a useState, excepto que pasamos una clave de almacenamiento local para que podamos
 * usar ese valor de forma predeterminada en la carga de la página en lugar del valor inicial especificado.
 *
 * @example
 * // Uso similar a useState, pero con la clave del valor en el localStorage como primer argumento
 * const [name, setName] = useLocalStorage<string>("name", "Bob");
 *
 * @param {string} key - Llave relacionada al valor en el localStorage.
 * @param {any} initialValue - Valor inicial del localStorage.
 *
 * @returns {Array} Retorna una matriz que contiene el valor del localStorage y una función para establecerlo.
 */
const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    /**
     * Estado que va a almacenar nuestro valor.
     * Pasamos la función para el estado inicial a useState,
     * para que esta solo se ejecute una vez.
     */
    const [storedValue, setStoredValue] = useState<T>(() => {
        /**
         * Dado que la API del localStorage no está disponible
         * en server-side rendering, comprobamos su existencia.
         */
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            // Obtenemos el valor del localStorage usando la clave.
            const item = window.localStorage.getItem(key);

            // Convertimos de JSON si no retornamos el valor inicial.
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // Si hay un error, retornamos el valor inicial.
            console.warn(`Error in useLocalStorage: ${error}`);
            return initialValue;
        }
    });

    /**
       * Función utilizada para actualizar el valor del localStorage.
       *
       * @param {*} value - Nuevo valor del localStorage.
       */
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Permitimos que 'value' sea una función para tener la misma API que useState.
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Guardamos el valor en el estado.
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                // Guardamos en el localStorage.
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            // Si hay un error, mostramos un mensaje en la consola.
            console.warn(`Error in useLocalStorage: ${error}`);
        }
    };

    return [storedValue, setValue]
}

export { useLocalStorage }
