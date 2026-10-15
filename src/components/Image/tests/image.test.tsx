import { createRef } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Image } from '../index'

const img = (container: HTMLElement) => container.querySelector('img') as HTMLImageElement
const FALLBACK = 'data:image/png;base64,'

describe('Image', () => {
  describe('estructura', () => {
    it('renderiza un figure con la imagen y su figcaption por defecto', () => {
      const { container } = render(<Image src="/foto.png" alt="Un gato" />)

      expect(container.firstElementChild?.tagName).toBe('FIGURE')
      expect(container.firstElementChild).toHaveClass('c-image')
      expect(img(container)).toHaveAttribute('src', '/foto.png')
      expect(container.querySelector('figcaption')).toBeInTheDocument()
    })

    it('con noCaption renderiza un div y no dibuja figcaption', () => {
      const { container } = render(<Image src="/foto.png" alt="Un gato" noCaption />)

      expect(container.firstElementChild?.tagName).toBe('DIV')
      expect(container.querySelector('figcaption')).not.toBeInTheDocument()
    })

    it('agrega addClass al contenedor', () => {
      const { container } = render(<Image src="/foto.png" addClass="mi-imagen" />)

      expect(container.firstElementChild).toHaveClass('c-image', 'mi-imagen')
    })

    it('reenvía la ref y los atributos HTML al <img>', () => {
      const ref = createRef<HTMLImageElement>()
      const { container } = render(<Image src="/foto.png" ref={ref} loading="lazy" width={120} />)

      expect(ref.current).toBe(img(container))
      expect(img(container)).toHaveAttribute('loading', 'lazy')
      expect(img(container)).toHaveAttribute('width', '120')
    })
  })

  describe('texto', () => {
    it('muestra el alt y el título "Image 1." por defecto en el pie de imagen', () => {
      const { container } = render(<Image src="/foto.png" alt="Un gato" />)

      const caption = container.querySelector('figcaption')
      expect(img(container)).toHaveAttribute('alt', 'Un gato')
      expect(caption).toHaveTextContent('Image 1.')
      expect(caption).toHaveTextContent('Un gato')
    })

    it('muestra el título recibido en negrita', () => {
      const { container } = render(<Image src="/foto.png" alt="Un gato" title="Figura 3." />)

      expect(container.querySelector('figcaption strong')).toHaveTextContent('Figura 3.')
    })

    it('si el título es vacío no dibuja la negrita', () => {
      const { container } = render(<Image src="/foto.png" alt="Un gato" title="" />)

      expect(container.querySelector('figcaption strong')).not.toBeInTheDocument()
      expect(container.querySelector('figcaption')).toHaveTextContent('Un gato')
    })

    it('usa alt vacío por defecto (imagen decorativa)', () => {
      const { container } = render(<Image src="/foto.png" />)

      expect(img(container)).toHaveAttribute('alt', '')
    })
  })

  describe('tamaño', () => {
    it('expone el tamaño máximo como variable CSS --image-max-width', () => {
      const { container } = render(<Image src="/foto.png" size="320px" />)

      expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--image-max-width')).toBe('320px')
    })

    it('sin size no define estilo en el contenedor', () => {
      const { container } = render(<Image src="/foto.png" />)

      expect(container.firstElementChild).not.toHaveAttribute('style')
    })
  })

  describe('imagen por defecto cuando falla la carga', () => {
    it('reemplaza el src por una imagen embebida si la original falla', () => {
      const { container } = render(<Image src="/no-existe.png" alt="Rota" />)
      expect(img(container)).toHaveAttribute('src', '/no-existe.png')

      fireEvent.error(img(container))

      expect(img(container).getAttribute('src')?.startsWith(FALLBACK)).toBe(true)
    })

    it('usa "none" como src cuando no se pasa ninguno', () => {
      const { container } = render(<Image />)

      expect(img(container)).toHaveAttribute('src', 'none')
    })

    // BUG CONOCIDO: el estado `error` nunca se reinicia. Si la imagen falla y luego llega un
    // `src` válido (p. ej. al reutilizar el componente en una lista), se sigue mostrando la
    // imagen por defecto. Cuando se corrija este test fallará: quitar `.fails`.
    it.fails('vuelve a mostrar la imagen cuando llega un nuevo src después de un error', () => {
      const { container, rerender } = render(<Image src="/rota.png" alt="x" />)
      fireEvent.error(img(container))

      rerender(<Image src="/buena.png" alt="x" />)

      expect(img(container)).toHaveAttribute('src', '/buena.png')
    })
  })
})
