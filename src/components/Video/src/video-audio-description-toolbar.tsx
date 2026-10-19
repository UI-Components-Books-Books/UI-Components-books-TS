import { useEffect, useRef, useState } from "react";

import { Icon, Switch } from "@components";
import { useIsomorphicLayoutEffect } from "@utils/useIsomorphicLayoutEffect";
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

// Segundos que salta cada pulsación de "Atrás" y "Adelante".
const SKIP_SECONDS = 10;

// Tiempo que se mantiene el estado "buscando" tras un salto, para que el video alcance a aplicarlo.
const SKIP_SETTLE_MS = 100;

export const VideoAudioDescriptionToolbar = () => {
  const refElement = useRef<HTMLDivElement>(null);
  const { uid, showAD, isActiveAD, isPlaying } = usePlayerContext();

  // Ids derivados del reproductor, para que no se repitan si hay más de uno en la página.
  // El del panel lo referencia `aria-controls` del botón que lo abre.
  const panelId = `${uid}-audio-description`;
  const titleId = `${panelId}-title`;
  const dispatch = usePlayerDispatchContext();
  const [shouldRender, setShouldRender] = useState(false);

  // Elemento que tenía el foco al abrir la barra, para devolvérselo al cerrarla.
  const triggerRef = useRef<HTMLElement | null>(null);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(settleTimeoutRef.current), []);

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

    // Sin esto el foco se pierde al desmontarse la barra y vuelve al inicio de la página.
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger?.isConnected) trigger.focus();
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

  // Salta el video hacia atrás o hacia adelante. Se ejecuta con `click` (que cubre ratón, teclado,
  // táctil y lectores de pantalla), y el estado "buscando" se suelta solo: así no puede quedar
  // activo si el puntero sale del botón antes de soltarse.
  const skipVideo = (
    kind: PlayerActionKind.VIDEO_SKIP_BACKWARD | PlayerActionKind.VIDEO_SKIP_FORWARD
  ) => {
    dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: true });
    dispatch({ type: kind, payload: SKIP_SECONDS });

    clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = setTimeout(() => {
      dispatch({ type: PlayerActionKind.UPDATE_SEEKING, payload: false });
    }, SKIP_SETTLE_MS);
  };

  const handleToolbarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!refElement.current) return;

    // Selector para obtener todos los elementos que pueden recibir foco
    const FOCUSABLE_ELEMENTS_SELECTOR = `
      a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])
    `;
    const focusableElements = Array.from(
      refElement.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS_SELECTOR)
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

  useIsomorphicLayoutEffect(() => {
    if (!shouldRender || !refElement.current) return;

    // Guarda quién tenía el foco (el botón que abrió la barra) antes de moverlo.
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && !refElement.current.contains(activeElement)) {
      triggerRef.current = activeElement;
    }

    // Enfoca el primer elemento del toolbar
    refElement.current.focus();
  }, [shouldRender, refElement]);

  useIsomorphicLayoutEffect(() => {
    if (showAD) {
      // Mostrar el componente y ejecutar la animación de entrada
      setShouldRender(true);
    } else if (shouldRender) {
      // Ejecutar la animación de salida antes de desmontar
      if (refElement.current) {
        gsap.to(refElement.current, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setShouldRender(false);
          },
        });
      }
    }
  }, [showAD, shouldRender]);

  useIsomorphicLayoutEffect(() => {
    if (!refElement.current || !shouldRender) return;

    // Animación de entrada del toolbar
    gsap.fromTo(
      refElement.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }, [shouldRender]);

  return (
    <>
      {shouldRender && (
        <div
          ref={refElement}
          id={panelId}
          role="dialog"
          // Modal: atrapa el Tab y se cierra con Escape (ver `handleToolbarKeyDown`), y trae sus
          // propios controles de reproducción, así que no hace falta salir de él mientras está abierto.
          aria-modal="true"
          tabIndex={-1}
          aria-label="Controles del audio descriptivo"
          className="video-audio-description u-flow"
          onKeyDown={handleToolbarKeyDown}
        >
          <div className="video-audio-description__overlay" aria-hidden="true" />
          <div className="video-audio-description__header">
            <p>
              <Icon>
                <AudioDescription />
              </Icon>
              Controles del audio descriptivo
            </p>
            <button
              className="video-audio-description__button video-audio-description__button--close"
              type="button"
              aria-label="Cerrar los controles del audio descriptivo"
              onClick={closeAudioDescriptionControls}
            >
              Cerrar
            </button>
          </div>

          <p>
            El audio descriptivo añade una narración extra para describir lo que aparece en el
            video, haciéndolo más accesible.
          </p>

          <p>
            <strong>Importante:</strong> El control de volumen en este menú solo ajusta el volumen
            del audio descriptivo. Si deseas modificar el volumen del video principal, utiliza el
            control de volumen presente en la barra inferior del reproductor.
          </p>

          <div
            role="group"
            aria-labelledby={titleId}
            className="video-audio-description__content u-flow"
          >
            <div className="video-audio-description__content-header">
              <p id={titleId}>
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
            {/* Sin `aria-label`: el nombre accesible es el texto visible (WCAG 2.5.3, etiqueta en el nombre). */}
            <button
              type="button"
              className="video-audio-description__button video-audio-description__button--control"
              onClick={() => skipVideo(PlayerActionKind.VIDEO_SKIP_BACKWARD)}
            >
              <Icon>
                <SkipPreviousIcon />
              </Icon>
              &nbsp; 10s Atrás
            </button>
            <button
              type="button"
              onClick={toggleVideoPlayback}
              aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
              className="video-audio-description__button video-audio-description__button--control"
            >
              <Icon>{isPlaying ? <PauseIcon /> : <PlayIcon />}</Icon>&nbsp;
              {isPlaying ? "Pausar" : "Reproducir"}
            </button>
            <button
              type="button"
              className="video-audio-description__button video-audio-description__button--control"
              onClick={() => skipVideo(PlayerActionKind.VIDEO_SKIP_FORWARD)}
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
    <div className="video-audio-description__volume-container">
      <p>Volumen del audio descriptivo ({(volumeAD * 100).toFixed(0)}%)</p>
      {/* El input está dentro del label, así que se asocian sin necesidad de `htmlFor` ni de un id
          (uno fijo se duplicaría si hay dos reproductores en la página). */}
      <label className="video-player__volume video-audio-description__volume">
        <span className="u-sr-only">Controlar volumen del audio descriptivo</span>
        <input
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
