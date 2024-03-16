import { createContext as createReactContext, useContext as useReactContext } from 'react';

interface CreateContextOptions<T> {
    name?: string,
    defaultValue?: T
}

type CreateContextReturn<T> = [
    React.Provider<T>,
    () => T,
]

/**
 * Función para crear un contexto personalizado.
 * @param options Opciones de configuración para el contexto.
 * @returns Un array con el proveedor del contexto y la función para acceder al contexto.
 */
export function createContext<T>(options: CreateContextOptions<T> = {}) {
    const {
        name,
        defaultValue
    } = options;

    // Creamos el contexto utilizando la función createContext de React
    const Context = createReactContext<T | undefined>(defaultValue);

    // Asignamos un nombre al contexto (si se proporciona)
    Context.displayName = name;

    // Definimos la función useContext para acceder al contexto
    function useContext() {
        const context = useReactContext(Context);
        return context;
    }

    // Retornamos el proveedor del contexto y la función useContext
    return [Context.Provider, useContext] as CreateContextReturn<T>;
}
