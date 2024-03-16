import { useState, forwardRef } from 'react'

import classnames from 'classnames'

import { imageBase } from './image-base'
import './image.css'

interface Props {
    url?: string,
    alt?: string,
    title?: string,
    size?: string,
    addClass?: string,
    noCaption?: boolean,
}

export const Image: React.FC<Props> = forwardRef<HTMLImageElement, Props>(function Image({
    url = 'default',
    alt = 'Default image.',
    title = 'Image 1.',
    size,
    addClass,
    noCaption = false,
    ...props
}, ref) {

    // Estado para determinar si se muestra la imagen por defecto.
    const [error, setError] = useState<boolean>(false)

    /**
     * Función de error, al no conseguir la imagen cambia el estado setError
     * y muestra la imagen por defecto.
     *
     */
    const onError = (): void => {
        setError(!error)
    }

    /**
     * Condicionamos que imagen se va a mostrar
     * dependiendo del valor del estado error.
     */
    const imgToSee = !error ? url : imageBase



    return (
        <figure
            className={classnames('c-image', { [addClass ?? ""]: addClass })}
            {...(size && { style: { '--image-max-width': size } as React.CSSProperties })}
        >
            <img
                ref={ref}
                src={imgToSee}
                onError={onError}
                alt={alt}
                {...props}
            />

            {!noCaption && (
                <figcaption className='c-image__figcaption'>
                    <p>
                        <strong>{title}&nbsp;</strong>
                        {alt}
                    </p>
                </figcaption>
            )}
        </figure>
    )
})



