import { useId, useReducer } from 'react'

import classNames from 'classnames'

import { Video } from './video'
import { BazelIcon } from './video-bazel-icon'
import { PlayerDispatchProvider, PlayerProvider } from './video-context'
import { playerReducer } from './video-reducer'
import { Toolbar } from './video-toolbar'
import { CaptionType } from './video-types'

import './video.css'

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
}

interface Props {
  id?: string;
  src: string;
  width?: string;
  addClass?: string;
  caption?: CaptionType;
  poster?: string;
  audio?: string;
}

export const VideoPlayer: React.FC<Props> = (
  {
    id,
    src,
    width = '1000px',
    addClass,
    caption,
    poster,
    audio
  }
) => {
  const [state, dispatch] = useReducer(playerReducer, INITIAL_STATE)
  const reactId = useId();

  const uid = id ?? reactId;

  return (
    <PlayerProvider value={{ ...state, uid, src, caption, poster, audio }}>
      <PlayerDispatchProvider value={dispatch}>
        <div
          id={uid}
          style={{ maxWidth: width }}
          className={classNames('video-player',
            {
              [addClass ?? ""]: addClass
            }
          )}
          data-vpf={state.isFullScreen}
        >
          <div className="video-player__wrapper">
            <Video />
            <BazelIcon />
          </div>
          <Toolbar />
        </div>
      </PlayerDispatchProvider>
    </PlayerProvider>
  )
}



