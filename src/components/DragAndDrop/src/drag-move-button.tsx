import { Icon, Popover, usePopoverContext } from "@components";

import { useDragAndDropContext } from "./drag-and-drop-context";
import type { DragMoveButtonProps } from "../types/types";
import { DragAndDropTypes } from "../utils/const";

export const DragMoveButton: React.FC<DragMoveButtonProps> = ({ handleMove, children, label }) => {
  const { availableDropTargets, validate } = useDragAndDropContext();
  const { isPopoverOpen } = usePopoverContext();

  return (
    <>
      <Popover.Button>
        <button
          disabled={validate}
          data-type={DragAndDropTypes.DRAGGABLE_MOVE_BUTTON}
          aria-label={`Control para mover la opción ${label} a los diferentes espacios.`}
          aria-pressed={isPopoverOpen}
          aria-haspopup="menu"
          aria-disabled={validate}
        >
          <Icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="currentColor"
            >
              <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
            </svg>
          </Icon>
        </button>
      </Popover.Button>
      {children}
      <Popover.Content placement="bottom" hasArrow>
        <div role="menu" aria-label="Move options">
          <ul>
            {availableDropTargets && availableDropTargets.length > 0
              ? availableDropTargets.map((dropTarget) => (
                  <li key={dropTarget.id}>
                    <button onClick={() => handleMove(dropTarget.id)}>
                      Mover al {dropTarget.label || dropTarget.id}
                    </button>
                  </li>
                ))
              : ["top", "up", "down", "bottom"].map((position) => (
                  <li key={position}>
                    <button onClick={() => handleMove(position)}>
                      Mover a la posición {position}
                    </button>
                  </li>
                ))}
          </ul>
        </div>
      </Popover.Content>
    </>
  );
};
