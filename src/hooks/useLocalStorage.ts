import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react'

/**
 * Funciones que React nos entrega para avisar que el almacenamiento cambió.
 * El evento nativo `storage` solo se dispara en las OTRAS pestañas, así que los cambios
 * hechos desde esta se avisan manualmente por medio de este conjunto.
 */
const listeners = new Set<() => void>()

/**
 * Valores que no se pudieron guardar en el localStorage (almacenamiento bloqueado, lleno, etc.).
 * Se conservan en memoria para que el hook siga funcionando durante la sesión.
 * `null` significa que la clave se eliminó.
 */
const fallback = new Map<string, string | null>()

const warn = (error: unknown) => console.warn(`Error in useLocalStorage: ${error}`)

/**
 * Lee el texto guardado (sin convertirlo de JSON).
 * Nunca lanza: React vuelve a llamar esta función en cada render.
 */
const readRaw = (key: string): string | null => {
    if (fallback.has(key)) return fallback.get(key) ?? null

    try {
        return window.localStorage.getItem(key)
    } catch {
        // El acceso al localStorage puede estar bloqueado por el navegador.
        return null
    }
}

/**
 * Guarda (o elimina, si es undefined) el texto de una clave y avisa a todos los hooks suscritos.
 */
const writeRaw = (key: string, raw: string | undefined) => {
    try {
        if (raw === undefined) {
            window.localStorage.removeItem(key)
        } else {
            window.localStorage.setItem(key, raw)
        }
        fallback.delete(key)
    } catch (error) {
        warn(error)
        fallback.set(key, raw ?? null)
    }

    listeners.forEach((listener) => listener())
}

/**
 * Convierte el texto guardado en el valor que representa, o retorna `initialValue`
 * si no hay nada guardado o el JSON es inválido.
 */
const parseRaw = <T>(raw: string | null, initialValue: T): T => {
    if (!raw) return initialValue

    try {
        return JSON.parse(raw) as T
    } catch (error) {
        warn(error)
        return initialValue
    }
}

/**
 * Se suscribe a los cambios del almacenamiento, tanto de esta pestaña como de las demás.
 */
const subscribe = (onChange: () => void) => {
    listeners.add(onChange)
    window.addEventListener('storage', onChange)

    return () => {
        listeners.delete(onChange)
        window.removeEventListener('storage', onChange)
    }
}

/**
 * En el servidor no existe el localStorage: se lee como si estuviera vacío,
 * así el HTML generado y el primer render de la hidratación usan siempre el valor inicial.
 */
const getServerSnapshot = (): string | null => null

/**
 * Hook para manejar el localStorage.
 *
 * Maneja automáticamente la creación y actualización de la información en el localStorage.
 * El uso es similar a useState, excepto que pasamos una clave de almacenamiento local para que podamos
 * usar ese valor de forma predeterminada en la carga de la página en lugar del valor inicial especificado.
 *
 * Es seguro en el servidor (SSR): allí devuelve el valor inicial. Al hidratar en el navegador,
 * el primer render también usa el valor inicial para coincidir con el HTML del servidor y
 * enseguida se actualiza con el valor guardado.
 *
 * Todos los hooks que usen la misma clave se mantienen sincronizados, incluso entre pestañas.
 * Guardar `undefined` elimina la clave.
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
     * Guardamos el valor inicial del primer render: normalmente llega como un literal
     * nuevo en cada render, y así el valor retornado conserva su identidad.
     */
    const initialValueRef = useRef(initialValue)

    /**
     * Texto guardado en el localStorage para la clave.
     */
    const getSnapshot = useCallback(() => readRaw(key), [key])
    const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    /**
     * Convertimos de JSON si hay algo guardado; si no (o si el JSON es inválido),
     * retornamos el valor inicial.
     */
    const storedValue = useMemo<T>(() => parseRaw(raw, initialValueRef.current), [raw])

    /**
       * Función utilizada para actualizar el valor del localStorage.
       *
       * @param {*} value - Nuevo valor del localStorage.
       */
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        // En el servidor no hay dónde guardar nada.
        if (typeof window === 'undefined') return

        try {
            // Permitimos que 'value' sea una función para tener la misma API que useState.
            const valueToStore = value instanceof Function ? value(parseRaw(readRaw(key), initialValueRef.current)) : value

            // Guardamos en el localStorage y avisamos a quienes lo estén leyendo.
            writeRaw(key, JSON.stringify(valueToStore))
        } catch (error) {
            // Si hay un error, mostramos un mensaje en la consola.
            warn(error)
        }
    }, [key])

    return [storedValue, setValue]
}

export { useLocalStorage }
