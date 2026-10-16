import { useState, forwardRef } from "react";

import { cn } from '@utils/cn';

import { imageBase } from "./image-base";
import type { ImageProps } from "../types/types";

import "./image.css";

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src = "none",
    alt = "",
    title = "Image 1.",
    size,
    addClass,
    noCaption = false,
    ...props
  },
  ref
) {
  // Guarda el `src` que falló al cargar. Se guarda el valor (y no un booleano) para que el error
  // deje de aplicar por sí solo cuando llega un `src` distinto.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  /**
   * Manejador de error para la imagen.
   * Si la imagen no se carga correctamente, registra el `src` que falló
   * para mostrar la imagen por defecto.
   */
  const onError = (): void => {
    setFailedSrc(src);
  };

  // Determina la fuente de la imagen a mostrar: la por defecto solo si falló el `src` actual.
  const imgToSee = failedSrc !== src ? src : imageBase;

  // Elemento HTML a renderizar, puede ser `div` o `figure` basado en `noCaption`.
  const Element = noCaption ? "div" : "figure";

  return (
    <Element
      className={cn("c-image", addClass)}
      {...(size && {
        style: { "--image-max-width": size } as React.CSSProperties,
      })}
    >
      <img ref={ref} src={imgToSee} alt={alt} onError={onError} {...props} />
      {!noCaption && (
        <figcaption className="c-image__figcaption">
          <p>
            {title ? <strong>{title}&nbsp;</strong> : null}
            {alt}
          </p>
        </figcaption>
      )}
    </Element>
  );
});
