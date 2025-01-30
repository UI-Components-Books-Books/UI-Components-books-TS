import { useEffect, useState } from "react";

interface Cue {
    start: number;
    end: number;
    text: string;
}

/**
 * Hook personalizado para gestionar y sincronizar la transcripción de un video a partir de un archivo VTT.
 *
 * Este hook carga, analiza y sincroniza las pistas de subtítulos de un video específico, proporcionando la transcripción estructurada y el ID del cue actualmente activo.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
 *
 * @example
 *  const { transcript, currentCueId } = useTranscript('myVideo', 'subtitles.vtt');
 *
 * @param {string} uid - Identificador único del elemento de video al que se asociará la transcripción.
 * @param {string} [caption] - URL del archivo VTT que contiene la transcripción del video.
 *
 * @returns {Object} Hook de transcripción.
 * @returns {Cue[]} return.transcript - Lista de objetos `Cue` representando los segmentos de la transcripción.
 * @returns {number | null} return.currentCueId - Índice del cue actualmente activo, o `null` si no hay ninguno.
 */
export const useTranscript = (uid: string, caption?: string) => {
    const [transcript, setTranscript] = useState<Cue[]>([]); 
    const [currentCueId, setCurrentCueId] = useState<number | null>(null);

    // Cargar y parsear el archivo .vtt
    useEffect(() => {
        if (!caption) return;

        const loadTranscript = async () => {
            try {
                const response = await fetch(caption);
                const text = await response.text();

                const parsedTranscript = parseVTT(text);
                setTranscript(parsedTranscript);
            } catch (error) {
                console.error("Error cargando la transcripción:", error);
            }
        };

        loadTranscript();
    }, [caption]);

    // Configurar el evento cuechange
    useEffect(() => {
        const videoElement = document.querySelector(
            `video[id="${uid}"]`
        ) as HTMLVideoElement | null;

        if (videoElement && transcript.length > 0) {
            const textTrack = videoElement.textTracks[0]; // Selecciona la primera pista de texto

            textTrack.oncuechange = () => {
                const activeCue = textTrack.activeCues?.[0] as VTTCue | undefined;

                if (activeCue) {
                    // Encuentra el ID del cue activo en la transcripción
                    const cueId = transcript.findIndex(
                        (cue) =>
                            cue.start === activeCue.startTime && cue.end === activeCue.endTime
                    );

                    setCurrentCueId(cueId !== -1 ? cueId : null);
                } else {
                    setCurrentCueId(null);
                }
            };
        }
    }, [transcript, uid]);

    // Función para parsear el archivo .vtt
    const parseVTT = (vttText: string): Cue[] => {
        const lines = vttText.split("\n");
        const cues: Cue[] = [];
        let currentCue: Cue | null = null;

        lines.forEach((line) => {
            if (line.includes("-->")) {
                if (currentCue) {
                    cues.push(currentCue);
                }

                const [start, end] = line.split(" --> ");
                currentCue = {
                    start: parseTime(start),
                    end: parseTime(end),
                    text: "",
                };
            } else if (currentCue && line.trim()) {
                currentCue.text += line.trim() + " ";
            }
        });

        if (currentCue) {
            cues.push(currentCue);
        }

        return cues;
    };

    // Convierte el tiempo del formato VTT a segundos
    const parseTime = (timeString: string): number => {
        const [hours, minutes, seconds] = timeString
            .split(":")
            .map((part) => parseFloat(part.replace(",", ".")));
        return hours * 3600 + minutes * 60 + seconds;
    };

    return { transcript, currentCueId };
};
