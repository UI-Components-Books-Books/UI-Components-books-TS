import { useRef, useEffect } from 'react'

/**
 * Crea el elemento DOM que se utilizará como padre.
 *
 * @param {string} id - Id del contenedor
 * @returns {HTMLDivElement} - El elemento div creado con el ID proporcionado
 */
const createRootElement = (id: string): HTMLDivElement => {
    const rootContainer = document.createElement('div');
    rootContainer.setAttribute('id', `${id}-parent`);
    return rootContainer;
}

/**
 * Agrega el elemento como último hijo del Body en el DOM.
 *
 * @param {HTMLElement} rootElem - Elemento a añadir al DOM
 */
const addRootElement = (rootElem: HTMLElement) => {
    document.body.append(rootElem);
}


/**
 * Hook para crear un React Portal.
 *
 * Maneja automaticamente la creación y desmontaje del elemento padre, por lo que no es
 * necesario asegurarse que el elemento ya exista en el Body.
 * @example
 *  const target = usePortal(id);
 *  return createPortal(children, target);
 *
 * @param {string} id - ID del elemento contenedor
 * @returns {HTMLElement} - Elemento que servirá como portal
 */
const usePortal = (id: string): HTMLElement => {
    const rootElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Busca si ya existe un elemento en el DOM con el ID proporcionado
        const existingParent = document.querySelector(`#${id}`) as HTMLElement;

        // Si existe el elemento, usarlo como padre; si no, crear un nuevo elemento DOM.
        const parentElement = existingParent || createRootElement(id);

        // Si no existe un elemento DOM, agregar uno nuevo.
        if (!existingParent) {
            addRootElement(parentElement);
        }

        // Agregar el elemento envoltorio al padre.
        parentElement.append(rootElement.current!);

        return () => {
            // Eliminar el elemento envoltorio al desmontar el componente
            rootElement.current?.remove();

            // Si el padre no tiene hijos después de eliminar el elemento, también eliminarlo
            if (parentElement && !parentElement.childElementCount) {
                parentElement.remove();
            }
        }
    }, [id]);

    /**
   * Es importante manejar esto de forma diferida (lazy):
   * - Se necesita que el primer render contenga el elemento DOM,
   *   pero no podemos agregarlo al useEffect.
   * - No podemos hacer 'const rootElementRef = useRef(document.createLement('div'))'
   *   dado que esto se ejecutará cada vez que se renderice.
   * - Queremos que la referencia apunte siempre al mismo elemento DOM y que sólo se ejecute
   *   una vez.
   * @link https://es.reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
   */
    function getRootElement(id: string): HTMLElement {
        if (!rootElement.current) {
            rootElement.current = document.createElement('div');
            rootElement.current.setAttribute('id', `${id}-wrapper`);
        }
        return rootElement.current;
    }

    return getRootElement(id);
}

export { usePortal }
