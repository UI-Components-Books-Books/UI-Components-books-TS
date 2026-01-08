import { useLayoutEffect, useRef } from "react";

import { Icon , Switch } from "@components";
import gsap from "gsap";

import { usePlayerContext, usePlayerDispatchContext } from "./video-context";
import {
  AudioDescription,
  NextPreviousIcon,
  PauseIcon,
  PlayIcon,
  SkipPreviousIcon,
} from "./video-icons";
import { PlayerActionKind } from "../types/types";

export const VideoAudioDescriptionToolbar = () => {
  const refElement = useRef<HTMLDivElement>(null);
  const { showAD, isActiveAD, isPlaying } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  // Cierra la barra de herramientas de audio descriptivo
  const closeAudioDescriptionControls = () => {
    dispatch({
      type: PlayerActionKind.SHOW_AUDIO_DESCRIPTION,
      payload: false,
    });
    dispatch({
      type: PlayerActionKind.AUDIO_DESCRIPTION_CHANGE,
      payload: false,
    });
  };

  // Activa o desactiva el audio descriptivo
  const toggleAudioDescription = () => {
    dispatch({
      type: PlayerActionKind.AUDIO_DESCRIPTION_CHANGE,
      payload: !isActiveAD,
    });
  };

  // Alterna entre reproducir y pausar el video
  const toggleVideoPlayback = () => {
    dispatch({ type: PlayerActionKind.PLAY_PAUSE, payload: !isPlaying });
  };

  // Retrocede 10 segundos en el video
  const rewindVideoBy10Seconds = () => {
    dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: true });
    dispatch({
      type: PlayerActionKind.VIDEO_SKIP_BACKWARD,
      payload: 10,
    });
  };

  // Detiene la acción de búsqueda (seeking) al soltar el botón del mouse
  const stopSeeking = () => {
    dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: false });
  };

  // Avanza 10 segundos en el video
  const fastForwardVideoBy10Seconds = () => {
    dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: true });
    dispatch({
      type: PlayerActionKind.VIDEO_SKIP_FORWARD,
      payload: 10,
    });
  };

  // Maneja los eventos de teclado para los botónes que están en el menu de audio descriptivo
  const handleControlButtonKeyDown = (
    event: React.KeyboardEvent,
    callback: () => void
  ) => {
    // Si se presiona Enter o la barra espaciadora, ejecuta el callback asociado
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  };

  const handleToolbarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!refElement.current) return;

    // Selector para obtener todos los elementos que pueden recibir foco
    const FOCUSABLE_ELEMENTS_SELECTOR = `
      a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])
    `;
    const focusableElements = Array.from(
      refElement.current.querySelectorAll<HTMLElement>(
        FOCUSABLE_ELEMENTS_SELECTOR
      )
    );

    // Si no hay elementos enfocables, salir de la función
    if (focusableElements.length === 0) return;

    // Obtener el primer y último elemento enfocables
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === "Tab") {
      // Si se presiona Shift + Tab y el foco está en el primer elemento, mover el foco al último
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Si se presiona Tab y el foco está en el último elemento, mover el foco al primero
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    // Si se presiona Escape, cerrar la barra de herramientas de audio descriptivo
    else if (e.key === "Escape") {
      e.preventDefault();
      closeAudioDescriptionControls();
    }
  };

  useLayoutEffect(() => {
    if (!showAD || !refElement.current) return;

    // Enfoca el primer elemento del toolbar
    refElement.current.focus();
  }, [showAD, refElement]);

  return (
    <>
      {showAD && (
        <div
          ref={(el) => {
            if (el && refElement.current !== el) {
              refElement.current = el as HTMLDivElement;
              gsap.fromTo(
                el,
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
              );
            }
          }}
          tabIndex={-1}
          aria-label="Controles del audio descriptivo"
          className="video-audio-description u-flow"
          onKeyDown={handleToolbarKeyDown}
        >
          <div
            className="video-audio-description__overlay"
            aria-hidden="true"
          />
          <div className="video-audio-description__header">
            <p>
              <Icon>
                <AudioDescription />
              </Icon>
              Controles del audio descriptivo
            </p>
            <button
              className="video-audio-description__button video-audio-description__button--close"
              aria-label="Cerrar los controles del audio descriptivo"
              onClick={closeAudioDescriptionControls}
            >
              Cerrar
            </button>
          </div>

          <p>
            El audio descriptivo añade una narración extra para describir lo que
            aparece en el video, haciéndolo más accesible.
          </p>

          <p>
            <strong>Importante:</strong> El control de volumen en este menú solo
            ajusta el volumen del audio descriptivo. Si deseas modificar el
            volumen del video principal, utiliza el control de volumen presente
            en la barra inferior del reproductor.
          </p>

          <div
            aria-labelledby="audio-description-header"
            className="video-audio-description__content u-flow"
          >
            <div
              className="video-audio-description__content-header"
              id="audio-description-header"
            >
              <p>
                <Icon>
                  <AudioDescription />
                </Icon>
                Audio descriptivo
              </p>
              <Switch
                addClass="video-audio-description__switch"
                checked={isActiveAD}
                onChange={toggleAudioDescription}
                label="Activar o desactivar el audio descriptivo"
              />
            </div>

            <VolumenSlider />
          </div>

          <div
            role="group"
            aria-label="Controles de reproducción"
            className="video-audio-description__controls"
          >
            <button
              aria-label="Retroceder 10 segundos del video"
              className="video-audio-description__button video-audio-description__button--control"
              onMouseDown={rewindVideoBy10Seconds}
              onMouseUp={stopSeeking}
              onKeyDown={(event) =>
                handleControlButtonKeyDown(event, rewindVideoBy10Seconds)
              }
              onKeyUp={(event) =>
                handleControlButtonKeyDown(event, stopSeeking)
              }
            >
              <Icon>
                <SkipPreviousIcon />
              </Icon>
              &nbsp; 10s Atrás
            </button>
            <button
              onClick={toggleVideoPlayback}
              aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
              className="video-audio-description__button video-audio-description__button--control"
            >
              <Icon>{isPlaying ? <PauseIcon /> : <PlayIcon />}</Icon>&nbsp;
              {isPlaying ? "Pausar" : "Reproducir"}
            </button>
            <button
              aria-label="Avanzar 10 segundos del video"
              className="video-audio-description__button video-audio-description__button--control"
              onMouseDown={fastForwardVideoBy10Seconds}
              onMouseUp={stopSeeking}
              onKeyDown={(event) =>
                handleControlButtonKeyDown(event, fastForwardVideoBy10Seconds)
              }
              onKeyUp={(event) =>
                handleControlButtonKeyDown(event, stopSeeking)
              }
            >
              10s Adelante&nbsp;
              <Icon>
                <NextPreviousIcon />
              </Icon>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const VolumenSlider = () => {
  const { volumeAD } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  const lastVolumeValue = useRef<number>(volumeAD);

  // Función para manejar el cambio de volumen
  const handleVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volumeElement = event.target;
    if (!volumeElement) return;

    // Obtiene el porcentaje de volumen actual del elemento de entrada y lo convierte a un número
    const currentPercentage = volumeElement.value;
    const newVolume = parseInt(currentPercentage) / 100;

    lastVolumeValue.current = newVolume;

    dispatch({
      type: PlayerActionKind.VOLUME_AUDIO_DESCRIPTION_CHANGE,
      payload: newVolume,
    });
  };

  return (
    <div>
      <p>Volumen del audio descriptivo ({(volumeAD * 100).toFixed(0)}%)</p>
      <label
        className="video-player__volume video-audio-description__volume"
        htmlFor="volume-audio-description-slider"
      >
        <span className="u-sr-only">
          Controlar volumen del audio descriptivo
        </span>
        <input
          id="volume-audio-description"
          className="video-player__volume-slider video-audio-description__slider"
          type="range"
          min="0"
          max="100"
          step="5"
          value={volumeAD * 100}
          onChange={handleVolume}
          aria-valuetext={`${(volumeAD * 100).toFixed(0)}%`}
        />
      </label>
    </div>
  );
};
