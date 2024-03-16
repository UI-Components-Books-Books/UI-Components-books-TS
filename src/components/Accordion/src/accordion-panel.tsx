import classnames from 'classnames'

import { useAccordionItemContext } from './accordion-context';
import './Accordion.css'

interface Props {
    children: React.ReactNode,
    addClass?: string,
}

export const AccordionPanel: React.FC<Props> = ({ children, addClass, ...props }) => {
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
