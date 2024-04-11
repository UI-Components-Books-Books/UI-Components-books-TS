
/**
 * Función para convertir un tiempo dado en segundos a un formato de tiempo "mm:ss:ms".
 *
 * @param {number} time - Tiempo en segundos.
 * @returns {string} - Tiempo en formato "mm:ss:ms".
 */
export const converterTime = (time: number): string => {
    // Calcula los minutos
    const minutes = Math.floor((time % 3600) / 60);
    
    // Calcula los segundos
    const seconds = Math.floor(time % 60);
    
    // Calcula los milisegundos
    const milliseconds = Math.floor((time % 1) * 1000);
    
    // Devuelve el tiempo en formato "mm:ss:ms"
    return (
      ('0' + minutes).slice(-2) +
      ':' +
      ('0' + seconds).slice(-2) + 
      ':' +
      ('0' + milliseconds).slice(-2)
    );
  };