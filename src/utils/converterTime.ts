
/**
 * Convierte los segundos totales en un objeto con horas, minutos y segundos.
 * @param {number} time - Total de segundos a convertir
 * @returns {object} - Objeto que contiene horas, minutos y segundos
 */
export const convertTime = (time: number): { hours: string, minutes: string, seconds: string } => {
  // Calcula las horas, minutos y segundos
  const hours = Math.floor(time / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');

  return { hours, minutes, seconds };
}


/**
 * Formatea los segundos totales en una cadena de tiempo.
 * @param { number } time - Total de segundos a formatear
 * @returns {string} - Cadena de tiempo en el formato 'hh:mm:ss' o 'mm:ss'
 */
export const formatTime = (time: number): string => {
  const { hours, minutes, seconds } = convertTime(time);

  // Comprueba si las horas son cero, si es así, devuelve la cadena de tiempo en formato 'mm:ss'
  return hours === '00' ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
}