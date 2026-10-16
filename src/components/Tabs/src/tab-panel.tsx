import { cn } from '@utils/cn';

import { useTabsContext } from './tabs-context';
import type { TabPanelProps } from '../types/types';

import './tabs.css'

export const TabPanel: React.FC<TabPanelProps> = ({ id, children, addClass, ...props }) => {
  // Obtenemos la función validation del contexto
  const { uid, handleValidation } = useTabsContext();

  // Determina si este tab está seleccionado
  const isSelected = handleValidation(id!);

  return (
    <div
      id={`${uid}-panel-${id}`}
      role="tabpanel"
      tabIndex={0}
      aria-hidden={!isSelected}
      hidden={!isSelected}
      aria-labelledby={`${uid}-tab-${id}`}
      className={cn('c-tab__panel', {
        'c-tab__panel--active': isSelected,
        [addClass ?? ""]: addClass
      })}
      {...props}>
      {children}
    </div>
  );
};
