import { useId, useReducer } from "react";

import { cn } from '@utils/cn';

import { Video } from "./video";
import { VideoAudioDescriptionToolbar } from "./video-audio-description-toolbar";
import { BazelIcon } from "./video-bazel-icon";
import { PlayerDispatchProvider, PlayerProvider } from "./video-context";
import { playerReducer } from "./video-reducer";
import { Toolbar } from "./video-toolbar";
import { VideoTranscription } from "./video-transcription";
import type { VideoPlayerProps } from "../types/types";

import "./video.css";

const INITIAL_STATE = {
  isPlaying: false,
  muted: false,
  volume: 1,
  totalDuration: 0,
  currentTime: 0,
  isSeeking: false,
  hasVideoLoaded: false,
  activeCaption: false,
  isFullScreen: false,
  isActiveAD: false,
  volumeAD: 1,
  showAD: false,
  activeVideoTranscription: false,
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  id,
  src,
  width = "1000px",
  addClass,
  caption,
  poster,
  audio,
}) => {
  const [state, dispatch] = useReducer(playerReducer, INITIAL_STATE);
  const reactId = useId();

  const uid = id ?? reactId;

  return (
    <PlayerProvider value={{ ...state, uid, src, caption, poster, audio }}>
      <PlayerDispatchProvider value={dispatch}>
        <div
          style={{ maxWidth: width }}
          className={cn("video-player", addClass)}
        >
          <VideoAudioDescriptionToolbar />
          <div
            id={uid}
            className="video-player__container"
            data-vpf={state.isFullScreen}
          >
            <div className="video-player__wrapper">
              <Video />
              <BazelIcon />
            </div>
            <Toolbar />
          </div>
          <VideoTranscription caption={caption?.src} />
        </div>
      </PlayerDispatchProvider>
    </PlayerProvider>
  );
};
