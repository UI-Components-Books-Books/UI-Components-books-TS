import { Children, cloneElement, isValidElement } from 'react'

import classnames from 'classnames'
import PropTypes from 'prop-types'

import css from './Tabs.module.scss'
import { getChildrenByType } from '../../../utils/validations/getChildrenType'
import { typeValidation } from '../../../utils/validations/typeValidation'


export const TabPanels = ({
  children: childrenProp,
  addClass,
  defaultStyle,
  __TYPE,
  ...props
}) => {
  // Necesitamos agregar la prop index en los hijos.
  const children = Children.map(childrenProp, (child, index) => {
    if (!isValidElement(child)) return null

    return cloneElement(child, { ...child.props, id: index })
  })

  return (
    <div
      className={classnames({
        [css['c-tab__panels']]: !defaultStyle,
        [addClass]: addClass
      })}
      data-type={__TYPE}
      {...props}
    >
      {/* Filtramos los children para solo aceptar de tipo TabPanel. */}
      {getChildrenByType(children, ['TabPanel'])}
    </div>
  )
}

TabPanels.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
  addClass: PropTypes.string,
  defaultStyle: PropTypes.bool,
  __TYPE: typeValidation('TabPanels')
}

TabPanels.defaultProps = {
  __TYPE: 'TabPanels'
}
