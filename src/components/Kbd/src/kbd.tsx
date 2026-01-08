import { cn } from '@utils/cn'

import type { KbdProps } from '../types/types'

import './kbd.css'

export const Kbd: React.FC<KbdProps> = ({ addClass, children, ...props }) => (
    <kbd className={cn('c-kbd', addClass)} {...props} >
        {children}
    </kbd>
)
