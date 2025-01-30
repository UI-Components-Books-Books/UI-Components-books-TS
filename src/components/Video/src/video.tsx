import { useRef, useEffect, useCallback } from "react";

import classNames from "classnames";

import { usePlayerContext } from "./video-context";
import { usePlayerDispatchContext } from "./video-context";
import { CaptionLangLabel, PlayerActionKind } from "../types/types";

import "./video.css";

export const Video = () => {
  const {
    uid,
    src,
    caption,
    poster,
    audio,
    isPlaying,
    muted,
    volume,
    currentTime,
    isSeeking,
    activeCaption,
    isActiveAD,
  } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioDescriptionRef = useRef<HTMLAudioElement>();

  // Función para pausar o iniciar la reproducción del video.
  const togglePlayVideo = () => {
    dispatch({ type: PlayerActionKind.PLAY_PAUSE, payload: !isPlaying });
  };

  // Función que crea un nuevo HTMLAudioElement para manejar el audio descriptivo.
  const createAudioDescription = (url: string) => {
    if (!audioDescriptionRef.current) {
      // Crear una nueva instancia de Audio con la URL del audio descriptivo.
      const audioInstance = new Audio(url);
      audioDescriptionRef.current = audioInstance;
    }
  };

  // Actualiza el tiempo actual del video en el estado
  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying && !isSeeking) {
      dispatch({
        type: PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME,
        payload: videoRef.current.currentTime,
      });
    }
  };

  // Actualiza el estado cuando se carga el video.
  const handleLoadedData = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = event.target as HTMLVideoElement;

    dispatch({
      type: PlayerActionKind.HAS_VIDEO_LOADED,
      payload: {
        hasVideoLoaded: true,
        totalDuration: videoElement.duration,
      },
    });
  };

  // Pausa el video cuando termina si está en reproducción.
  const handleEndedVideo = () => {
    if (isPlaying) {
      togglePlayVideo();
    }
  };

  // Sincroniza el video y el audio descriptivo con los valores de volumen, muteo y reproducción.
  const manageMediaPlayback = useCallback(
    (mediaElement: HTMLMediaElement, enableToMuted?: boolean) => {
      if (!mediaElement) return;

      mediaElement.volume = volume;
      mediaElement.muted = enableToMuted || muted;

      if (isPlaying) {
        mediaElement.play();
      } else {
        mediaElement.pause();
      }
    },
    [volume, muted, isPlaying]
  );

  useEffect(() => {
    if (!videoRef.current) return;

    // Controla la reproducción y muteo del video.
    manageMediaPlayback(videoRef.current, isActiveAD);

    // Controla la reproducción y muteo del audio descriptivo si está activo.
    if (isActiveAD && audioDescriptionRef.current) {
      manageMediaPlayback(audioDescriptionRef.current);
    }
  }, [isPlaying, muted, volume, isActiveAD, manageMediaPlayback]);

  // Sincroniza los tiempos actuales de video y audio cuando se busca un nuevo tiempo.
  useEffect(() => {
    if (videoRef.current && (isSeeking || !isPlaying)) {
      videoRef.current.currentTime = currentTime;

      if (isActiveAD && audioDescriptionRef.current) {
        audioDescriptionRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime, isSeeking, isPlaying, isActiveAD]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const audioDescriptionElement = audioDescriptionRef.current;

    if (!audioDescriptionElement || !videoElement) return;

    // Si el audio descriptivo está activado y el video está en reproducción:
    if (isActiveAD && isPlaying) {
      audioDescriptionElement.play();
      const currentVideoTime = videoElement.currentTime;

      // Sincroniza el tiempo del audio descriptivo con el tiempo del video
      // para evitar un desfase en la reproducción.
      audioDescriptionElement.currentTime = currentVideoTime;
      // Mutea el video para que solo se escuche el audio descriptivo.
      videoElement.muted = true;
    } else {
      // Si el audio descriptivo no está activo o el video no está en reproducción:
      // Pausa el audio descriptivo y reactiva el sonido del video.
      audioDescriptionElement.pause();
      videoElement.muted = false;
    }

    return () => {
      if (isActiveAD && isPlaying) {
        audioDescriptionElement.pause();
      }
    };
  }, [isActiveAD, isPlaying]);

  useEffect(() => {
    if (audio) createAudioDescription(audio);
  }, [audio]);

  return (
    <video
      ref={videoRef}
      id={uid}
      onClick={togglePlayVideo}
      onLoadedData={handleLoadedData}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEndedVideo}
      // preload='none' <--- it's important for the lazy load.
      className={classNames(`video-player__video`, {
        "video-player__no-captions": !activeCaption,
      })}
      {...(poster && { poster })}
    >
      <source src={src} />
      {caption ? (
        <track
          src={caption.src}
          label={CaptionLangLabel[caption.lang]}
          kind="captions"
          srcLang={caption.lang}
          default
        />
      ) : null}
    </video>
  );
};
