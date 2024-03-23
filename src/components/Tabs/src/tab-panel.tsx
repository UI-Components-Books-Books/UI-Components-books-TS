import classnames from 'classnames';

import { useTabsContext } from './tabs-context';

import './tabs.css'

interface Props {
  id?: number;
  children: React.ReactNode | React.ReactNode[];
  addClass?: string;
}

export const TabPanel: React.FC<Props> = ({ id, children, addClass, ...props }) => {
  // Obtenemos la función validation del contexto
  const { handleValidation } = useTabsContext();

  // Determina si este tab está seleccionado
  const isSelected = handleValidation(id!);

  return (
    <div
      id={`panel-${id}`}
      role="tabpanel"
      tabIndex={0}
      aria-hidden={!isSelected}
      hidden={!isSelected}
      aria-labelledby={`tab-${id}`}
      className={classnames('c-tab__panel', {
        'c-tab__panel--active': isSelected,
        ['video-interpreter-ui-tabpanel']: 'video-interpreter-ui-tabpanel',
        [addClass ?? ""]: addClass
      })}
      {...props}>
      {children}
    </div>
  );
};
