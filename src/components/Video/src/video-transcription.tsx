import { useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { usePlayerContext, usePlayerDispatchContext } from "./video-context";
import { formatTime } from "../../../utils/converterTime";
import { Icon } from "../../Icon";
import { useTranscript } from "../hooks/useTranscript";
import { PlayerActionKind } from "../types/types";

interface Props {
  caption?: string;
}

export const VideoTranscription: React.FC<Props> = ({ caption }) => {
  const { uid, currentTime, activeVideoTranscription } = usePlayerContext();
  const { transcript, currentCueId } = useTranscript(uid, caption);
  const dispatch = usePlayerDispatchContext();

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
    // Encuentra el índice del cue actual basado en el tiempo del video
    const currentCueId = transcript.findIndex(
      (cue) => currentTime >= cue.start && currentTime < cue.end
    );

    if (currentCueId !== -1) {
      // Obtiene el elemento del cue activo y lo desplaza al centro de la vista
      const cueElement = document.getElementById(`cue-${currentCueId}`);
      if (cueElement) {
        cueElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [transcript, currentTime]);

  return (
    <AnimatePresence>
      {activeVideoTranscription && (
        <motion.article
          className="video-player__transcription"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <header className="video-player__transcription-header">
            <h3>Transcripción</h3>
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
          </header>

          <ul className="video-player__transcription__segment-list">
            {transcript.map((cue, index) => (
              <li
                key={index}
                id={`cue-${index}`}
                data-is-active={index === currentCueId}
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
                  className="video-player__transcription-segment-button"
                  aria-label={cue.text}
                  onClick={() => handleSegmentClick(cue.start)}
                >
                  {cue.text}
                </button>
              </li>
            ))}
          </ul>
        </motion.article>
      )}
    </AnimatePresence>
  );
};
