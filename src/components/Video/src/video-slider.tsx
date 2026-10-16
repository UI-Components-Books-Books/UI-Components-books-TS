import { useEffect, useMemo } from "react";

import { convertTime } from "@utils/converterTime";

import { usePlayerContext } from "./video-context";
import { usePlayerDispatchContext } from "./video-context";
import { useResize } from "../hooks/useResize";
import { PlayerActionKind } from "../types/types";

import "./video.css";

const KEYCODE_SPACE_BAR = 32;

// Segundos que avanza o retrocede cada pulsación de las flechas.
const KEYBOARD_SEEK_SECONDS = 5;

// Teclas que mueven el slider (patrón de teclado de WAI-ARIA para role="slider").
const SEEK_KEYS = ["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown", "Home", "End"];

export const Slider = () => {
  const {
    currentTime,
    isSeeking,
    isPlaying,
    totalDuration,
    hasVideoLoaded,
    isFullScreen,
  } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  // Función para actualizar el tiempo actual del video según el ancho actual del slider
  const updateVideoCurrentTime = (currentWidth: number) => {
    // Calcular el tiempo actualizado en base al ancho del slider y la duración total del video
    const updatedCurrentTime = (currentWidth * totalDuration) / 100;

    dispatch({
      type: PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME,
      payload: updatedCurrentTime,
    });
    dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: true });
  };

  // Función para manejar el evento de levantamiento del mouse
  const handleMouseUp = () => {
    dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: false });
  };

  const [fillWidth, containerRef, updateSliderFill, initializeResize] =
    useResize<HTMLDivElement>({
      onMouseUp: handleMouseUp,
      onMouseDown: updateVideoCurrentTime,
      onResize: updateVideoCurrentTime,
      hasElementLoad: hasVideoLoaded,
    });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.keyCode || event.which) === KEYCODE_SPACE_BAR) {
      dispatch({ type: PlayerActionKind.PLAY_PAUSE, payload: !isPlaying });
      return;
    }

    if (!SEEK_KEYS.includes(event.key)) return;

    // Evita que la página se desplace con las flechas mientras el slider tiene el foco.
    event.preventDefault();

    // Mientras la tecla está presionada se marca como "buscando", igual que al arrastrar con el
    // puntero; así el video aplica el nuevo tiempo aunque se esté reproduciendo.
    dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: true });

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        dispatch({ type: PlayerActionKind.VIDEO_SKIP_FORWARD, payload: KEYBOARD_SEEK_SECONDS });
        break;
      case "ArrowLeft":
      case "ArrowDown":
        dispatch({ type: PlayerActionKind.VIDEO_SKIP_BACKWARD, payload: KEYBOARD_SEEK_SECONDS });
        break;
      case "Home":
        dispatch({ type: PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME, payload: 0 });
        break;
      case "End":
        dispatch({ type: PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME, payload: totalDuration });
        break;
    }
  };

  // Al soltar la tecla termina la búsqueda.
  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (SEEK_KEYS.includes(event.key)) {
      dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: false });
    }
  };

  // Función para obtener la cadena de texto basada en el tiempo actual y la duración del video
  const getTextValueString = (
    currentTime: number,
    totalDuration: number
  ): string => {
    const formatTimeToString = (time: number) => {
      const { hours, minutes, seconds } = convertTime(time);
      return `${
        hours !== "00" ? `${hours} horas, ` : ""
      }${minutes} minutos y ${seconds} segundos`;
    };

    // Obtenemos las cadenas de texto formateadas para el tiempo actual y la duración del video
    const currentTimeString = formatTimeToString(currentTime);
    const durationVideoString = formatTimeToString(totalDuration);

    // Construimos la cadena de texto final dependiendo de si la duración del video es mayor o igual a una hora
    return totalDuration >= 3600
      ? `${currentTimeString} de ${durationVideoString}`
      : `${currentTimeString} de ${durationVideoString}`;
  };

  const ariaTextTime = useMemo(
    () => getTextValueString(currentTime, totalDuration),
    [currentTime, totalDuration]
  );

  useEffect(() => {
    if (isSeeking) return;

    // Calcular el porcentaje actual del tiempo del video en relación con la duración total
    const newPercentage = ((currentTime / totalDuration) * 100).toFixed(4);
    updateSliderFill(parseFloat(newPercentage));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, isSeeking, totalDuration]);

  /**
   * Este efecto se dispara cada vez que cambia el valor de `isFullScreen`. Si `isFullScreen`
   * es `true`, se invoca `initializeResize` para ajustar las medidas del contenedor a pantalla completa.
   *
   * Cuando se sale del modo de pantalla completa, el efecto de limpieza (cleanup) también
   * ejecuta `initializeResize` para restablecer las medidas del contenedor al estado anterior.
   */
  useEffect(() => {
    if (isFullScreen) {
      initializeResize();
    }

    return () => {
      initializeResize();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullScreen]);

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Progreso del video"
      aria-valuemin={0}
      aria-valuenow={Math.round(currentTime)}
      aria-valuemax={Math.round(totalDuration)}
      aria-valuetext={ariaTextTime}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className="video-player__slider"
      style={{ "--slider-fill": fillWidth } as React.CSSProperties}
    >
      <div className="video-player__slider-track" data-resize="track"></div>
      <div className="video-player__slider-fill"></div>
      <div className="video-player__slider-thumb" data-resize="handle"></div>
    </div>
  );
};
