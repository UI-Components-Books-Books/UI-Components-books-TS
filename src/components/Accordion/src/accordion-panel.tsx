import classnames from 'classnames'

import { useAccordionItemContext } from './accordion-context';
import type { AccordionPanelProps } from '../types/types';

import './accordion.css'

export const AccordionPanel: React.FC<AccordionPanelProps> = ({ children, addClass, ...props }) => {
    const { uid, isExpanded } = useAccordionItemContext();

    return (
        <div
            id={`accordion-panel-${uid}`}
            role='region'
            aria-hidden={!isExpanded}
            aria-labelledby={`accordion-button-${uid}`}
            className={classnames('c-accordion__panel', { [addClass ?? ""]: addClass })}
            {...props}
        >
            <div
                className="c-accordion__panel-content"
            >
                {children}
            </div>
        </div>
    )
}
