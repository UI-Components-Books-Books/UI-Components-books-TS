import { useEffect, useRef, useState } from 'react';

/**
 * Obtiene uno de los valores de values basado en la propiedad matches
 * de cada media query.
 *
 * @returns El valor relacionado con la primera media query que haga match o el defaultValue si no hay ninguna.
 */
const getMatchedValue = <T>(mediaQueryList: MediaQueryList[], values: T[], defaultValue: T): T => {
  // Obtenemos el index del primer media query que haya hecho match.
  const index = mediaQueryList.findIndex((mediaQuery) => mediaQuery.matches);

  // Retornamos el valor relacionado o el defaultValue si no hay ninguno.
  return typeof values[index] !== 'undefined' ? values[index] : defaultValue;
};

/**
 * Hook para crear Media Queries.
 *
 * Realiza la creación y control de Media queries personalizadas.
 * Esto facilita el uso de estas en la lógica de cualquier componente.
 *
 * @example
 *  // Media query para controlar el número de columnas en una página.
 *
 *  const columnCount = useMedia<number>(
 *   // Media queries
 *   ["(min-width: 1500px)", "(min-width: 1000px)", "(min-width: 600px)"],
 *   // Cantidad de columnas ( Están relacionadas con las media queries por medio del indice del arreglo).
 *   [5, 4, 3],
 *   // Cantidad de columnas por defecto.
 *   2
 * );
 *
 * @param {Array} queries - Arreglo de queries.
 * @param {Array} values - Arreglo de valores de cada queries.
 * @param {T} defaultValue - Valor por defecto.
 *
 * @returns {T} Retorna el valor de la media query al cumplirse.
 */
const useMedia = <T>(queries: string[], values: T[], defaultValue: T): T => {
  /**
   * Guardamos siempre los últimos values y defaultValue en una ref.
   * Normalmente llegan como literales nuevos en cada render, así que no pueden ser
   * dependencias del efecto sin que este se vuelva a suscribir en cada render.
   */
  const valuesRef = useRef(values);
  const defaultValueRef = useRef(defaultValue);

  useEffect(() => {
    valuesRef.current = values;
    defaultValueRef.current = defaultValue;
  });

  /**
   * Las queries serializadas son la dependencia estable del efecto:
   * solo cambian cuando cambia su contenido, no su referencia.
   */
  const queriesKey = JSON.stringify(queries);

  /**
   * Estado que almacena el valor de la propiedad matches
   * del MediaQueryList.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/matches
   */
  const [value, setValue] = useState<T>(() =>
    getMatchedValue(
      queries.map((query) => window.matchMedia(query)),
      values,
      defaultValue
    )
  );

  useEffect(() => {
    /**
     * Arreglo que contiene una media query list
     * por cada una de las queries.
     */
    const mediaQueryList = (JSON.parse(queriesKey) as string[]).map((query) =>
      window.matchMedia(query)
    );

    /**
     * Función callback que se llama cada vez que
     * cambia el estado de la media query.
     *
     */
    const handler = () =>
      setValue(() => getMatchedValue(mediaQueryList, valuesRef.current, defaultValueRef.current));

    // Sincronizamos el valor por si las queries cambiaron después del primer render.
    handler();

    // Agregamos un eventListener por cada uno de las media query.
    mediaQueryList.forEach((mediaQuery) => mediaQuery.addEventListener('change', handler));

    return () => {
      // Eliminamos el eventListener de cada media query.
      mediaQueryList.forEach((mediaQuery) => mediaQuery.removeEventListener('change', handler));
    };
  }, [queriesKey]);

  return value;
};

export { useMedia };
