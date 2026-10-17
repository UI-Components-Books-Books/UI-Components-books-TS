import { Icon, Popover, usePopoverContext } from "@components";

import { useDndInternal, useDndSnapshot } from "./drag-and-drop-context";
import type { DragMoveButtonProps } from "../types/types";
import { DragAndDropTypes } from "../utils/const";
import { locate, reorderDrag, type ReorderCommand } from "../utils/dnd-state";

const REORDER_COMMANDS: ReorderCommand[] = ["top", "up", "down", "bottom"];

/**
 * Botón (⋮) que abre el menú para mover un elemento sin arrastrarlo.
 *
 * Es la alternativa al arrastre para quien no puede o no quiere usar el puntero (teclado, lector
 * de pantalla, tacto): ofrece los mismos resultados que arrastrar. Cada opción es un botón
 * normal dentro de un diálogo; no se usa `role="menu"` porque eso exigiría la navegación con
 * flechas propia de los menús.
 */
export const DragMoveButton: React.FC<DragMoveButtonProps> = ({ dragId, label, disabled, buttonRef, children }) => {
  const { store, messages } = useDndInternal();
  const { layout, zones } = useDndSnapshot();
  const { closePopover } = usePopoverContext();

  const targets = store.targetsFor(dragId);

  // Reordenar solo se ofrece en zonas `sortable`, y solo los comandos que cambiarían algo.
  const currentZone = locate(layout, dragId);
  const reorderOptions =
    currentZone !== undefined && zones[currentZone]?.sortable
      ? REORDER_COMMANDS.filter((command) => reorderDrag(layout, dragId, command) !== layout)
      : [];

  // Se cierra el menú y se pide devolver el foco al botón del elemento una vez movido.
  const run = (action: () => void) => {
    closePopover();
    action();
  };

  return (
    <>
      <Popover.Button>
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          data-type={DragAndDropTypes.DRAGGABLE_MOVE_BUTTON}
          aria-label={messages.moveButton({ drag: label })}
        >
          <Icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
            </svg>
          </Icon>
        </button>
      </Popover.Button>
      {children}
      <Popover.Content placement="bottom" hasArrow aria-label={messages.moveMenu({ drag: label })}>
        {targets.length > 0 || reorderOptions.length > 0 ? (
          <ul className="c-draggable-menu">
            {targets.map((target) => (
              <li key={target.id}>
                <button
                  type="button"
                  onClick={() => run(() => store.move(dragId, target.id, { source: "menu", restoreFocus: true }))}
                >
                  {messages.moveTo({ zone: target.label })}
                </button>
              </li>
            ))}
            {reorderOptions.map((command) => (
              <li key={command}>
                <button
                  type="button"
                  onClick={() => run(() => store.reorder(dragId, command, { restoreFocus: true }))}
                >
                  {messages.reorderOption({ command })}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>{messages.noMoves()}</p>
        )}
      </Popover.Content>
    </>
  );
};
