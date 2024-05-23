import { useState, useRef, useId } from 'react'

import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion';
import Draggable from 'react-draggable'
import type { DraggableEventHandler } from 'react-draggable'

import { SHOW_VIDEO } from './const'
import { CloseIcon, DotIcon, HandsIcon, LaptopIcon, MoveArrowIcon } from './interpreter-icons'
import { VideoPlayer } from './interpreter-video-player'
import { Icon } from '../../Icon'

import './interpreter.css'


interface Props {
    accesibilityURL?: string;
    contentURL?: string;
    addClass?: string;
    icon?: JSX.Element;
}

interface VideoProps {
    URLs: {
        accesibilityURL?: string,
        contentURL?: string
    },
    resetDragPosition: () => void;
    icon: JSX.Element;
}

export const Interpreter: React.FC<Props> = ({
    accesibilityURL,
    contentURL,
    addClass,
    icon = <HandsIcon />,
    ...props
}) => {
    const [positionDrag, setPositionDrag] = useState({
        deltaPosition: {
            x: 0,
            y: 0
        },
    });

    const dragRef = useRef(null);

    /**
     * Función para manejar el evento de arrastre de un elemento.
     *
     * @param {Event} event - Evento del drag.
     * @param {object} data - Información sobre el arrastre.
     */
    const handleDrag: DraggableEventHandler = (_, data) => {
        // Obtener las coordenadas actuales de la posición del arrastre
        const { x, y } = positionDrag.deltaPosition;

        // Actualizar la posición del arrastre agregando los cambios de deltaX y deltaY
        setPositionDrag({
            deltaPosition: {
                x: x + data.deltaX,
                y: y + data.deltaY,
            },
        });
    };

    /**
     * Función para restablecer la posición del elemento arrastrado a (0, 0).
     */
    const resetDragPosition = () => {
        // Restablecer la posición del elemento arrastrado a (0, 0)
        setPositionDrag({
            deltaPosition: {
                x: 0,
                y: 0,
            },
        });
    };

    return (
        <Draggable handle=".js-c-interpreter-draggable" nodeRef={dragRef} position={positionDrag.deltaPosition} onDrag={handleDrag}>
            <div ref={dragRef} className={classNames('c-interpreter__container', { [addClass ?? ""]: addClass })} {...props}>
                <Video resetDragPosition={resetDragPosition} URLs={{ accesibilityURL, contentURL }} icon={icon} />
            </div>
        </Draggable>
    )
}


const Video: React.FC<VideoProps> = ({ URLs, resetDragPosition, icon, ...props }) => {
    const [displayVideo, setDisplayVideo] = useState<string | null>(null);
    const [hidden, setHidden] = useState<boolean>(true);

    const uid = useId();

    const { accesibilityURL, contentURL } = URLs

    /**
     * Función para alternar el estado de "hidden" y mostrar u ocultar el video.
     */
    const toggleHidden = () => {
        // Alternar el estado de "hidden"
        setHidden(!hidden);
    };

    /**
     * Función para alternar la visualización de los videos.
     * Cambia entre los videos disponibles en el objeto SHOW_VIDEO.
     *
     * @param {string | undefined} video - El video al que se desea cambiar. Si no se proporciona, establece el video en null.
     */
    const toggleDisplayVideo = (video?: string) => {
        // Si se proporciona un video, establecerlo como el nuevo video a mostrar,
        // de lo contrario, establecer el video en null para ocultarlo
        setDisplayVideo(video ?? null);
    };

    /**
     * Función para cerrar el elemento arrastrable y ocultar el video.
     * Restablece la posición del elemento arrastrable y oculta el video.
     */
    const handleClose = () => {
        setHidden(true);

        // Ocultar el video estableciendo el displayVideo en null
        toggleDisplayVideo();

        // Restablecer la posición del elemento arrastrable
        resetDragPosition();
    };


    return (
        <>
            <button
                disabled={!hidden}
                aria-label="Intérprete de lenguaje de señas"
                onClick={toggleHidden}
                className="c-interpreter__float-button"
            >
                <Icon>{icon}</Icon>
                <Icon><DotIcon /></Icon>
            </button>

            <AnimatePresence initial={false}>
                {!hidden ? (
                    <motion.div key={uid} className="c-interpreter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ul role="list" className="c-interpreter__list">
                            <li>
                                {/* // Show the current video */}
                                <button
                                    className={classNames('c-interpreter__button', {
                                        'c-interpreter__button--hidden': !contentURL || !accesibilityURL
                                    })}
                                    aria-label="Intérprete de lenguaje de señas"
                                >
                                    <DotIcon />
                                    <small>
                                        {displayVideo && (displayVideo === SHOW_VIDEO.CONTENT ? '1' : '2')}
                                    </small>
                                </button>

                            </li>

                            <li>
                                {/* Content video */}
                                <button
                                    className={classNames('c-interpreter__button', {
                                        'c-interpreter__button--hidden': !contentURL
                                    })}
                                    aria-label='Video de contenido'
                                    onClick={() => toggleDisplayVideo(SHOW_VIDEO.CONTENT)}
                                >
                                    <small>1</small>
                                    <LaptopIcon />
                                </button>
                            </li>

                            <li>
                                {/* Accesibility video */}
                                <button
                                    className={classNames('c-interpreter__button', {
                                        'c-interpreter__button--hidden': !accesibilityURL
                                    })}
                                    aria-label='Video descriptivo'
                                    onClick={() => toggleDisplayVideo(SHOW_VIDEO.ACCESIBILITY)}
                                >
                                    <small>2</small>
                                    <LaptopIcon />
                                </button>
                            </li>


                            <li>
                                {/* Move button */}
                                <button
                                    className="c-interpreter__button c-interpreter__button--drag js-c-interpreter-draggable"
                                    aria-label='Arrastrar video'
                                >
                                    <MoveArrowIcon />
                                </button>
                            </li>

                            <li>
                                {/* Close button */}
                                <button
                                    className="c-interpreter__button interpreter-btn--close"
                                    onClick={handleClose}
                                    onFocus={handleClose}
                                    onBlur={handleClose}
                                    aria-label='Cerrar'
                                >
                                    <CloseIcon />
                                </button>
                            </li>
                        </ul>

                        {/* Contendor video */}
                        <VideoPlayer displayVideo={displayVideo} URLs={URLs} {...props} />
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    )
}