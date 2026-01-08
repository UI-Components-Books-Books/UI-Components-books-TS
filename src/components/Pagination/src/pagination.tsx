import { usePagination } from "@hooks";
import { cn } from "@utils/cn";

import { PaginationItem } from "./pagination-item";
import type {
  PaginationProps,
  PaginationSubModules,
  TypeElement,
} from "../types/types";
import { defaultAriaLabel } from "../utils/defaultAriaLabel";

import "./pagination.css";

const Pagination: React.FC<PaginationProps> & PaginationSubModules = ({
  renderItem = (item) => <PaginationItem {...item} />,
  getItemAriaLabel = defaultAriaLabel,
  addClass,
  label,
  ...props
}) => {
  /**
   * Se utiliza el custom hook usePagination para
   * obtener la paginación.
   */
  const { items } = usePagination({ ...props });

  return (
    <nav
      role="navigation"
      className={cn("c-pagination", addClass)}
      {...(label && { "aria-label": label })}
    >
      <ul className="c-pagination__ul">
        {items.map((item, index) => (
          <li key={`pagination-item-${index}`}>
            {/* Utilizamos la render-prop para agregar el elemento que va a estar dentro del tag li */}
            {renderItem({
              ...item,
              "aria-label": getItemAriaLabel
                ? getItemAriaLabel(
                    item.type as TypeElement,
                    item.selected,
                    item.page
                  )
                : "",
            })}
          </li>
        ))}
      </ul>
    </nav>
  );
};

Pagination.Item = PaginationItem;

export { Pagination };
