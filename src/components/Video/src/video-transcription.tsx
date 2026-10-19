import { useEffect, useRef } from "react";

import { Icon } from "@components";
import { formatTime } from "@utils/converterTime";
import gsap from "gsap";

import { usePlayerContext, usePlayerDispatchContext } from "./video-context";
import { useTranscript } from "../hooks/useTranscript";
import type { Cue } from "../hooks/useTranscript";
import { PlayerActionKind } from "../types/types";

// Tras un gesto del usuario sobre la lista (rueda, táctil, barra de desplazamiento o teclado) la
// lista no se desplaza sola durante este tiempo, para no quitarle el control.
const USER_SCROLL_PAUSE_MS = 5000;

// Índice del cue que contiene el tiempo dado, o -1 si no hay ninguno.
const findActiveCueIndex = (transcript: Cue[], time: number) =>
  transcript.findIndex((cue) => time >= cue.start && time < cue.end);

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Props {
  caption?: string;
}

export const VideoTranscription: React.FC<Props> = ({ caption }) => {
  const { uid, currentTime, activeVideoTranscription } = usePlayerContext();
  const { transcript } = useTranscript(caption);
  const dispatch = usePlayerDispatchContext();
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastUserScrollRef = useRef(0);

  // Cue activo según el tiempo del reproductor. El resaltado y el desplazamiento usan este mismo
  // valor, así no hay dos fuentes que puedan discrepar.
  const activeCueIndex = findActiveCueIndex(transcript, currentTime);

  const pauseAutoScroll = () => {
    lastUserScrollRef.current = Date.now();
  };

  // Un puntero sobre la propia lista (y no sobre uno de sus segmentos) es la barra de desplazamiento.
  const handleListPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (event.target === event.currentTarget) pauseAutoScroll();
  };

  /**
   * Salta al tiempo específico del video cuando se hace clic en un segmento de transcripción.
   *
   * @param {number} startTime - Tiempo en segundos al que debe moverse el video.
   */
  const handleSegmentClick = (starTime: number) => {
    dispatch({
      type: PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME,
      payload: starTime,
    });
    dispatch({
      type: PlayerActionKind.UPDATE_SEEKING,
      payload: true,
    });

    setTimeout(() => {
      dispatch({
        type: PlayerActionKind.UPDATE_SEEKING,
        payload: false,
      });
    }, 100);
  };

  useEffect(() => {
    if (activeVideoTranscription && transcriptionRef.current) {
      gsap.fromTo(
        transcriptionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [activeVideoTranscription]);

  // Lleva la lista al cue activo, pero solo cuando el cue cambia (no en cada actualización del
  // tiempo) y sin pelear con el usuario mientras la recorre él.
  useEffect(() => {
    const list = listRef.current;

    if (!activeVideoTranscription || !list || activeCueIndex === -1) return;
    if (Date.now() - lastUserScrollRef.current < USER_SCROLL_PAUSE_MS) return;

    const cueElement = list.children[activeCueIndex] as HTMLElement | undefined;
    if (!cueElement) return;

    // Calcula la posición de desplazamiento relativa a la lista
    const offsetTop = cueElement.offsetTop - list.offsetTop;
    list.scrollTo({
      top: offsetTop - list.clientHeight / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeVideoTranscription, activeCueIndex]);

  return (
    <>
      {activeVideoTranscription && (
        <div
          ref={transcriptionRef}
          className="video-player__transcription"
        >
          <div className="video-player__transcription-header">
            <p>Transcripción</p>
            <div className="video-player__transcription-badge">
              <Icon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </Icon>
              <p>{formatTime(currentTime)}</p>
            </div>
          </div>

          <ul
            ref={listRef}
            className="video-player__transcription__segment-list"
            onWheel={pauseAutoScroll}
            onTouchMove={pauseAutoScroll}
            onKeyDown={pauseAutoScroll}
            onPointerDown={handleListPointerDown}
          >
            {transcript.map((cue, index) => (
              <li
                key={index}
                id={`${uid}-cue-${index}`}
                data-is-active={index === activeCueIndex}
                className="video-player__transcription__segment"
              >
                <div className="video-player__transcription-badge-container">
                  <span className="video-player__transcription-badge">
                    {formatTime(cue.start)}
                  </span>
                  <span className="video-player__transcription-badge">
                    {formatTime(cue.end)}
                  </span>
                </div>
                <button
                  type="button"
                  className="video-player__transcription-segment-button"
                  aria-label={cue.text}
                  onClick={() => handleSegmentClick(cue.start)}
                >
                  {cue.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
