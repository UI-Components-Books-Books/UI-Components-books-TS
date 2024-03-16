import { cloneElement, useState, Children, isValidElement, useEffect, useRef, useMemo } from 'react'

import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import type { Over } from '@dnd-kit/core'
import type { Announcements } from '@dnd-kit/core'
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers'


import { ContainerDrag } from './container-drag'
import { Draggable } from './drag'
import { DragAndDropProvider } from './drag-and-drop-context'
import type { ItemType, ModifiersType } from './drag-and-drop-types'
import { Droppable } from './drop'
import { coordinateGetter } from './keyboard-coordinates'

import './drag-and-drop.css'


/**
 * Función utilizada para devolver de los hijos de un
 * componente el elemento de un tipo especifico.
 *
 * @param {ReactElement[]} children - Hijos del componente.
 * @param {String} type - Tipo de componente.
 * @returns {ReactElement[]} Elementos de React que coinciden con el tipo especificado.
 */
const getChildrenByType = (children: React.ReactNode, type: string): React.ReactNode[] => {
  const result: React.ReactNode[] = [];

  Children.map(children, (child) => {
    if (!isValidElement(child)) return;

    // Utilizamos esta validación para prevenir errores cuando son strings.
    if (!child.props) return;

    if (child?.props?.__TYPE === type) {
      result.push(child);
    }

    if (child.props.children) {
      const nestedChildren = getChildrenByType(child.props.children, type);
      result.push(...nestedChildren);
    }
  })

  return result;
};

/**
 * Objeto utilizado para la parte de accesibilidad.
 * este contiene los diferentes anuncios por defecto
 * que los lectores de pantalla dirán cuando se ejecuten
 * los eventos: onDragCancel, onDragStart, onDragEnd y onDragOver.
 */
const defaultAnnouncements: Announcements = {
  onDragStart({ active }) {
    return `Se ha agarrado el elemento arrastrable ${active.data.current?.label}.`
  },
  onDragOver({ active, over }) {
    if (over) {
      return `El elemento arrastrable ${active.data.current?.label} se movió sobre la área desplegable ${over.data.current?.label}.`
    }

    return `El elemento arrastrable ${active.data.current?.label} ya no está sobre una área desplegable.`
  },
  onDragEnd({ active, over }) {
    if (over) {
      return `El elemento arrastrable ${active.data.current?.label} se soltó sobre la área desplegable ${over.data.current?.label}.`
    }

    return `El elemento arrastrable item ${active.data.current?.label} se eliminó.`
  },
  onDragCancel({ active }) {
    return `Se cancelo el arrastre. El elemento arrastrable ${active.data.current?.label} se eliminó.`
  }
}


interface Props {
  id: string;
  children: JSX.Element[] | JSX.Element;
  multipleDrags?: boolean;
  onValidate?: ({ validate, active }: { validate: string[]; active: boolean; }) => void;
  reboot?: boolean;
  validate?: boolean;
  propValidate?: string;
  modifiers?: ModifiersType;
  screenReaderInstructions?: string;
  announcements?: Announcements;
  defaultState?: ItemType;
  defaultValidate?: string[];
  onState?: ({ id, state, validateId }: { id: string, state: ItemType, validateId: string[] }) => void;
}

type subModules = {
  Container: typeof ContainerDrag;
  Drag: typeof Draggable;
  Drop: typeof Droppable;
}

const DragAndDrop: React.FC<Props> & subModules = ({
  children: childrenProps,
  multipleDrags = false,
  onValidate,
  validate = false,
  reboot = false,
  propValidate = 'data-validation',
  modifiers: modifiersProp,
  screenReaderInstructions = 'Para recoger un elemento arrastrable, presiona la barra espaciadora o la tecla Enter. Mientras arrastras, usa las teclas de flecha para mover el elemento en cualquier dirección deseada. Presiona nuevamente la barra espaciadora o la tecla Enter para soltar el elemento en su nueva posición, o presiona escape para cancelar.',
  announcements = defaultAnnouncements,
  defaultState,
  defaultValidate,
  onState,
  id: idDragAndDrop
}) => {
  /**
   * Utilizamos este estado para almacenar la lista
   * de "drags" que están en su contenedor "drop" correcto.
   */
  const [validateId, setValidateId] = useState<string[]>([])

  /**
   * Estado utilizado para almacenar el "id" del elemento "drag"
   * seleccionado. Esto nos ayuda para el DragOverlay y para aplicar
   * estilos al componente cuando está en dicho estado.
   */
  const [activeId, setActiveId] = useState<string | null>(null)

  /**
   * Referencia utilizada como "flag", para que cuando
   * cambie el estado items, envie el nuevo estado la
   * propiedad onState si está existe.
   */
  const flagUpdatedState = useRef<boolean>(false)


  /**
    * Función utilizada para inicializar el estado `items`.
    * Extrae los IDs de los contenedores "drag" y los estructura en un objeto.
    *
    * @returns {ItemType} - Objeto con los IDs de cada elemento "drop".
    */
  const initialState: ItemType = useMemo(() => {
    // Obtenemos los elementos "droppable" y "general-draggable" de los hijos.
    const droppables = getChildrenByType(childrenProps, 'droppable');
    const generalDraggables = getChildrenByType(childrenProps, 'general-draggable');

    // Unimos los elementos "droppable" y "general-draggable".
    const allDraggables = [...droppables, ...generalDraggables] as React.ReactNode[];

    // Reducimos los elementos para estructurar el estado `items`.
    const items = allDraggables.reduce(
      (list, value) => {
        if (!isValidElement(value)) return list;

        const { id, children } = value.props

        // Inicializamos un array para almacenar los IDs de los draggables.
        let dragIds: string[] = [];

        if (children) {
          // Obtenemos los elementos "draggable" dentro del contenedor.
          const dragChildren = getChildrenByType(children, 'draggable');

          // Mapeamos los elementos "draggable" para obtener sus IDs.
          dragIds = dragChildren.map((item) => {
            const draggableId = isValidElement(item) ? item.props.id : null;
            return draggableId || null;
          });
        }

        return {
          ...list,
          [id]: dragIds
        }
      },
      {} as ItemType
    );

    return items;
  }, [childrenProps])



  /**
   * Estado principal del componente, este se encarga
   * de almacenar la posición de los elementos "drag"
   * en los contenedores "drop".
   */
  const [items, setItems] = useState<ItemType>(() =>
    defaultState && Object.keys(defaultState).length > 0 ? defaultState : initialState
  )


  /**
   * Objeto con los modificadores permitidos
   * por el componente.
   */
  const modifiers = Object.freeze({
    restrictToVerticalAxis,
    restrictToHorizontalAxis
  })

  /**
   * Sensores que detectan los
   * diferentes métodos de entrada
   * entre ellos: Mouse, Touch y Keyboard.
   */
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter
    })
  )


  /**
    * Función utilizada para buscar un elemento o contenedor específico en el estado `items`.
    *
    * @param {string} id - El ID del elemento o contenedor a buscar.
    * @returns {string | undefined} - El ID del contenedor encontrado, o `undefined` si no se encuentra.
    */
  const findContainer = (id: string): string | undefined => {
    // Verificar si el ID está directamente en el estado `items`.
    if (id in items) {
      return id;
    }

    // Buscar entre las claves del estado `items` para encontrar el contenedor que contiene el ID.
    const containerId = Object.keys(items).find((key) => items[key].includes(id));

    return containerId;
  };


  /**
   * Función que evalúa si el elemento "drag"
   * dentro del contenedor "drop" es correcto.
   * De esta manera actualizamos nuestro estado validateId.
   *
   * @param {Over} container - Objeto del contenedor "drop".
   * @param {string} id - ID del "drag" seleccionado.
   */
  const validateDrags = (container: Over, id: string) => {
    // Obtenemos la llave que corresponde al elemento base de los drag.
    const baseContainer = Object.keys(items).pop() as string;

    let newArrayValidate = [...validateId];

    // Si el ID se encuentra en el validateId y ahora ese drag
    // se mueve al baseContainer, entonces eliminamos
    // este ID que estaba en el arreglo validateId.
    if (baseContainer === container.id && validateId.includes(id)) {
      newArrayValidate = validateId.filter((item) => item !== id);
    }

    // Si el contenedor no es el baseContainer, actualizamos el newArrayValidate
    if (baseContainer !== container.id) {
      newArrayValidate = [
        ...validateId.filter((item) => item !== id),
        container.data.current?.validate.includes(id) ? id : ''
      ].filter((item) => !!item);
    }

    // Si multipleDrags está en false, filtramos el ID anterior del contenedor
    if (!multipleDrags) {
      const previousItem = items[container.id][0];

      // Eliminamos el valor previo que estaba en el arreglo.
      // De esta manera, si reemplazamos el drag correcto con un nuevo drag, el anterior ya no debe existir
      // en el arreglo de validate porque significa que el nuevo drag es incorrecto.
      newArrayValidate = previousItem
        ? newArrayValidate.filter((item) => item !== previousItem)
        : newArrayValidate;
    }

    // Si existe la función onValidate, la ejecutamos con el nuevo estado
    if (onValidate) {
      onValidate({ validate: [...newArrayValidate], active: true });
    }

    // Actualizamos el estado validateId
    setValidateId(newArrayValidate);
  };


  /**
   * Función utilizada en el evento onDragEnd.
   * Se encarga de actualizar el estado `items`,
   * dependiendo del movimiento del elemento "drag"
   * entre los diferentes contenedores "drop".
   *
   * @param {DragEndEvent} event - Objeto con las propiedades `active` y `over`.
   */
  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Si no hay un contenedor sobre el que se soltó el drag, salimos de la función.
    if (!over) return;

    // Desactivamos el ID activo, ya que el drag terminó.
    setActiveId(null);

    // Convertimos los IDs a strings para compararlos.
    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Obtenemos la llave que corresponde al elemento base de los drag.
    const baseContainer = Object.keys(items).pop() as string;

    // Contenedor en el cual el drag se soltó.
    const overContainer = findContainer(overId);
    // Contenedor donde estaba el drag.
    const activeContainer = findContainer(activeId);

    // Si el drag no se movió entonces no hacemos nada.
    if (activeContainer === overContainer) return;


    // Si no tenemos información de los contenedores, salimos de la función.
    if (!activeContainer || !overContainer || !baseContainer) return;

    // Validamos los drags dentro del contenedor "drop" actual.
    validateDrags(over, activeId);

    setItems((items) => {
      // Actualizamos nuestro flag a true, con esto permite actualizar la propiedad onState.
      // con los cambios de items.
      flagUpdatedState.current = true;

      // Filtramos el ID activo para removerlo de su contenedor anterior.
      const listOfItemsWithoutActiveItem = items[activeContainer].filter(
        (item) => item !== activeId
      );

      // Creamos una copia de los IDs del contenedor "drop" actual.
      const listOfPreviousItems = [...items[overContainer]];

      // Si la propiedad multipleDrags está en true.
      if (multipleDrags) {
        return {
          ...items,
          [activeContainer]: listOfItemsWithoutActiveItem,
          [overContainer]: [...listOfPreviousItems, activeId]
        };
      }

      // Creamos el nuevo estado de los items.
      const newObjectState = {
        ...items,
        [activeContainer]: listOfItemsWithoutActiveItem,
        [overContainer]:
          overContainer === baseContainer
            ? [...listOfPreviousItems, activeId]
            : [activeId]
      };

      return {
        ...newObjectState,
        ...(overContainer !== baseContainer &&
          items[overContainer].length > 0 && {
          [baseContainer]: [
            ...items[baseContainer].filter((item) => item !== activeId),
            ...items[overContainer]
          ]
        })
      };
    });
  };


  /**
    * Función utilizada para actualizar los hijos de elementos que
    * están dentro de la propiedad `children` del componente.
    * En especial se encarga de agregar los elementos "drag" como hijo
    * de los contenedores "drop".
    *
    * @param {React.ReactNode} children - Hijos del componente.
    * @returns {React.ReactNode} - Lista de elementos actualizados.
    */
  const updatedChild = (children: React.ReactNode): React.ReactNode => {
    return Children.map(children, (child) => {
      if (!isValidElement(child)) return child;

      // Si es un "draggable", no se modifica
      if (child.props.__TYPE === 'draggable') return;

      /**
       * Comprueba que el child esté en el estado items y además
       * que tenga uno o más elementos "drag" en su interior.
       */
      if (child.props.id in items && items[child.props.id].length > 0) {
        return cloneElement(child, { ...child.props }, [
          ...items[child.props.id]
            .map((item) =>
              getChildrenByType(childrenProps, 'draggable').filter(
                (drag: React.ReactNode) => isValidElement(drag) ? drag.props.id === item : null
              )
            )
            .flat()
        ]);
      }

      if (child.props.children) {
        return cloneElement(child, {
          ...child.props,
          children: updatedChild(child.props.children)
        });
      }

      return child;
    });
  };


  /**
   * Efecto que se encarga de reiniciar el estado `items`
   * cada vez que la propiedad `reboot` esté en `true`.
   */
  useEffect(() => {
    // Si `reboot` es `true`, ejecutamos las siguientes acciones.
    if (reboot) {
      // Reinicia el estado `items` con la función `initialState`.
      setItems(initialState);

      // Reinicia el estado `validateId` a un arreglo vacío.
      setValidateId([]);

      // Si existe la función `onValidate`, llama a la función con un objeto vacío.
      if (onValidate) {
        onValidate({ validate: [], active: false });
      }
    }
  }, [reboot, onValidate, initialState]);

  /**
   * Efecto que observa los cambios en la propiedad `defaultState`
   * y si esta cambia, actualiza el estado `items`.
   */
  useEffect(() => {
    // Si `defaultState` es `null` o no tiene propiedades, no hacemos nada.
    if (!defaultState || Object.keys(defaultState).length === 0) return;

    // Actualizamos el estado `items` con el valor de `defaultState`.
    setItems(defaultState as ItemType);
  }, [defaultState]);


  /**
   * Efecto que observa los cambios en la propiedad `defaultValidate`
   * y si esta cambia, actualiza el estado `validateId`.
   */
  useEffect(() => {
    // Si `defaultValidate` es `null` o `undefined`, no hacemos nada.
    if (!defaultValidate || defaultValidate.length === 0) return;

    // Actualizamos el estado `validateId` con el valor de `defaultValidate`.
    setValidateId(defaultValidate as string[]);
  }, [defaultValidate]);


  /**
   * Efecto que observa los cambios en el estado `items`
   * y si existe la propiedad `onState`, llama a esta
   * con la información de `items`.
   */
  useEffect(() => {
    if (onState && flagUpdatedState.current) {
      // Reinicia el flag a `false` para futuras actualizaciones.
      flagUpdatedState.current = false;

      // Llama a la función `onState` con el objeto `items` y `validateId`.
      onState({ id: idDragAndDrop, state: { ...items }, validateId });
    }
  }, [onState, items, validateId, idDragAndDrop]);


  return (
    <DragAndDropProvider
      value={{
        listId: validateId,
        propValidate,
        validate,
        isDragging: activeId
      }}
    >
      <DndContext
        sensors={sensors}
        accessibility={{ announcements }}
        screenReaderInstructions={{
          draggable: screenReaderInstructions
        }}
        onDragStart={({ active }) => setActiveId(active.id.toString())}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
        {...(modifiersProp && { modifiers: [modifiers[modifiersProp]] })}
      >
        {updatedChild(childrenProps)}
      </DndContext>
    </DragAndDropProvider>
  )
}


DragAndDrop.Container = ContainerDrag;
DragAndDrop.Drag = Draggable;
DragAndDrop.Drop = Droppable;

export { DragAndDrop }






