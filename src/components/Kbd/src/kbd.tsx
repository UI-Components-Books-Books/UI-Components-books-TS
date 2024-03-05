import classnames from 'classnames'

import './kbd.css'

interface Props {
    children: React.ReactNode
    addClass?: string
}

export const Kbd: React.FC<Props> = ({ addClass, children, ...props }) => {
    return (
        <kbd className={classnames('c-kbd', addClass ?? "")} {...props} >
            {children}    
        </kbd>
    )
}
