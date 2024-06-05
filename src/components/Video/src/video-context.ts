import { Dispatch } from "react";

import { createContext } from "../../../utils/createcontext";
import type { PlayerAction, VideoPlayerContextType  } from '../types/types'


export const [PlayerProvider, usePlayerContext] = createContext<VideoPlayerContextType>({
    name: 'PlayerContext',
})

export const [PlayerDispatchProvider, usePlayerDispatchContext] = createContext<Dispatch<PlayerAction>>({
    name: 'PlayerDispatchContext',
})