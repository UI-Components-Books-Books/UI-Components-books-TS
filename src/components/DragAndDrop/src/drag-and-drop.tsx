import { Children, cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';


import { ContainerDrag } from './container-drag';
import { Draggable } from './drag';
import { DragAndDropProvider } from './drag-and-drop-context';
import { Droppable } from './drop';
import type { DragAndDropProps, DragAndDropSubModules, ItemType } from '../types/types';
import { DragAndDropTypes } from '../utils/const';
import { getChildrenByType } from '../utils/getChildrenByType';


// Interfaz para los destinos de drop disponibles
interface DropTarget {
  id: string;
  label?: string;
}

const DragAndDrop: React.FC<DragAndDropProps> & DragAndDropSubModules = ({
  id: idDragAndDrop,
  children: childrenProps,
  multipleDrags = false,
  onValidate,
  validate = false,
  announcements,
  defaultState,
  defaultValidate,
  onState
}) => {
  // Estado para almacenar los "drags" validados
  const [validateId, setValidateId] = useState<string[]>([]);

  // Estado para el elemento "drag" activo
  const [activeId, setActiveId] = useState<string | null>(null);

  // Estado para los destinos de drop disponibles
  const [dropTargets, setDropTargets] = useState<DropTarget[]>([]);

  // Ref para rastrear si es el primer render
  const isFirstRender = useRef(true);

  /**
   * Helper para obtener todos los contenedores (droppables + containers)
   */
  const getAllContainers = useMemo(() => {
    const droppables = getChildrenByType(childrenProps, DragAndDropTypes.DROPPABLE);
    const generalDraggables = getChildrenByType(childrenProps, DragAndDropTypes.CONTAINER);
    return [...droppables, ...generalDraggables] as React.ReactNode[];
  }, [childrenProps]);

  /**
   * Inicializa el estado de items basado en los hijos
   */
  const initialState: ItemType = useMemo(() => {
    const allDraggables = getAllContainers;

    const items = allDraggables.reduce((list, value) => {
      if (!isValidElement(value)) return list;

      const { id, children } = value.props;

      let dragIds: string[] = [];
      if (children) {
        const dragChildren = getChildrenByType(children, DragAndDropTypes.DRAGGABLE);
        dragIds = dragChildren.map((item) => (isValidElement(item) ? item.props.id : null)).filter(Boolean);
      }

      return {
        ...list,
        [id]: dragIds
      };
    }, {} as ItemType);

    return items;
  }, [getAllContainers]);

  /**
   * Actualiza los targets de drop disponibles cuando cambian los hijos
   */
  useEffect(() => {
    const newDropTargets: DropTarget[] = [];

    getAllContainers.forEach((value) => {
      if (isValidElement(value)) {
        const { id, label } = value.props;
        if (id) {
          newDropTargets.push({ id, label: label || id });
        }
      }
    });

    setDropTargets(newDropTargets);
  }, [getAllContainers]);

  /**
   * Estado principal de posicionamiento de elementos
   */
  const [items, setItems] = useState<ItemType>(() =>
    defaultState && Object.keys(defaultState).length > 0 ? defaultState : initialState
  );

  /**
   * Encuentra el contenedor que contiene un elemento específico
   */
  const findContainer = useCallback((id: string): string | undefined => {
    if (id in items) {
      return id;
    }
    return Object.keys(items).find((key) => items[key].includes(id));
  }, [items]);

  /**
   * Valida si un drag está en la posición correcta
   */
  const validateDrags = useCallback((containerId: string, dragId: string, currentItems: ItemType) => {
    setValidateId((prevValidateId) => {
      let newArrayValidate = [...prevValidateId];

      // Verificamos si el contenedor es un Drop (tiene atributo data-validate)
      const dropElement = document.querySelector(`[data-drop-id="${containerId}"]`);
      const hasValidateAttribute = dropElement?.hasAttribute('data-validate');

      // Si es un Drop (Droppable), verificamos si el drag es válido para ese drop
      if (hasValidateAttribute) {
        const validIds = dropElement?.getAttribute('data-validate')?.split(',').map(id => id.trim()) || [];
        const isValid = validIds.includes(dragId);

        // Removemos el dragId de la lista y lo agregamos solo si es válido
        newArrayValidate = prevValidateId.filter((item) => item !== dragId);
        if (isValid) {
          newArrayValidate.push(dragId);
        }
      } 
      // Si es un Container (no tiene data-validate), removemos de la validación
      else {
        newArrayValidate = prevValidateId.filter((item) => item !== dragId);
      }

      // Para drag único, quitamos el elemento anterior del contenedor de la validación
      if (!multipleDrags && currentItems[containerId]?.length > 0) {
        const itemsInContainer = currentItems[containerId].filter(id => id !== dragId);
        if (itemsInContainer.length > 0) {
          const previousItem = itemsInContainer[0];
          newArrayValidate = newArrayValidate.filter((item) => item !== previousItem);
        }
      }

      // Notificamos cambios de validación
      if (onValidate) {
        onValidate({ validate: newArrayValidate, active: true });
      }

      return newArrayValidate;
    });
  }, [multipleDrags, onValidate]);

  /**
   * Maneja el movimiento de elementos, sea por arrastre o menú contextual
   */
  // Función para garantizar que un elemento esté solo en un contenedor
  const ensureElementExistsOnlyOnce = useCallback((
    currentState: ItemType,
    elementId: string,
    targetContainerId: string
  ): ItemType => {
    // Crear una copia nueva del estado
    const newState = { ...currentState };

    // Eliminar el elemento de todos los contenedores
    Object.keys(newState).forEach((containerId) => {
      newState[containerId] = newState[containerId].filter((id) => id !== elementId);
    });

    // Añadir el elemento solo al contenedor destino
    newState[targetContainerId] = [...newState[targetContainerId], elementId];

    return newState;
  }, []);

  // Función de manejo de movimiento simplificada
  const handleItemMove = useCallback((dragId: string, targetContainerId: string) => {
    // Desactivamos el elemento activo
    setActiveId(null);

    // Actualizamos el estado garantizando que el elemento esté en un solo lugar
    setItems((prevItems) => {
      // Si no permitimos múltiples elementos y ya hay algo en el destino
      if (!multipleDrags && prevItems[targetContainerId].length > 0) {
        const baseContainer = Object.keys(prevItems).pop() as string;
        const displacedItem = prevItems[targetContainerId][0];

        // Primero movemos el elemento desplazado al contenedor base
        let newState = ensureElementExistsOnlyOnce(prevItems, displacedItem, baseContainer);

        // Luego movemos el elemento arrastrado al destino
        newState = ensureElementExistsOnlyOnce(newState, dragId, targetContainerId);

        // Validamos después de calcular el nuevo estado
        validateDrags(targetContainerId, dragId, newState);

        return newState;
      }

      // Caso simple: solo movemos el elemento arrastrado
      const newState = ensureElementExistsOnlyOnce(prevItems, dragId, targetContainerId);
      
      // Validamos después de calcular el nuevo estado
      validateDrags(targetContainerId, dragId, newState);
      
      return newState;
    });

    setTimeout(() => {
      announcements?.();
    }, 100);
  }, [announcements, ensureElementExistsOnlyOnce, multipleDrags, validateDrags]);

  /**
   * Maneja el movimiento por menú contextual
   */
  const handleDragMove = useCallback((dragId: string, targetDropId: string) => {
    // Manejo de comandos especiales: top, up, down, bottom (reordenamiento)
    if (['top', 'up', 'down', 'bottom'].includes(targetDropId)) {
      setItems((prevItems) => {
        const sourceContainerId = Object.keys(prevItems).find((key) => prevItems[key].includes(dragId));
        if (!sourceContainerId) return prevItems;
        
        const orderedContainerId = Object.keys(prevItems).find((key) => prevItems[key].length > 1);
        if (!orderedContainerId) return prevItems;

        const containerItems = [...prevItems[orderedContainerId]];
        const currentIndex = containerItems.indexOf(dragId);

        if (currentIndex === -1) return prevItems;

        // Reordenamos el elemento según el comando
        containerItems.splice(currentIndex, 1);

        switch (targetDropId) {
          case 'top':
            containerItems.unshift(dragId);
            break;
          case 'up':
            containerItems.splice(Math.max(0, currentIndex - 1), 0, dragId);
            break;
          case 'down':
            containerItems.splice(Math.min(containerItems.length, currentIndex + 1), 0, dragId);
            break;
          case 'bottom':
            containerItems.push(dragId);
            break;
        }
        
        return {
          ...prevItems,
          [orderedContainerId]: containerItems
        };
      });
      return;
    }

    // Para movimiento entre contenedores
    handleItemMove(dragId, targetDropId);
  }, [handleItemMove]);

  /**
   * Maneja el fin de un arrastre
   */
  const handleDragEnd = useCallback((dragId: string, dropId: string) => {
    setActiveId(null);

    const targetContainerId = findContainer(dropId);
    const sourceContainerId = findContainer(dragId);

    if (!sourceContainerId || !targetContainerId) {
      return;
    }

    handleItemMove(dragId, dropId);
  }, [findContainer, handleItemMove]);

  /**
   * Inicializamos los monitores de drag and drop
   */
  const initializeDragAndDrop = useCallback(() => {
    return monitorForElements({
      onDragStart: (event) => {
        const dragId = event.source.element.getAttribute('data-drag-id');
        if (dragId) {
          setActiveId(dragId);
        }
      },
      onDrop: (event) => {
        if (!event.location.current.dropTargets.length) {
          setActiveId(null);

          return;
        }

        const dragId = event.source.element.getAttribute('data-drag-id');
        const dropTarget = event.location.current.dropTargets[0];
        const dropId = dropTarget.element.getAttribute('data-drop-id');

        if (dragId && dropId) {
          handleDragEnd(dragId, dropId);
        } else {
          setActiveId(null);
        }
      },
      onDropTargetChange: () => {
        // Podríamos actualizar un estado visual aquí para mostrar feedback
        // de sobre qué contenedor está el elemento
      }
    });
  }, [handleDragEnd]);

  /**
   * Map de draggables para búsquedas O(1)
   */
  const draggablesMap = useMemo(() => {
    const originalDrags = getChildrenByType(childrenProps, DragAndDropTypes.DRAGGABLE);
    const map = new Map<string, React.ReactElement>();
    
    originalDrags.forEach((drag) => {
      if (isValidElement(drag) && drag.props.id) {
        map.set(drag.props.id, drag);
      }
    });
    
    return map;
  }, [childrenProps]);

  /**
   * Actualiza los hijos con el estado actual
   */
  const updatedChild = useCallback((children: React.ReactNode): React.ReactNode => {
    return Children.map(children, (child) => {
      if (!isValidElement(child)) return child;

      // Para todos los elementos con ID en nuestro estado
      if (child.props.id && child.props.id in items) {
        // Solo necesitamos los draggables que corresponden a este contenedor según el estado
        const containerId = child.props.id;
        const containerItems = items[containerId];

        // Obtenemos los elementos draggable que deben estar en este contenedor
        const dragElements = containerItems
          .map((dragId) => {
            // Búsqueda O(1) en el Map
            const matchingDrag = draggablesMap.get(dragId);

            // Si encontramos el elemento, lo clonamos con las props necesarias
            if (matchingDrag) {
              return cloneElement(matchingDrag, {
                ...matchingDrag.props,
                key: dragId,
                handleDrag: handleDragMove
              });
            }
            return null;
          })
          .filter(Boolean);

        // Devolvemos el contenedor con sus elementos correspondientes
        return cloneElement(child, { ...child.props }, dragElements);
      }

      // Procesamiento recursivo para elementos con hijos
      if (child.props.children) {
        return cloneElement(child, {
          ...child.props,
          children: updatedChild(child.props.children)
        });
      }

      return child;
    });
  }, [draggablesMap, handleDragMove, items]);

  /**
   * Reestablece el estado del componente
   */
  const handleResetDnd = useCallback(() => {
    setItems(initialState);
    setValidateId([]);

    if (onValidate) {
      onValidate({ validate: [], active: false });
    }
  }, [initialState, onValidate]);

  // Efecto para inicializar el sistema de drag and drop
  useEffect(() => {
    const cleanup = initializeDragAndDrop();
    return () => {
      cleanup();
    };
  }, [initializeDragAndDrop]);

  // Efecto para actualizar el estado cuando cambia defaultState
  useEffect(() => {
    if (defaultState && Object.keys(defaultState).length > 0) {
      isFirstRender.current = true;
      setItems(defaultState as ItemType);
    }
  }, [defaultState]);

  // Efecto para actualizar validateId cuando cambia defaultValidate
  useEffect(() => {
    if (defaultValidate && defaultValidate.length > 0) {
      setValidateId(defaultValidate as string[]);
    }
  }, [defaultValidate]);

  // Efecto para notificar cambios de estado (excepto en el primer render y cuando viene de props)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (onState) {
      onState({
        id: idDragAndDrop,
        state: { ...items },
        validateId
      });
    }
  }, [items, validateId, idDragAndDrop, onState]);

  // Prevenir notificación cuando cambia defaultState desde props
  useEffect(() => {
    if (defaultState && Object.keys(defaultState).length > 0) {
      isFirstRender.current = true;
    }
  }, [defaultState]);

  return (
    <DragAndDropProvider
      value={{
        listId: validateId,
        validate,
        isDragging: activeId,
        handleResetDnd,
        availableDropTargets: dropTargets,
        handleDragMove
      }}>
      {updatedChild(childrenProps)}
    </DragAndDropProvider>
  );
};

DragAndDrop.Container = ContainerDrag;
DragAndDrop.Drag = Draggable;
DragAndDrop.Drop = Droppable;

export { DragAndDrop };
