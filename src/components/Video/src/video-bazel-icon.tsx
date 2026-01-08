import { useRef, useEffect } from "react";

import { Icon } from "@components";

import { usePlayerContext } from "./video-context";
import { PauseIcon, PlayIcon } from './video-icons'

import './video.css'

export const BazelIcon = () => {
    const { isPlaying } = usePlayerContext();

    const containerRef = useRef<HTMLDivElement>(null);
    const flagFirstRender = useRef<boolean>(true)

    useEffect(() => {
        if (flagFirstRender.current) {
            flagFirstRender.current = false;
            return;
        }

        if (containerRef.current) {
            containerRef.current.style.display = "block";
        }

        const timerId = setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.style.display = "none";
            }
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [isPlaying]);

    return (
        <div className='video-player__bezel' ref={containerRef}>
            <Icon>
                {isPlaying ? <PauseIcon /> : <PlayIcon /> }
            </Icon>
        </div>
    )
}



