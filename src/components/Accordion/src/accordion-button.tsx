import classnames from 'classnames'

import { useAccordionItemContext } from './accordion-context';
import { ExpandLessIcon, ExpandMoreIcon } from './accordion-icons';
import type { AccordionButtonProps } from '../types/types';

import './accordion.css'

export const AccordionButton: React.FC<AccordionButtonProps> = ({
  children,
  addClass,
  expandedIcon = <ExpandMoreIcon />,
  closedIcon = <ExpandLessIcon />,
  ...props
}) => {
  const { uid, isExpanded, handleExpanded } = useAccordionItemContext();

  return (
    <button
      id={`accordion-button-${uid}`}
      aria-controls={`accordion-panel-${uid}`}
      aria-expanded={isExpanded}
      className={classnames('c-accordion__button', { [addClass ?? ""]: addClass })}
      onClick={handleExpanded}
      {...props}
    >
      {children}
      {isExpanded ? closedIcon : expandedIcon}
    </button>
  )
}
