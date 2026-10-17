import type { ContainerDrag } from '../src/container-drag';
import type { Draggable } from '../src/drag';
import type { Droppable } from '../src/drop';
import type { Items } from '../src/items';
import type { Layout, Movement } from '../utils/dnd-state';
import type { MoveSource } from '../utils/dnd-store';
import type { DndMessages } from '../utils/messages';

/**
 * Posiciones de los elementos: cada clave es el id de una zona y su valor, los ids de los
 * drags que están en ella, en orden.
 *
 * @example
 * { banco: ['A', 'B'], zona1: [] }
 */
export type ItemType = Layout;

/** Un movimiento efectivo de un drag entre dos zonas. */
export type { Movement };

/** Textos del componente que se pueden personalizar con la prop `messages`. */
export type { DndMessages };

/**
 * Propiedades comunes a todas las zonas (`Container` y `Drop`).
 *
 * Las zonas pintan sus hijos tal cual: pueden llevar títulos, imágenes o cualquier contenido
 * propio, además de los drags.
 */
export interface ZoneProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'children'> {
  /**
   * Identificador de la zona. Debe ser único dentro del `DragAndDrop`.
   */
  id: string;

  /**
   * Nombre accesible de la zona. Si está vacía, el lector de pantalla la anuncia como "vacía".
   */
  label: string;

  /**
   * Contenido de la zona.
   */
  children?: React.ReactNode;

  /**
   * Clase CSS adicional.
   */
  addClass?: string;

  /**
   * Clase CSS que se agrega mientras un drag que esta zona acepta está encima de ella.
   */
  over?: string;

  /**
   * Cantidad máxima de drags a la vez. Si se suelta uno en una zona llena, el más antiguo vuelve
   * a su `home`. Usa `Infinity` para no limitarla.
   */
  capacity?: number;

  /**
   * Si es `true`, la zona solo acepta el drag que se declaró dentro de ella.
   * Sirve para dar a cada drag su propia celda.
   */
  homeOnly?: boolean;

  /**
   * Si es `true`, los drags se pintan en el orden del estado y el menú de cada drag ofrece
   * reordenarlo dentro de la zona (al inicio, subir, bajar, al final).
   */
  sortable?: boolean;

  /**
   * Ids de los drags que se consideran correctos en esta zona.
   */
  validate?: string[];
}

/**
 * Propiedades para el componente Droppable (`DragAndDrop.Drop`).
 * Por defecto acepta un solo drag a la vez (`capacity = 1`).
 */
export type DroppableProps = ZoneProps;

/**
 * Propiedades para el componente ContainerDrag (`DragAndDrop.Container`).
 * Por defecto no limita la cantidad de drags (`capacity = Infinity`).
 */
export type ContainerDragProps = ZoneProps;

/**
 * Propiedades para el componente Draggable (`DragAndDrop.Drag`).
 */
export interface DraggableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'id' | 'children'> {
  /**
   * Identificador del drag. Debe ser único dentro del `DragAndDrop`.
   */
  id: string;

  /**
   * Nombre accesible del drag. Se usa en el botón de mover y en los anuncios.
   */
  label: string;

  /**
   * Contenido del drag.
   */
  children?: React.ReactNode;

  /**
   * Clase CSS adicional.
   */
  addClass?: string;

  /**
   * Clase CSS que se agrega mientras el drag se está arrastrando.
   */
  dragging?: string;

  /**
   * Bloquea el drag: no se puede arrastrar, ni mover con el menú, ni lo desplaza otro elemento
   * que llegue a su zona (sigue ocupando su lugar, así que esa zona puede quedar sin espacio y
   * dejar de ofrecerse como destino). Al reiniciar vuelve a la zona donde se declaró.
   *
   * Declara el drag dentro de la zona donde debe quedar fijo, por ejemplo un espacio que ya viene
   * completado como pista. El elemento recibe `data-disabled` para poder darle estilo.
   */
  dragDisabled?: boolean;
}

/**
 * Propiedades para el componente DragMoveButton.
 */
export interface DragMoveButtonProps {
  /**
   * Id del drag al que pertenece el botón.
   */
  dragId: string;

  /**
   * Nombre del drag.
   */
  label: string;

  /**
   * Deshabilita el botón.
   */
  disabled?: boolean;

  /**
   * Ref del botón. El drag la usa para devolverle el foco después de moverse.
   */
  buttonRef?: React.Ref<HTMLButtonElement>;

  /**
   * Contenido del drag (se pinta junto al botón).
   */
  children: React.ReactNode;
}

/**
 * Propiedades para el componente DragAndDrop.
 */
export interface DragAndDropProps {
  /**
   * ID del componente DragAndDrop.
   */
  id: string;

  /**
   * Hijos del componente: zonas, drags y cualquier otro contenido.
   */
  children: React.ReactNode;

  /**
   * Indica si la actividad está comprobada. Con `true` nada se puede mover y cada drag recibe
   * `data-validation="true|false"`.
   */
  validate?: boolean;

  /**
   * Se llama después de cada movimiento con los ids de los drags que están en una zona que los
   * considera correctos, y al reiniciar (con `active: false`).
   */
  onValidate?: ({ validate, active }: { validate: string[]; active: boolean }) => void;

  /**
   * Posiciones iniciales de los drags. Si cambia, los drags se reubican. Los que no aparezcan
   * quedan en la zona donde se declararon.
   */
  defaultState?: ItemType;

  /**
   * Se llama después de cada movimiento, reordenamiento o reinicio.
   */
  onState?: ({ id, state, validateId }: { id: string; state: ItemType; validateId: string[] }) => void;

  /**
   * Se llama después de cada movimiento con el detalle de lo que se movió (el drag y, si los hubo,
   * los que tuvieron que dejarle el lugar).
   */
  onMove?: ({ movements, source }: { movements: Movement[]; source: MoveSource }) => void;

  /**
   * Textos que se muestran y se anuncian a los lectores de pantalla. Cualquiera que no se
   * indique usa el texto por defecto (en español).
   */
  messages?: Partial<DndMessages>;
}

/**
 * Tipos de submódulos disponibles para el componente DragAndDrop.
 */
export type DragAndDropSubModules = {
  /**
   * Zona sin límite de drags por defecto; típicamente el banco de elementos.
   */
  Container: typeof ContainerDrag;

  /**
   * Elemento arrastrable.
   */
  Drag: typeof Draggable;

  /**
   * Zona de destino; por defecto acepta un drag.
   */
  Drop: typeof Droppable;

  /**
   * Lugar dentro de una zona donde se pintan los drags que no se declararon en ella.
   */
  Items: typeof Items;
};

/**
 * Una zona disponible como destino.
 */
export interface DropTarget {
  id: string;
  label: string;
}

/**
 * Contexto para el componente DragAndDrop (lo que devuelve `useDragAndDropContext`).
 */
export type DragAndDropContextType = {
  /**
   * Posiciones actuales de los drags.
   */
  layout: ItemType;

  /**
   * Ids de los drags que están ahora en una zona que los considera correctos.
   */
  listId: string[];

  /**
   * Indica si la actividad está comprobada.
   */
  validate: boolean;

  /**
   * ID del elemento que se está arrastrando.
   */
  isDragging: string | null;

  /**
   * Función para reiniciar el DragAndDrop.
   */
  handleResetDnd: () => void;

  /**
   * Lista de zonas disponibles como destino.
   */
  availableDropTargets: DropTarget[];

  /**
   * Mueve un drag a una zona (`target` es el id de la zona) o lo reordena dentro de la suya
   * (`target` es `top`, `up`, `down` o `bottom`; solo en zonas `sortable`).
   */
  handleDragMove: (dragId: string, target: string) => void;
};
