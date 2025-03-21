import type { PlayerState, PlayerAction } from '../types/types'
import { PlayerActionKind } from '../types/types'

const UPDATED_STATE_BY_ACTION = {
    [PlayerActionKind.PLAY_PAUSE]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            isPlaying: action.payload as boolean
        };
    },
    [PlayerActionKind.ON_MUTE]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            muted: action.payload as boolean
        };
    },
    [PlayerActionKind.VOLUME_CHANGE]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            volume: action.payload as number,
        };
    },
    [PlayerActionKind.UPDATE_VIDEO_CURRENT_TIME]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            currentTime: action.payload as number,
        };
    },
    [PlayerActionKind.HAS_VIDEO_LOADED]: (state: PlayerState, action: PlayerAction) => {
        const { hasVideoLoaded, totalDuration } = action.payload as PlayerState;

        return {
            ...state,
            hasVideoLoaded,
            totalDuration
        };
    },
    [PlayerActionKind.UPDATE_SEEKING]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            isSeeking: action.payload as boolean,
        };
    },
    [PlayerActionKind.TOGGLE_CAPTION]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            activeCaption: action.payload as boolean
        };
    },
    [PlayerActionKind.FULLSCREEN]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            isFullScreen: action.payload as boolean
        };
    },
    [PlayerActionKind.AUDIO_DESCRIPTION_CHANGE]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            isActiveAD: action.payload as boolean
        };
    },
    [PlayerActionKind.VOLUME_AUDIO_DESCRIPTION_CHANGE]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            volumeAD: action.payload as number,
        };
    },
    [PlayerActionKind.SHOW_AUDIO_DESCRIPTION]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            showAD: action.payload as boolean,
        };
    },
    [PlayerActionKind.TOGGLE_VIDEO_TRANSCRIPTION]: (state: PlayerState, action: PlayerAction) => {
        return {
            ...state,
            activeVideoTranscription: action.payload as boolean
        };
    },
    [PlayerActionKind.VIDEO_SKIP_BACKWARD]: (state: PlayerState, action: PlayerAction) => {
        const payload = action.payload as number | undefined;
        const newCurrenTime = typeof payload === 'number' ? state.currentTime - payload : state.currentTime;

        return {
            ...state,
            currentTime: newCurrenTime < 0 ? 0 : newCurrenTime
        };
    },
    [PlayerActionKind.VIDEO_SKIP_FORWARD]: (state: PlayerState, action: PlayerAction) => {
        const payload = action.payload as number | undefined;
        const newCurrenTime = typeof payload === 'number' ? state.currentTime + payload : state.currentTime;

        return {
            ...state,
            currentTime: newCurrenTime > state.totalDuration ? state.totalDuration : newCurrenTime
        };
    }
}

export const playerReducer = (state: PlayerState, action: PlayerAction) => {
    const { type: actionType } = action;
    const updatedState = UPDATED_STATE_BY_ACTION[actionType];
    return updatedState ? updatedState(state, action) : state
}