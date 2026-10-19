import { useRef, useEffect, useCallback, useState } from "react";

import { cn } from '@utils/cn';

import { usePlayerContext } from "./video-context";
import { usePlayerDispatchContext } from "./video-context";
import { CaptionLangLabel, PlayerActionKind } from "../types/types";

import "./video.css";

export const Video = () => {
  const {
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
    volumeAD,
  } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  const videoRef = useRef<HTMLVideoElement>(null);

  // El audio descriptivo es estado y no una ref: así los efectos que lo usan se repiten cuando
  // cambia la pista (`audio`) y la nueva queda sincronizada con el video.
  const [audioDescription, setAudioDescription] = useState<HTMLAudioElement | null>(null);

  // Último tiempo que el estado y el video tienen en común: el que el video informó con
  // `timeupdate` o el que se le aplicó en la última búsqueda.
  const syncedTimeRef = useRef(0);

  // Función para pausar o iniciar la reproducción del video.
  const togglePlayVideo = () => {
    dispatch({ type: PlayerActionKind.PLAY_PAUSE, payload: !isPlaying });
  };

  // Inicia la reproducción de un elemento. `play()` devuelve una promesa que se rechaza si el
  // navegador no deja reproducir (NotAllowedError, NotSupportedError) o si se pausa antes de que
  // empiece (AbortError); sin atender ese rechazo queda como error sin capturar.
  const playMedia = useCallback(
    (mediaElement: HTMLMediaElement) => {
      Promise.resolve(mediaElement.play()).catch((error: unknown) => {
        // Pausar a media carga es lo normal al pulsar rápido: el estado ya dice "pausado".
        if ((error as { name?: string } | null)?.name === "AbortError") return;

        // Si no pudo reproducirse el video, el botón no debe seguir mostrando "Pausar". Un fallo
        // del audio descriptivo no detiene el video.
        if (mediaElement === videoRef.current) {
          dispatch({ type: PlayerActionKind.PLAY_PAUSE, payload: false });
        }
      });
    },
    [dispatch]
  );

  // Actualiza el tiempo actual del video en el estado
  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying && !isSeeking) {
      syncedTimeRef.current = videoRef.current.currentTime;

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
    ({
      mediaElement,
      customVolume,
    }: {
      mediaElement: HTMLMediaElement;
      customVolume?: number;
    }) => {
      if (!mediaElement) return;

      mediaElement.volume = customVolume === undefined ? volume : customVolume;
      mediaElement.muted = muted;

      if (isPlaying) {
        playMedia(mediaElement);
      } else {
        mediaElement.pause();
      }
    },
    [volume, muted, isPlaying, playMedia]
  );

  useEffect(() => {
    if (!videoRef.current) return;

    // Controla la reproducción y muteo del video.
    manageMediaPlayback({ mediaElement: videoRef.current });

    // Controla la reproducción y muteo del audio descriptivo si está activo.
    if (isActiveAD && audioDescription) {
      manageMediaPlayback({ mediaElement: audioDescription, customVolume: volumeAD });
    }
  }, [isPlaying, muted, volume, isActiveAD, volumeAD, audioDescription, manageMediaPlayback]);

  // Sincroniza los tiempos actuales de video y audio cuando se busca un nuevo tiempo.
  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || !(isSeeking || !isPlaying)) return;

    if (currentTime !== syncedTimeRef.current) {
      // El tiempo del estado cambió desde la última sincronización (un salto o una búsqueda):
      // se aplica al video.
      syncedTimeRef.current = currentTime;
      videoElement.currentTime = currentTime;

      if (isActiveAD && audioDescription) {
        audioDescription.currentTime = currentTime;
      }
    } else if (!isPlaying && !isSeeking && videoElement.currentTime !== currentTime) {
      // Al pausar, el estado va unos milisegundos por detrás del video (solo se actualiza con
      // `timeupdate`). Escribirlo en el video lo haría retroceder: es el estado quien adopta la
      // posición real.
      syncedTimeRef.current = videoElement.currentTime;
      dispatch({
        type: PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME,
        payload: videoElement.currentTime,
      });
    }
  }, [currentTime, isSeeking, isPlaying, isActiveAD, audioDescription, dispatch]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const audioDescriptionElement = audioDescription;

    if (!audioDescriptionElement || !videoElement) return;

    // Si el audio descriptivo está activado y el video está en reproducción:
    if (isActiveAD && isPlaying) {
      playMedia(audioDescriptionElement);
      const currentVideoTime = videoElement.currentTime;

      // Sincroniza el tiempo del audio descriptivo con el tiempo del video
      // para evitar un desfase en la reproducción.
      audioDescriptionElement.currentTime = currentVideoTime;
    } else {
      // Si el audio descriptivo no está activo o el video no está en reproducción:
      // Pausa el audio descriptivo.
      audioDescriptionElement.pause();
    }

    return () => {
      if (isActiveAD && isPlaying) {
        audioDescriptionElement.pause();
      }
    };
  }, [isActiveAD, isPlaying, audioDescription, playMedia]);

  // Crea el audio descriptivo. Si la pista cambia o se quita, se suelta la anterior y se crea la
  // nueva, para que no siga sonando la vieja.
  useEffect(() => {
    if (!audio) return;

    const audioInstance = new Audio(audio);
    setAudioDescription(audioInstance);

    return () => {
      audioInstance.pause();
      setAudioDescription(null);
    };
  }, [audio]);

  return (
    <video
      ref={videoRef}
      onClick={togglePlayVideo}
      onLoadedData={handleLoadedData}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEndedVideo}
      // preload='none' <--- it's important for the lazy load.
      className={cn(`video-player__video`, {
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
