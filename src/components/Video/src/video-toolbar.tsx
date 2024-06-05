import { useEffect } from "react";

import classNames from "classnames";

import { usePlayerContext } from "./video-context";
import { usePlayerDispatchContext } from "./video-context";
import { AudioDescription, CloseCaption, FullScreen, FullScreenExit, PauseIcon, PlayIcon } from './video-icons'
import { Slider } from "./video-slider";
import { VolumeControl } from "./video-volume-control";
import { formatTime } from "../../../utils/converterTime";
import { Icon } from "../../Icon";
import { useFullScreen } from "../hooks/useFullScreen";
import { PlayerActionKind } from '../types/types'

import './video.css'

export const Toolbar = () => {
    return (
        <>
            <Slider />
            <div className="video-player__toolbar">
                <PlayButton />
                <VolumeControl />
                <TimeDisplay />
                <CaptionButton />
                <AudioDescriptionButton />
                <FullScreenButton />
            </div>
        </>
    )
}

const PlayButton = () => {
    const { isPlaying } = usePlayerContext();
    const dispatch = usePlayerDispatchContext();

    const togglePlayVideo = () => {
        dispatch({ type: PlayerActionKind.PLAY_PAUSE, payload: !isPlaying })
    }

    const label = isPlaying ? 'Pausar video' : 'Reproducir video';

    return (
        <button
            aria-label={label}
            className="video-player__button js-button-video-play"
            onClick={togglePlayVideo}
        >
            <Icon>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Icon>
        </button>
    )
}

const TimeDisplay = () => {
    const { currentTime, totalDuration } = usePlayerContext();

    return (
        <p className="video-player__time" aria-hidden='true'>
            <span>{formatTime(currentTime)}</span>/<span>{formatTime(totalDuration)}</span>
        </p>
    )
}

const CaptionButton = () => {
    const { activeCaption, caption } = usePlayerContext();
    const dispatch = usePlayerDispatchContext();

    const toggleCaptions = () => {
        dispatch({ type: PlayerActionKind.TOGGLE_CAPTION, payload: !activeCaption })
    }

    return caption ? (
        <button
            aria-pressed={activeCaption}
            aria-label='Subtítulos'
            onClick={toggleCaptions}
            className={classNames('video-player__button', {
                'video-player__button--disabled': !activeCaption
            })}
        >
            <Icon>
                <CloseCaption />
            </Icon>
        </button>
    ) : null
}

const FullScreenButton = () => {
    const { uid } = usePlayerContext();
    const dispatch = usePlayerDispatchContext();
    const [isFullScreen, onClickFullScreen] = useFullScreen(uid);

    const isFullScreenEnable = document.fullscreenEnabled

    useEffect(() => {
        dispatch({ type: PlayerActionKind.FULLSCREEN, payload: isFullScreen })
    }, [isFullScreen, dispatch])


    const label = isFullScreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa';

    return (
        <button
            aria-pressed={isFullScreen}
            aria-label={label}
            className="video-player__button"
            onClick={onClickFullScreen}
            disabled={!isFullScreenEnable}
        >
            <Icon>
                {isFullScreen ? <FullScreenExit /> : <FullScreen />}
            </Icon>
        </button>
    )
}

const AudioDescriptionButton = () => {
    const { isActiveAD, audio } = usePlayerContext()
    const dispatch = usePlayerDispatchContext();

    const toogleAudioDescription = () => {
        dispatch({ type: PlayerActionKind.AUDIO_DESCRIPTION_CHANGE, payload: !isActiveAD })
    }

    return audio ? (
        <button
            aria-pressed={isActiveAD}
            aria-label="Audio descriptivo"
            onClick={toogleAudioDescription}
            className={classNames('video-player__button', {
                'video-player__button--disabled': !isActiveAD
            })}
        >
            <Icon>
                <AudioDescription />
            </Icon>
        </button>
    ) : null
}

