import classnames from 'classnames'

import type { KbdProps } from '../types/types'

import './kbd.css'

export const Kbd: React.FC<KbdProps> = ({ addClass, children, ...props }) => (
    <kbd className={classnames('c-kbd', { [addClass ?? ""]: addClass })} {...props} >
        {children}
    </kbd>
)
