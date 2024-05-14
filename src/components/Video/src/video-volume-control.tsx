import { useEffect, useRef } from 'react';

import classNames from 'classnames';
import { motion } from 'framer-motion';

import { usePlayerContext, usePlayerDispatchContext } from "./video-context"
import { PlayerActionKind } from "./video-types"
import { Icon } from "../../Icon"

import './video.css'

export const VolumeControl = () => {
    return (
        <>
            <ToogleMutedButton />
            <VolumeSlider />
        </>
    )
}

const ToogleMutedButton = () => {
    const { volume, muted } = usePlayerContext();
    const dispatch = usePlayerDispatchContext();

    const toogleMuted = () => {
        dispatch({
            type: PlayerActionKind.ON_MUTE,
            payload: !muted,
        });
    }

    return (
        <button
            className={classNames('video-player__button js-button-video-volumen', {
                'video-player__button--disabled': muted
            })}
            aria-label={muted ? 'Mutear video' : 'Volumen'}
            onClick={toogleMuted}
        >
            <Icon>
                <svg xmlns='http://www.w3.org/2000/svg' height='48' width='48' viewBox='0 -3 24 30'>
                    <motion.path
                        d="M16 21c3.527-1.547 5.999-4.909 5.999-9S19.527 4.547 16 3v2c2.387 1.386 3.999 4.047 3.999 7S18.387 17.614 16 19v2z"
                        animate={{ opacity: volume <= 0.5 ? 0 : 1 }}
                    />
                    <motion.path
                        d="M16 7v10c1.225-1.1 2-3.229 2-5s-.775-3.9-2-5z"
                        animate={{ opacity: volume <= 0.3 ? 0 : 1 }}
                    />
                    <motion.path d="M4 17h2.697L14 21.868V2.132L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2z" />
                </svg>
            </Icon>
        </button>
    )
}

const VolumeSlider = () => {
    const { volume, muted } = usePlayerContext();
    const dispatch = usePlayerDispatchContext();

    const lastVolumeValue = useRef<number>(volume)

    // Función para manejar el cambio de volumen
    const handleVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
        const volumeElement = event.target;
        if (!volumeElement) return;

        // Obtiene el porcentaje de volumen actual del elemento de entrada y lo convierte a un número
        const currentPercentage = volumeElement.value;
        const newVolume = parseInt(currentPercentage) / 100;

        lastVolumeValue.current = newVolume;

        dispatch({
            type: PlayerActionKind.VOLUME_CHANGE,
            payload: newVolume,
        });

        if (muted && newVolume > 0) {
            dispatch({
                type: PlayerActionKind.ON_MUTE,
                payload: !muted,
            });
        }
    };

    useEffect(() => {
        dispatch({
            type: PlayerActionKind.VOLUME_CHANGE,
            payload: muted ? 0 : lastVolumeValue.current,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [muted])

    return (
        <label className='video-player__volume' htmlFor='volume-slider'>
            <span className='u-sr-only'>Controlar volumen</span>
            <input
                id='volume-slider'
                className='video-player__volume-slider'
                type='range'
                min='0'
                max='100'
                step='5'
                value={volume * 100}
                onChange={handleVolume}
                aria-valuetext={`${volume * 100}%`}
            />
        </label>
    )
}