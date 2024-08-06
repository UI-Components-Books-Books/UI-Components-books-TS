import { useState, useRef, useId, useEffect } from "react";

import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import Draggable from "react-draggable";
import type { DraggableEventHandler } from "react-draggable";

import { EVENT, SHOW_VIDEO, ZOOM_LEVELS } from "./const";
import {
  AudioDescription,
  AudioTextIcon,
  CloseIcon,
  DotIcon,
  HandsIcon,
  MoveArrowIcon,
  ZoomInIcon,
} from "./interpreter-icons";
import { VideoPlayer } from "./interpreter-video-player";
import { Icon } from "../../Icon";
import type {
  InterpreterProps,
  InterpreterVideoProps,
  URLs,
} from "../types/types";

import "./interpreter.css";

export const Interpreter: React.FC<InterpreterProps> = ({
  addClass,
  icon = <HandsIcon />,
  ...props
}) => {
  const [hidden, setHidden] = useState<boolean>(true);
  const [URLs, setURls] = useState<URLs>({
    accesibilityURL: undefined,
    contentURL: undefined,
  });

  /**
   * Función para alternar el estado de "hidden" y mostrar u ocultar el video.
   */
  const toggleHidden = () => {
    // Alternar el estado de "hidden"
    setHidden(!hidden);
  };

  useEffect(() => {
    /**
     * Manejador del evento personalizado para actualizar URLs.
     * @param {CustomEvent<URLs>} event - El evento que contiene las URLs actualizadas en su propiedad 'detail'.
     */
    const handleUpdateURLs = ({ detail }: CustomEvent<URLs>) => {
      // Actualiza el estado con las nuevas URLs recibidas del evento
      setURls({ ...detail });
    };

    // Añade un listener para el evento personalizado definido por 'EVENT'
    document.addEventListener(EVENT, handleUpdateURLs as EventListener);

    return () => {
      // Remueve el listener cuando el componente se desmonte
      document.removeEventListener(EVENT, handleUpdateURLs as EventListener);
    };
  }, []);

  return (
    <div
      className={classNames("c-interpreter__container", {
        [addClass ?? ""]: addClass,
      })}
      {...props}
    >
      <button
        disabled={!hidden}
        aria-label="Intérprete de lenguaje de señas"
        onClick={toggleHidden}
        className="c-interpreter__float-button"
      >
        <Icon>{icon}</Icon>
        <Icon>
          <DotIcon />
        </Icon>
      </button>

      <Video URLs={URLs} show={hidden} onClose={toggleHidden} />
    </div>
  );
};

const Video: React.FC<InterpreterVideoProps> = ({
  URLs,
  show,
  onClose,
  ...props
}) => {
  const [zoomIn, setZoomIn] = useState<number>(ZOOM_LEVELS.BASE);
  const [displayVideo, setDisplayVideo] = useState<string | null>(null);
  const [positionDrag, setPositionDrag] = useState({
    deltaPosition: {
      x: 0,
      y: 0,
    },
  });

  const uid = useId();
  const dragRef = useRef(null);

  const { accesibilityURL, contentURL } = URLs;

  /**
   * Función para incrementar el nivel de zoom.
   * Si el nivel de zoom actual es nulo, se establece al nivel inicial.
   * Incrementa el nivel de zoom en 0.05, hasta un máximo especificado.
   */
  const increaseZoom = () => {
    setZoomIn((currentZoom) => {
      if (currentZoom === ZOOM_LEVELS.BASE) return ZOOM_LEVELS.INITIAL;

      const newZoomLevel = parseFloat((currentZoom + 0.05).toFixed(2));
      return newZoomLevel <= ZOOM_LEVELS.MAX ? newZoomLevel : ZOOM_LEVELS.BASE;
    });
  };

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
    onClose();

    // Ocultar el video estableciendo el displayVideo en null
    toggleDisplayVideo();
  };

  useEffect(() => {
    // Si 'show' está activo o no hay URLs disponibles, no hacer nada
    if (show || (!accesibilityURL && !contentURL)) return;

    // Determina el tipo de video a mostrar basado en la URL disponible
    const currentVideo = accesibilityURL
      ? SHOW_VIDEO.ACCESIBILITY
      : contentURL
      ? SHOW_VIDEO.CONTENT
      : null;

    setDisplayVideo(currentVideo);
  }, [show, accesibilityURL, contentURL]);

  return (
    <Draggable
      handle=".js-c-interpreter-draggable"
      nodeRef={dragRef}
      position={positionDrag.deltaPosition}
      onDrag={handleDrag}
    >
      <div ref={dragRef}>
        <div
          className="c-interpreter__zoom"
          style={{ "--scale": zoomIn } as React.CSSProperties}
        >
          <AnimatePresence initial={false} onExitComplete={resetDragPosition}>
            {!show ? (
              <motion.div
                key={uid}
                className="c-interpreter"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <ul role="list" className="c-interpreter__list">
                  {/*  Show the current video */}
                  <li
                    hidden={!contentURL && !accesibilityURL}
                    aria-hidden={!contentURL && !accesibilityURL}
                  >
                    <button
                      className={classNames("c-interpreter__button", {
                        "c-interpreter__button--hidden":
                          !contentURL && !accesibilityURL,
                      })}
                      aria-label="Intérprete de lenguaje de señas"
                    >
                      <DotIcon />
                      <small>
                        {displayVideo &&
                          (displayVideo === SHOW_VIDEO.CONTENT ? "2" : "1")}
                      </small>
                    </button>
                  </li>

                  {/* Accesibility video */}
                  <li hidden={!accesibilityURL} aria-hidden={!accesibilityURL}>
                    <button
                      className={classNames("c-interpreter__button", {
                        "c-interpreter__button--hidden": !accesibilityURL,
                      })}
                      aria-label="Video descriptivo"
                      onClick={() =>
                        toggleDisplayVideo(SHOW_VIDEO.ACCESIBILITY)
                      }
                    >
                      <small>1</small>
                      <AudioDescription />
                    </button>
                  </li>

                  {/* Content video */}
                  <li hidden={!contentURL} aria-hidden={!contentURL}>
                    <button
                      className={classNames("c-interpreter__button", {
                        "c-interpreter__button--hidden": !contentURL,
                      })}
                      aria-label="Video de contenido"
                      onClick={() => toggleDisplayVideo(SHOW_VIDEO.CONTENT)}
                    >
                      <small>2</small>
                      <AudioTextIcon />
                    </button>
                  </li>

                  {/* Zoom button */}
                  <li>
                    <button
                      className="c-interpreter__button"
                      aria-label="Incrementar zoom del interprete"
                      onClick={increaseZoom}
                    >
                      <ZoomInIcon />
                    </button>
                  </li>

                  {/* Move button */}
                  <li>
                    <button
                      className="c-interpreter__button c-interpreter__button--drag js-c-interpreter-draggable"
                      aria-label="Arrastrar video"
                    >
                      <MoveArrowIcon />
                    </button>
                  </li>

                  {/* Close button */}
                  <li>
                    <button
                      className="c-interpreter__button interpreter-btn--close"
                      onClick={handleClose}
                      aria-label="Cerrar"
                    >
                      <CloseIcon />
                    </button>
                  </li>
                </ul>

                {/* Contendor video */}
                <VideoPlayer
                  displayVideo={displayVideo}
                  URLs={URLs}
                  {...props}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </Draggable>
  );
};
