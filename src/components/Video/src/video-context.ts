import { Dispatch } from "react";

import type { PlayerAction, PlayerState, CaptionType } from './video-types'
import { createContext } from "../../../utils/createcontext";

interface PlayerContextType extends PlayerState {
    uid: string;
    src: string;
    caption?: CaptionType;
    poster?: string;
    audio?: string;
}

export const [PlayerProvider, usePlayerContext] = createContext<PlayerContextType>({
    name: 'PlayerContext',
})

export const [PlayerDispatchProvider, usePlayerDispatchContext] = createContext<Dispatch<PlayerAction>>({
    name: 'PlayerDispatchContext',
})