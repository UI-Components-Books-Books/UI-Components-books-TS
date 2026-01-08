import { useEffect } from "react";

import { Icon } from "@components";
import { cn } from '@utils/cn';
import { formatTime } from "@utils/converterTime";

import { usePlayerContext } from "./video-context";
import { usePlayerDispatchContext } from "./video-context";
import {
  AudioDescription,
  CloseCaption,
  FullScreen,
  FullScreenExit,
  PauseIcon,
  PlayIcon,
  VideoTranscript,
} from "./video-icons";
import { Slider } from "./video-slider";
import { VolumeControl } from "./video-volume-control";
import { useFullScreen } from "../hooks/useFullScreen";
import { PlayerActionKind } from "../types/types";

import "./video.css";

export const Toolbar = () => {
  return (
    <>
      <Slider />
      <div className="video-player__toolbar">
        <PlayButton />
        <VolumeControl />
        <TimeDisplay />
        <TranscriptButton />
        <CaptionButton />
        <AudioDescriptionButton />
        <FullScreenButton />
      </div>
    </>
  );
};

const PlayButton = () => {
  const { isPlaying } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  const togglePlayVideo = () => {
    dispatch({ type: PlayerActionKind.PLAY_PAUSE, payload: !isPlaying });
  };

  const label = isPlaying ? "Pausar video" : "Reproducir video";

  return (
    <button
      aria-label={label}
      className="video-player__button js-button-video-play"
      onClick={togglePlayVideo}
    >
      <Icon>{isPlaying ? <PauseIcon /> : <PlayIcon />}</Icon>
    </button>
  );
};

const TimeDisplay = () => {
  const { currentTime, totalDuration } = usePlayerContext();

  return (
    <p className="video-player__time" aria-hidden="true">
      <span>{formatTime(currentTime)}</span>/
      <span>{formatTime(totalDuration)}</span>
    </p>
  );
};

const TranscriptButton = () => {
  const { activeVideoTranscription, caption } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  const toggleTranscription = () => {
    dispatch({
      type: PlayerActionKind.TOGGLE_VIDEO_TRANSCRIPTION,
      payload: !activeVideoTranscription,
    });
  };

  return caption ? (
    <button
      aria-pressed={activeVideoTranscription}
      aria-label="Transcripción"
      onClick={toggleTranscription}
      className={cn("video-player__button", {
        "video-player__button--disabled": !activeVideoTranscription,
      })}
    >
      <Icon>
        <VideoTranscript />
      </Icon>
    </button>
  ) : null;
};

const CaptionButton = () => {
  const { activeCaption, caption } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  const toggleCaptions = () => {
    dispatch({
      type: PlayerActionKind.TOGGLE_CAPTION,
      payload: !activeCaption,
    });
  };

  return caption ? (
    <button
      aria-pressed={activeCaption}
      aria-label="Subtítulos"
      onClick={toggleCaptions}
      className={cn("video-player__button", {
        "video-player__button--disabled": !activeCaption,
      })}
    >
      <Icon>
        <CloseCaption />
      </Icon>
    </button>
  ) : null;
};

const FullScreenButton = () => {
  const { uid } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();
  const [isFullScreen, onClickFullScreen] = useFullScreen(uid);

  const isFullScreenEnable = document.fullscreenEnabled;

  useEffect(() => {
    dispatch({ type: PlayerActionKind.FULLSCREEN, payload: isFullScreen });
  }, [isFullScreen, dispatch]);

  const label = isFullScreen
    ? "Salir de pantalla completa"
    : "Ver en pantalla completa";

  return (
    <button
      aria-pressed={isFullScreen}
      aria-label={label}
      className="video-player__button"
      onClick={onClickFullScreen}
      disabled={!isFullScreenEnable}
    >
      <Icon>{isFullScreen ? <FullScreenExit /> : <FullScreen />}</Icon>
    </button>
  );
};

const AudioDescriptionButton = () => {
  const { showAD, isActiveAD , audio } = usePlayerContext();
  const dispatch = usePlayerDispatchContext();

  const toogleAudioDescription = () => {
    dispatch({
      type: PlayerActionKind.SHOW_AUDIO_DESCRIPTION,
      payload: !showAD,
    });
    dispatch({
      type: PlayerActionKind.AUDIO_DESCRIPTION_CHANGE,
      payload: !isActiveAD,
    });
  };

  return audio ? (
    <button
      aria-pressed={showAD}
      aria-label="Audio descriptivo"
      onClick={toogleAudioDescription}
      className={cn("video-player__button", {
        "video-player__button--disabled": !showAD,
      })}
    >
      <Icon>
        <AudioDescription />
      </Icon>
    </button>
  ) : null;
};
