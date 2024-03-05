
import classnames from 'classnames'

import './content.css'

interface Props {
    addClass?: string,
    children: React.ReactNode;
}

export const Content: React.FC<Props> = ({ children, addClass, ...props }) => {
  return (
    <section
      className={classnames('c-content', addClass ?? "")}
      {...props}
    >
      {children}
    </section>
  )
}
