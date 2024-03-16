import { useState, useEffect, useMemo } from 'react'

import 'wicg-inert'
import { TourProvider } from './tour-context'
import { TourElement } from './tour-element'
import { TourHelpLayer } from './tour-layer'
import type { stepType } from './tour-types'
import { TourStateEnum } from './tour-types'
import { Portal } from '../../Portal'


import './tour.css'

interface Props {
    steps: Array<stepType>;
    isOpen: boolean;
    onClose: () => void;
    finalFocusRef: string | string[];
    children: JSX.Element[] | JSX.Element;
}

type subModule = {
    Layer: typeof TourHelpLayer;
    Modal: typeof TourElement
}

const Tour: React.FC<Props> & subModule = ({ steps, isOpen = false, onClose, finalFocusRef, children }) => {
    // Estado utilizado para almacenar el id del elemento activado.
    const [activeId, setActiveId] = useState<number>(TourStateEnum.default);

    /**
     * Creamos un array con todos los objetos contenidos en la propiedad steps
     * y además agregamos la prop id.
     */
    const items = useMemo(() => {
        return steps.reduce((list: stepType[], item: stepType, index: number) => {
            if (!item.target) return list;

            const isValidElement = document.querySelector(item.target);

            if (isValidElement) {
                list.push({ id: index + 1, ...item });
            }
            return list;
        }, []);
    }, [steps]);

    /**
     * Función utilizada para encontrar un objeto a partir de la propiedad id.
     *
     * @param {number} uid - Id del objeto a buscar.
     * @returns {stepType | object} - Objeto que concuerda con el id.
     */
    const findElement = (uid: number): stepType | object => {
        return items
            .filter((item) => item.id === uid)
            .reduce((object, item) => ({ ...object, ...item }), {});
    };

    /**
     * Función para habilitar o deshabilitar la propiedad `inert`
     * en el elemento #root. La propiedad `inert` se utiliza para quitar
     * el focus y la interacción de los elementos contenidos en el elemento #root.
     *
     * @param {boolean} state - Estado para habilitar o deshabilitar `inert`
     */
    const inertToggle = (state: boolean) => {
        // Busca el elemento #root en el DOM
        const root = document.querySelector('#root') as HTMLDivElement;

        // Si no se encuentra el elemento #root, salir de la función
        if (!root) return;

        // Habilita o deshabilita la propiedad `inert` según el estado
        root.inert = state;
    };

    /**
     * Función utilizada para mover el tour al siguiente elemento.
     */
    const onNextElement = () => {
        setActiveId((prev) => (prev < items.length ? prev + 1 : prev));
    };

    /**
     * Función utilizada para mover el tour al elemento anterior.
     */
    const onPrevElement = () => {
        setActiveId((prev) => (prev > 0 ? prev - 1 : prev));
    };

    /**
     * Función utilizada para enfocar el elemento disponible cuando se cierra el modal.
     * @param {string | string[]} elements - Elementos que se enfocarán
     */
    const setElementFocusOnModalClose = (elements: string | string[]) => {
        // Obtenemos todos los elementos a los que queremos enfocar
        const listElements = document.querySelectorAll<HTMLElement>(elements.toString());

        // Iteramos sobre los elementos y los enfocamos
        listElements.forEach((element) => {
            element.focus();
        });
    };

    /**
     * Función utilizada cerrar el tour, reiniciar los diferentes estados y
     * mover el focus al elemento pasado a través de la propiedad finalFocusRef.
     */
    const onCloseTour = () => {
        setActiveId(TourStateEnum.default);
        inertToggle(false);

        if (onClose) {
            onClose();
        }

        if (finalFocusRef) {
            setElementFocusOnModalClose(finalFocusRef);
        }
    };

    /**
     * Efecto encargado de mostrar el componente cuando la propiedad isOpen es true.
     */
    useEffect(() => {
        if (isOpen) {
            setActiveId(TourStateEnum.start);
            inertToggle(isOpen);
        }
    }, [isOpen]);

    return (
        <TourProvider
            value={{
                isOpen,
                lastId: items.length,
                ...findElement(activeId),
                methods: {
                    onNext: onNextElement,
                    onPrev: onPrevElement,
                    onClose: onCloseTour
                },
            }}
        >
            <Portal id='js-tour'>
                {isOpen && children}
            </Portal>
        </TourProvider>
    )
}

Tour.Modal = TourElement;
Tour.Layer = TourHelpLayer;

export { Tour }