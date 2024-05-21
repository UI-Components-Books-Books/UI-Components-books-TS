import { useState, useRef, useId } from 'react'

import classnames from 'classnames'

import { A11yIcon, PauseIcon, PlayIcon, VolumenDownIcon, VolumenOffIcon, VolumenOnIcon } from './audio-icons'
import { useInteractOutside } from '../../../hooks'
import { Button } from '../../Button'
import { Icon } from '../../Icon'

import './audio.css'

/**
 * Se crea un objeto que no se puede cambiar para
 * almacenar los tipos o formas que tiene el componente.
 */
const TYPES = Object.freeze({
  BUTTON: 'button',
  BAR: 'bar'
} as const);

// Constantes para los umbrales de volumen
const VOLUME_OFF_THRESHOLD = 0;
const VOLUME_LOW_THRESHOLD = 0.25;

// Definir constantes para los números mágicos
const SECONDS_IN_MINUTE = 60;

interface Props {
  id?: string,
  src: string,
  a11y?: boolean,
  size?: 'small',
  type?: typeof TYPES[keyof typeof TYPES],
  description?: string,
  addClass?: string,
}

export const Audio: React.FC<Props> = ({
  id,
  src,
  a11y = false,
  size,
  type = 'bar',
  description,
  addClass,
  ...props
}) => {
  /**
   * Utilizado para identificar el elemento audio.
   */
  const reactId: string = useId();


  /**
   * Si `id` está definido, usa `id`; de lo contrario, usa `reactId`
   */
  const uid = id ?? reactId;


  /**
   * Se utiliza para rastrear el estado del audio (reproducción o pausa).
   */
  const [play, setPlay] = useState<boolean>(false);


  /**
   * Indica si el menú de opciones del reproductor de audio está abierto o cerrado.
   */
  const [openMenu, setOpenMenu] = useState<boolean>(false);


  /**
   * Información sobre la duración total y el tiempo actual de reproducción del audio.
   */
  const [mediaTime, setMediaTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);


  /**
   * Nivel de volumen actual del audio.
   */
  const [volume, setVolume] = useState<number>(0);


  /**
   * Referencia al elemento HTMLAudioElement.
   */
  const refAudio = useRef<HTMLAudioElement>(null);


  /**
   * Referencias a elementos relacionados con el control de volumen.
   */
  const refVolumeButton = useRef<HTMLButtonElement>(null);
  const refVolumeSlider = useRef<HTMLDivElement>(null);


  /**
   * Determina si se debe cerrar un menú al interactuar fuera de él.
   * 
   * @param {HTMLElement} element - El elemento con el que se interactuó.
   * @param {React.RefObject<HTMLElement>} refVolumeButton - La referencia al botón de volumen.
   * @returns {boolean} Verdadero si se debe cerrar el menú, falso de lo contrario.
   */
  const shouldCloseOnInteractOutside = (element: HTMLElement, refVolumeButton: React.RefObject<HTMLElement>) => {
    return element === refVolumeButton.current
  }


  /**
   * Maneja la interacción fuera del menú.
   * 
   * @param {MouseEvent} event - El evento de interacción.
   */
  const onInteractionOutside = (event: MouseEvent) => {
    if (!shouldCloseOnInteractOutside(event.target as HTMLElement, refVolumeButton)) {
      setOpenMenu(false)
      event.stopPropagation()
      event.preventDefault()
    }
  }


  useInteractOutside({ ref: refVolumeSlider, onInteractionOutside })


  /**
   * Obtiene todos los HTMLAudioElement,
   * y los pausa si se están reproduciéndose,
   * con el fin de que no se escuchen un audio encima de otro.
   */
  const pauseAllAudios = () => {
    const audios = document.querySelectorAll('audio')
    audios.forEach((audio) => {
      if (!audio.paused && audio !== refAudio.current) {
        audio.pause()
      }
    })
  }


  /**
   * Alternar entre reproducir y pausar el audio, dependiendo de su estado actual.
   */
  const togglePlay = (): void => {
    if (!refAudio.current) return;

    // Pausar todos los demás audios
    pauseAllAudios();

    // Si el audio está en pausa, reproducirlo; de lo contrario, pausarlo
    if (refAudio.current.paused) {
      refAudio.current.play();
    } else {
      refAudio.current.pause();
    }

    // Actualizar el estado de reproducción
    setPlay(prevPlay => !prevPlay);
  }


  const isTouchScreen: boolean = window.matchMedia(
    '(any-hover: none) and (any-pointer: coarse)'
  ).matches




  // Calcular el tiempo formateado para mostrarlo en el reproductor de audio
  const formattedMediaTime = `${String(Math.floor(mediaTime / SECONDS_IN_MINUTE)).padStart(2, '0')}:${String(mediaTime % SECONDS_IN_MINUTE).padStart(2, '0')}`;

  // Calcular la duración formateada para mostrarla en el reproductor de audio
  const formattedDuration = `${String(Math.floor(duration / SECONDS_IN_MINUTE)).padStart(2, '0')}:${String(duration % SECONDS_IN_MINUTE).padStart(2, '0')}`;


  /**
   * Maneja el evento 'loadedmetadata' del elemento de audio.
   * Actualiza la duración del audio y establece el volumen inicial, dependiendo del dispositivo.
   */
  const onLoadedMetadata = (): void => {
    if (!refAudio.current) return;

    setDuration(Math.round(refAudio.current.duration));
    isTouchScreen ? setVolume(1) : setVolume(refAudio.current.volume);
  }


  /**
   * Maneja el evento 'timeupdate' del elemento de audio.
   * Actualiza el tiempo actual de reproducción del audio.
   */
  const onTimeUpdate = (): void => {
    if (!refAudio.current) return;

    setMediaTime(Math.round(refAudio.current.currentTime));
  }


  /**
  * Maneja el cambio de volumen del audio.
  * Actualiza el estado del volumen basado en el valor del evento.
  * 
  * @param {React.ChangeEvent<HTMLAudioElement>} event - El evento de cambio.
  */
  const handleVolumeAudio = (event: React.ChangeEvent<HTMLAudioElement>): void => {
    setVolume(event.target.volume);
  }



  /**
   * Maneja el cambio en el volumen del audio.
   * Actualiza el estado del volumen y ajusta el volumen del audio.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} event - El evento de cambio.
   */
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!refAudio.current) return;

    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    refAudio.current.volume = newVolume;
  };


  /**
   * Maneja el cambio en el tiempo de reproducción del audio.
   * Actualiza el tiempo de reproducción del audio y ajusta el tiempo de reproducción del elemento de audio.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} event - El evento de cambio.
   */
  const onPlayTimeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!refAudio.current) return;

    const playhead = parseFloat(event.target.value);
    setMediaTime(playhead);
    refAudio.current.currentTime = playhead;
  }

  // Función para determinar el icono de volumen según el valor del volumen actual
  const getVolumeIcon = (): JSX.Element => {
    if (volume === VOLUME_OFF_THRESHOLD) {
      return <VolumenOffIcon />;
    } else if (volume <= VOLUME_LOW_THRESHOLD) {
      return <VolumenDownIcon />;
    } else {
      return <VolumenOnIcon />;
    }
  };

  if (type === TYPES.BUTTON) {
    return (
      <>
        <audio
          id={uid}
          ref={refAudio}
          src={src}
          onPlay={() => setPlay(true)}
          onPause={() => setPlay(false)}
          onEnded={() => setPlay(false)}
          className="c-audio--hidden"
        />
        <Button
          type='button'
          label={play ? 'Pausar' : 'Reproduccir'}
          data-a11y={a11y}
          onClick={togglePlay}
          hasAriaLabel
          addClass={classnames(`c-audio__button c-audio__button--${size}`,
            {
              'is-button-playing': play,
              'is-button-paused': !play,
              [addClass ?? ""]: addClass
            })
          }
          {...(a11y && { disabled: a11y })}
          {...props}
        />
      </>
    )
  }

  return (
    <>
      <div
        className={`c-audio__bar c-audio__bar--${size} ${addClass ?? ''}`}
        role='group'
        aria-labelledby={`description${uid}`}
        data-a11y={a11y}
      >
        <span id={`description${uid}`} hidden>
          {a11y ? 'Audio description' : description ? description : 'Barra de audio'}
        </span>

        {a11y ? (
          <Icon>
            <A11yIcon />
          </Icon>
        ) : null
        }

        <button type='button' onClick={togglePlay}>
          <span className='u-sr-only'>{play ? 'Pausar' : 'Reproducir'}</span>
          <Icon size='big'>
            {play ? <PauseIcon /> : <PlayIcon />}
          </Icon>
        </button>

        <small aria-hidden='true'>
          {formattedMediaTime} / {formattedDuration}
        </small>

        <label className='u-sr-only' htmlFor={`time${uid}`}>
          Tiempo transcurrido
        </label>
        <input
          className='c-audio__bar-scrubber'
          id={`time${uid}`}
          value={mediaTime}
          min={0}
          max={duration}
          aria-valuetext={`${mediaTime} seconds`}
          onChange={onPlayTimeChange}
          type='range'
        />

        <button
          type='button'
          ref={refVolumeButton}
          aria-expanded={openMenu}
          className='c-audio__bar-volume-btn'
          onClick={() => setOpenMenu(!openMenu)}
        >
          <span className='u-sr-only'>Controlar volumen</span>
          <Icon>
            {getVolumeIcon()}
          </Icon>
        </button>
        {openMenu
          ? (
            <div className='c-audio__bar-volume-control' ref={refVolumeSlider}>
              <label className='u-sr-only' htmlFor={`volume${uid}`}>
                Volumen
              </label>
              <input
                id={`volume${uid}`}
                value={volume}
                min={0}
                max={1}
                step={0.05}
                type='range'
                aria-valuetext={`${Math.round(volume * 100)}%`}
                aria-orientation='vertical'
                onChange={handleVolumeChange}
              />
            </div>
          )
          : null}
      </div>
      <audio
        id={uid}
        ref={refAudio}
        preload='metadata'
        controls
        className={classnames('c-audio', { [addClass ?? ""]: addClass })}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onPlay={() => setPlay(true)}
        onPause={() => setPlay(false)}
        onVolumeChange={handleVolumeAudio}
        data-a11y={a11y}
        hidden
      >
        <source src={src} />
      </audio>
    </>
  )
}


