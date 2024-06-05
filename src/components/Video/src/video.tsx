import { useRef, useEffect, useCallback } from "react";

import classNames from "classnames";

import { usePlayerContext } from "./video-context";
import { usePlayerDispatchContext } from "./video-context";
import { CaptionLangLabel, PlayerActionKind } from "../types/types";

import './video.css'

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
        isActiveAD
    } = usePlayerContext();
    const dispatch = usePlayerDispatchContext();

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioDescriptionRef = useRef<HTMLAudioElement>()

    // Función para pausar o iniciar la reproducción del video. 
    const togglePlayVideo = () => {
        dispatch({ type: PlayerActionKind.PLAY_PAUSE, payload: !isPlaying })
    }

    // Función que crea un nuevo HTMLAudioElement para manejar el audio descriptivo.
    const createAudioDescription = (url: string) => {
        if (!audioDescriptionRef.current) {
            // Crear una nueva instancia de Audio con la URL del audio descriptivo.
            const audioInstance = new Audio(url);
            audioDescriptionRef.current = audioInstance;
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current && isPlaying && !isSeeking) {
            dispatch({
                type: PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME,
                payload: videoRef.current.currentTime,
            })
        }
    };

    const handleLoadedData = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        const videoElement = event.target as HTMLVideoElement;

        dispatch({
            type: PlayerActionKind.HAS_VIDEO_LOADED,
            payload: {
                hasVideoLoaded: true,
                totalDuration: videoElement.duration,
            },
        });
    }

    const handleEndedVideo = () => {
        if (isPlaying) {
            togglePlayVideo();
        }
    }

    // Manejar la lógica común para el video y la descripción de audio
    const handleMedia = useCallback(
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

        // Manejar video
        handleMedia(videoRef.current, isActiveAD);

        // Manejar descripción de audio si está activa
        if (isActiveAD && audioDescriptionRef.current) {
            handleMedia(audioDescriptionRef.current);
        }
    }, [isPlaying, muted, volume, isActiveAD, handleMedia]);


    useEffect(() => {
        if (videoRef.current && (isSeeking || !isPlaying)) {
            videoRef.current.currentTime = currentTime;

            if (isActiveAD && audioDescriptionRef.current) {
                audioDescriptionRef.current.currentTime = currentTime
            }
        }
    }, [currentTime, isSeeking, isPlaying, isActiveAD]);


    useEffect(() => {
        const videoElement = videoRef.current;
        const audioDescriptionElement = audioDescriptionRef.current;

        if (!audioDescriptionElement || !videoElement) return;

        // Mutea el video y reproduce el audio descriptivo
        if (isActiveAD && isPlaying) {
            audioDescriptionElement.play();
            const currentVideoTime = videoElement.currentTime

            // Coloca el tiempo actual del video al audio para que no hay un desfase. 
            audioDescriptionElement.currentTime = currentVideoTime
            videoElement.muted = true;
        } else {
            audioDescriptionElement.pause();
            videoElement.muted = false;
        }
    }, [isActiveAD, isPlaying]);


    useEffect(() => {
        if (audio) createAudioDescription(audio);
    }, [audio])

    return (
        <video
            ref={videoRef}
            onClick={togglePlayVideo}
            onLoadedData={handleLoadedData}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEndedVideo}
            // preload='none' <--- it's important for the lazy load.
            className={classNames(`video-player__video`,
                {
                    "video-player__no-captions": !activeCaption
                }
            )}
            {...(poster && { poster })}
        >
            <source src={src} />
            {caption ? <track src={caption.src} label={CaptionLangLabel[caption.lang]} kind='captions' srcLang={caption.lang} default /> : null}
        </video>
    )
}