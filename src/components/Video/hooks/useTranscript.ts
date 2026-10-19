import { useEffect, useState } from "react";

export interface Cue {
    start: number;
    end: number;
    text: string;
}

/**
 * Convierte el tiempo del formato VTT a segundos.
 * Acepta HH:MM:SS.mmm, MM:SS.mmm y SS.mmm.
 */
const parseTime = (timeString: string): number => {
    const timeParts = timeString.split(":");

    let hours = "0";
    let minutes = "0";
    let seconds = "0";

    if (timeParts.length === 3) {
        // Formato: HH:MM:SS.MS
        [hours, minutes, seconds] = timeParts;
    } else if (timeParts.length === 2) {
        // Formato: MM:SS.MS
        [minutes, seconds] = timeParts;
    } else {
        // Formato solo SS.MS
        seconds = timeParts[0];
    }

    const [sec, ms] = seconds.split(".");
    const parsedSeconds = parseFloat(sec) + (ms ? parseFloat(`0.${ms}`) : 0);

    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parsedSeconds;
};

/**
 * Convierte el texto de un archivo VTT en una lista de cues.
 *
 * El archivo se divide en bloques separados por líneas en blanco. Solo los bloques que tienen una
 * línea de tiempos (`inicio --> fin`) son cues: lo que va antes de esa línea (el identificador
 * del cue) se ignora, y lo que va después es el texto. Los bloques de encabezado (`WEBVTT`),
 * `NOTE` o `STYLE` no tienen línea de tiempos, así que no se mezclan con los cues. Tras el tiempo
 * final pueden venir ajustes del cue (`align:start position:0%`), que también se ignoran.
 */
const parseVTT = (vttText: string): Cue[] => {
    const blocks = vttText.replace(/\r\n?/g, "\n").split(/\n\s*\n/);
    const cues: Cue[] = [];

    blocks.forEach((block) => {
        const lines = block.split("\n");
        const timingIndex = lines.findIndex((line) => line.includes("-->"));

        if (timingIndex === -1) return;

        const [startText = "", endText = ""] = lines[timingIndex].split(/\s*-->\s*/);
        const start = parseTime(startText.trim());
        const end = parseTime(endText.trim().split(/\s+/)[0]);

        if (Number.isNaN(start) || Number.isNaN(end)) return;

        const text = lines
            .slice(timingIndex + 1)
            .map((line) => line.trim())
            .filter(Boolean)
            .join(" ");

        cues.push({ start, end, text });
    });

    return cues;
};

/**
 * Hook personalizado para cargar la transcripción de un video a partir de un archivo VTT.
 *
 * Descarga y analiza el archivo, y devuelve la transcripción estructurada. Qué cue está activo no
 * lo decide el hook: se calcula con el tiempo del reproductor, que es la única fuente de verdad.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API
 *
 * @example
 *  const { transcript } = useTranscript('subtitles.vtt');
 *
 * @param {string} [caption] - URL del archivo VTT que contiene la transcripción del video.
 *
 * @returns {Object} Hook de transcripción.
 * @returns {Cue[]} return.transcript - Lista de objetos `Cue` representando los segmentos de la transcripción.
 */
export const useTranscript = (caption?: string) => {
    const [transcript, setTranscript] = useState<Cue[]>([]);

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

    return { transcript };
};
