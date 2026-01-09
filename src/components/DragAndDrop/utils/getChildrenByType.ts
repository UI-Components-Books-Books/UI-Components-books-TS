import { Children, isValidElement } from 'react'

/**
 * Función utilizada para devolver de los hijos de un
 * componente el elemento de un tipo especifico.
 *
 * @param {ReactElement[]} children - Hijos del componente.
 * @param {String} type - Tipo de componente.
 * @returns {ReactElement[]} Elementos de React que coinciden con el tipo especificado.
 */
export const getChildrenByType = (children: React.ReactNode, type: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];

    Children.map(children, (child) => {
        if (!isValidElement(child)) return;

        // Utilizamos esta validación para prevenir errores cuando son strings.
        if (!child.props) return;

        // Verificamos tanto el _dndType del componente como el __TYPE en las props (retrocompatibilidad)
        const componentType = (child.type as any)?._dndType || child.props.__TYPE;
        
        if (componentType === type) {
            result.push(child);
        }

        if (child.props.children) {
            const nestedChildren = getChildrenByType(child.props.children, type);
            result.push(...nestedChildren);
        }
    })

    return result;
};