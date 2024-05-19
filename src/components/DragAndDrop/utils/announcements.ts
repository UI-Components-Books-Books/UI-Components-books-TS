
import type { Announcements } from '@dnd-kit/core'

/**
 * Objeto utilizado para la parte de accesibilidad.
 * este contiene los diferentes anuncios por defecto
 * que los lectores de pantalla dirán cuando se ejecuten
 * los eventos: onDragCancel, onDragStart, onDragEnd y onDragOver.
 */
export const defaultAnnouncements: Announcements = {
    onDragStart({ active }) {
        return `Se ha agarrado el elemento arrastrable ${active.data.current?.label}.`
    },
    onDragOver({ active, over }) {
        if (over) {
            return `El elemento arrastrable ${active.data.current?.label} se movió sobre la área desplegable ${over.data.current?.label}.`
        }

        return `El elemento arrastrable ${active.data.current?.label} ya no está sobre una área desplegable.`
    },
    onDragEnd({ active, over }) {
        if (over) {
            return `El elemento arrastrable ${active.data.current?.label} se soltó sobre la área desplegable ${over.data.current?.label}.`
        }

        return `El elemento arrastrable item ${active.data.current?.label} se eliminó.`
    },
    onDragCancel({ active }) {
        return `Se cancelo el arrastre. El elemento arrastrable ${active.data.current?.label} se eliminó.`
    }
}
