import { useState, useRef, useCallback, useEffect } from "react";

interface props {
    onResize: (currentWidth: number) => void;
    onMouseDown: (currentWidth: number) => void;
    onMouseUp: () => void;
    hasElementLoad: boolean;
}

const RESIZE_TYPES = {
    TRACK: 'track',
    HANDLE: 'handle'
}

/**
 * Hook personalizado para gestionar eventos de redimensionamiento y carga de un elemento HTML.
 *
 * Este hook permite controlar fácilmente eventos de redimensionamiento y carga de un elemento HTML, como un contenedor div, utilizando callbacks proporcionados.
 *
 * @example
 *  // Uso en un componente para manejar eventos de redimensionamiento y carga.
 *
 *  const [sizePercentage, setElementRef, setSizePercentage] = useResize({
 *       onResize: (newSize) => console.log('Nuevo tamaño:', newSize),
 *       onMouseDown: () => console.log('Mouse abajo'),
 *       onMouseUp: () => console.log('Mouse arriba'),
 *       hasElementLoad: true
 *  });
 *
 * @param {Object} props - Objeto con las opciones y callbacks para el hook.
 * @param {Function} props.onResize - Callback para manejar eventos de redimensionamiento.
 * @param {Function} props.onMouseDown - Callback para manejar eventos de presionar el ratón.
 * @param {Function} props.onMouseUp - Callback para manejar eventos de soltar el ratón.
 * @param {boolean} props.hasElementLoad - Indica si se desea rastrear el evento de carga del elemento.
 *
 * @returns {Array} sizePercentage - Porcentaje de tamaño actual del elemento.
 * @returns {Array} setElementRef - Función para establecer la referencia del elemento.
 * @returns {Array} setSizePercentage - Función para establecer el tamaño del elemento en porcentaje.
 */
export const useResize = <T extends HTMLElement>({
    onResize,
    onMouseDown,
    onMouseUp,
    hasElementLoad
}: props): [string, (node: T) => void, (currentPercentage: number) => void] => {

    // Estado para los estilos del contenedor redimensionado
    const [styles, setStyles] = useState<string>("0px");
    const [container, setContainer] = useState<T>();


    // Referencia mutable para almacenar información de tamaño y posición
    const size = useRef({ width: 0, base: 0, leftOffset: 0, percentage: 0 });
    const startXRef = useRef(0);
    const isResizing = useRef(false);


    // Función para obtener la referencia del contenedor redimensionable
    const getContinerRef = useCallback((node: T) => {
        if (node) {
            setContainer(node);
        }
    }, []);


    // Función para actualizar el ancho del slider según un porcentaje dado
    const updateSliderWidth = (currentPercentage: number) => {
        // Calcular el nuevo ancho del slider en píxeles
        const newWidth = ((currentPercentage / 100) * size.current.base).toFixed(4);

        // Actualizar el ancho del slider en el estado ref
        size.current.width = parseFloat(newWidth);
        size.current.percentage = currentPercentage

        // Establecer los estilos actualizados para reflejar el nuevo ancho del slider
        setStyles(`${size.current.width}px`);
    };


    // Función para calcular y establecer las medidas iniciales del contenedor
    const calculateInitialContainerSize = () => {
        if (!container) return;

        // Obtener las coordenadas del contenedor respecto al viewport
        const { left } = container.getBoundingClientRect();

        // Establecer el ancho base del contenedor
        size.current.base = container.clientWidth;

        // Establecer el desplazamiento izquierdo del contenedor respecto al viewport
        size.current.leftOffset = left;
    };


    const updatedSlider = (event: MouseEvent) => {
        // Obtener la posición actual del puntero
        const x = event.clientX;
        const deltaX = x - startXRef.current;

        // Calcular el nuevo ancho según el lado de redimensionamiento
        const newWidth = size.current.width + deltaX

        if (newWidth <= size.current.base && newWidth >= 0) {
            const currentPercetage = ((newWidth / size.current.base) * 100).toFixed(3);

            size.current.percentage = parseFloat(currentPercetage)
            size.current.width = newWidth;

            setStyles(`${size.current.width}px`);

            // Actualizar la posición inicial del puntero para la próxima vez
            startXRef.current = x;
        }
    }


    // Función para manejar el evento de clic del puntero
    const onPointerDown = (event: MouseEvent) => {
        // Verificar si hay un objetivo y si el botón clickeado no es el botón derecho
        if (!event.target || event.button === 2) return;

        const targetElement = event.target as HTMLElement;
        const resizeType = targetElement.dataset?.resize;

        if (!resizeType || (resizeType !== RESIZE_TYPES.TRACK && resizeType !== RESIZE_TYPES.HANDLE)) return;

        event.stopPropagation();
        event.preventDefault();

        if (resizeType === RESIZE_TYPES.TRACK) {
            // Inicialización de la posición inicial del puntero si es la primera vez
            if (startXRef.current === 0) {
                startXRef.current = size.current.leftOffset;
            }

            // Actualización del slider y ejecución de la función de callback
            updatedSlider(event);
            onMouseDown?.(size.current.percentage);
        }

        // Guardar la posición inicial del puntero
        startXRef.current = event.clientX;
        // Marcar que se está redimensionando
        isResizing.current = true;

        // Función para manejar el movimiento del puntero durante la redimension
        const onPointerMove = (event: MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();

            updatedSlider(event);

            // Ejecutar la función de callback
            onResize?.(size.current.percentage)

            // Agregamos el atributo 'data-resize-resizing' al container para informar que se está realizando el redimensionamiento.
            container?.setAttribute('data-resize-resizing', `${isResizing.current}`)
        };

        // Función para manejar el levantamiento del puntero después de la redimension
        const onPointerUp = () => {
            if (isResizing.current) {
                if (resizeType === RESIZE_TYPES.HANDLE) {
                    // Avismos que se detuvo la redimension
                    isResizing.current = false;
                    container?.removeAttribute('data-resize-resizing');
                }

                // Ejecutar la función de callback
                onMouseUp?.();

                // Eliminar los listeners de eventos de movimiento y liberación del puntero
                if (resizeType === RESIZE_TYPES.HANDLE) document.removeEventListener("pointermove", onPointerMove);
                document.removeEventListener("pointerup", onPointerUp);
            }
        };

        if (resizeType === RESIZE_TYPES.HANDLE) document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
    };


    useEffect(() => {
        if (!hasElementLoad || !container) return;

        container.addEventListener("pointerdown", onPointerDown);
        // Medir el contenedor antes de iniciar la redimension
        calculateInitialContainerSize();

        return () => {
            container.removeEventListener("pointerdown", onPointerDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [container, hasElementLoad]);


    return [styles, getContinerRef, updateSliderWidth]
}