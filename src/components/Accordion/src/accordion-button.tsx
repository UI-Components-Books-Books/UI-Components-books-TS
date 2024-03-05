import classnames from 'classnames'

import { useAccordionItemContext } from './accordion-context';
import { ExpandLessIcon, ExpandMoreIcon } from './accordion-icons';
import './Accordion.css'

interface Props {
  children: React.ReactNode
  addClass?: string,
  expandedIcon?: React.ReactNode;
  closedIcon?: React.ReactNode;
}

export const AccordionButton: React.FC<Props> = ({
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
      className={classnames('c-accordion__button', addClass)}
      onClick={handleExpanded}
      {...props}
    >
      {children}
      {isExpanded ? closedIcon : expandedIcon}
    </button>
  )
}
