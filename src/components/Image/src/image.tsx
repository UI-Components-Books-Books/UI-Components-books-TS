import { useState, forwardRef } from "react";

import classnames from "classnames";

import { imageBase } from "./image-base";
import "./image.css";

interface Props {
  src?: string;
  alt?: string;
  title?: string;
  size?: string;
  addClass?: string;
  noCaption?: boolean;
}

export const Image: React.FC<Props> = forwardRef<HTMLImageElement, Props>(
  function Image(
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
    // Estado para determinar si se muestra la imagen por defecto.
    const [error, setError] = useState<boolean>(false);

    /**
     * Manejador de error para la imagen.
     * Si la imagen no se carga correctamente, cambia el estado `error`
     * para mostrar la imagen por defecto.
     */
    const onError = (): void => {
      setError(true);
    };

    // Determina la fuente de la imagen a mostrar dependiendo del estado `error`.
    const imgToSee = !error ? src : imageBase;

    // Elemento HTML a renderizar, puede ser `div` o `figure` basado en `noCaption`.
    const Element = noCaption ? "div" : "figure";

    return (
      <Element
        className={classnames("c-image", { [addClass ?? ""]: addClass })}
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
  }
);
