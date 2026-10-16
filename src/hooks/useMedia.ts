import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Índice que representa "ninguna media query hace match".
 * También es el valor que se usa al renderizar en el servidor, donde no existe `window`.
 */
const NO_MATCH = -1;

/**
 * En el servidor no hay media queries: se asume que ninguna hace match,
 * así el HTML generado y el primer render de la hidratación usan siempre el defaultValue.
 */
const getServerSnapshot = (): number => NO_MATCH;

/**
 * Hook para crear Media Queries.
 *
 * Realiza la creación y control de Media queries personalizadas.
 * Esto facilita el uso de estas en la lógica de cualquier componente.
 *
 * Es seguro en el servidor (SSR): allí devuelve el defaultValue. Al hidratar en el navegador,
 * el primer render también usa el defaultValue para coincidir con el HTML del servidor y
 * enseguida se actualiza con el valor real.
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
   * Las queries serializadas son la dependencia estable de todo lo que sigue:
   * solo cambian cuando cambia su contenido, no su referencia (normalmente
   * llegan como un arreglo literal nuevo en cada render).
   */
  const queriesKey = JSON.stringify(queries);

  /**
   * Arreglo que contiene una media query list por cada una de las queries.
   * Se crean una sola vez por cada conjunto de queries.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList
   */
  const mediaQueryLists = useMemo<MediaQueryList[]>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return [];

    return (JSON.parse(queriesKey) as string[]).map((query) => window.matchMedia(query));
  }, [queriesKey]);

  /**
   * Se suscribe al evento change de cada media query.
   * Retorna la función que elimina los eventListener.
   */
  const subscribe = useCallback(
    (onChange: () => void) => {
      mediaQueryLists.forEach((mediaQuery) => mediaQuery.addEventListener('change', onChange));

      return () => {
        mediaQueryLists.forEach((mediaQuery) => mediaQuery.removeEventListener('change', onChange));
      };
    },
    [mediaQueryLists]
  );

  /**
   * Índice de la primera media query que haga match o -1 si no hay ninguna.
   * Es un número, por lo que React solo vuelve a renderizar cuando cambia la query ganadora.
   */
  const getSnapshot = useCallback(
    (): number => mediaQueryLists.findIndex((mediaQuery) => mediaQuery.matches),
    [mediaQueryLists]
  );

  const index = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Retornamos el valor relacionado o el defaultValue si no hay ninguno.
  return typeof values[index] !== 'undefined' ? values[index] : defaultValue;
};

export { useMedia };
