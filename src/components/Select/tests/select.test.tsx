import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Item } from 'react-stately'
import { describe, expect, it, vi } from 'vitest'

import { Select } from '../index'
import type { SelectProps } from '../types/types'

type Props = Partial<SelectProps>

const setup = (props: Props = {}) =>
  render(
    <Select label="Fruta favorita" name="fruta" {...props}>
      <Item key="manzana">Manzana</Item>
      <Item key="pera">Pera</Item>
      <Item key="uva">Uva</Item>
    </Select>
  )

const trigger = () => screen.getByRole('button', { name: /Seleccionar|Manzana|Pera|Uva|Elige/ })

describe('Select', () => {
  describe('estado cerrado', () => {
    it('muestra el placeholder por defecto "Seleccionar"', () => {
      setup()

      expect(screen.getByRole('button')).toHaveTextContent('Seleccionar')
    })

    it('permite personalizar el placeholder', () => {
      setup({ placeholder: 'Elige una fruta' })

      expect(screen.getByRole('button')).toHaveTextContent('Elige una fruta')
    })

    it('el label está disponible para lectores de pantalla pero oculto visualmente', () => {
      const { container } = setup()

      const label = container.querySelector('.u-sr-only')
      expect(label).toHaveTextContent('Fruta favorita')
    })

    it('la lista de opciones no está en el DOM mientras está cerrado', () => {
      setup()

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('el botón anuncia que abre una lista', () => {
      setup()

      expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'listbox')
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
    })

    it('agrega addClass al contenedor', () => {
      const { container } = setup({ addClass: 'mi-select' })

      expect(container.querySelector('.c-select')).toHaveClass('mi-select')
    })

    it('muestra la opción de defaultSelectedKey', () => {
      setup({ defaultSelectedKey: 'pera' })

      expect(screen.getByRole('button')).toHaveTextContent('Pera')
    })

    it('puede estar deshabilitado', () => {
      setup({ isDisabled: true })

      expect(screen.getByRole('button')).toBeDisabled()
    })
  })

  describe('apertura', () => {
    // Con el popover abierto react-aria oculta (aria-hidden) el resto de la página, incluido el
    // botón disparador, por eso se conserva su referencia antes de abrir.
    it('al hacer click muestra un listbox con todas las opciones', async () => {
      setup()
      const button = trigger()

      await userEvent.click(button)

      const listbox = await screen.findByRole('listbox')
      expect(listbox).toBeInTheDocument()
      expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Manzana', 'Pera', 'Uva'])
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('el listbox queda asociado al botón por aria-controls', async () => {
      setup()
      const button = trigger()

      await userEvent.click(button)

      const listbox = await screen.findByRole('listbox')
      expect(button).toHaveAttribute('aria-controls', listbox.id)
    })

    it('oculta el resto de la página de las tecnologías de asistencia mientras está abierto', async () => {
      setup()
      expect(screen.getByRole('button', { name: /Seleccionar/ })).toBeInTheDocument()

      await userEvent.click(trigger())
      await screen.findByRole('listbox')

      // El único botón accesible es el DismissButton que react-aria añade dentro del popover.
      expect(screen.queryByRole('button', { name: /Seleccionar/ })).not.toBeInTheDocument()
    })

    it('se puede abrir con el teclado', async () => {
      setup()

      await userEvent.tab()
      await userEvent.keyboard('{Enter}')

      expect(await screen.findByRole('listbox')).toBeInTheDocument()
    })

    it('no se abre cuando está deshabilitado', async () => {
      setup({ isDisabled: true })

      await userEvent.click(screen.getByRole('button'))

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('selección', () => {
    it('al elegir una opción la muestra en el botón, cierra la lista y notifica', async () => {
      const onSelectionChange = vi.fn()
      setup({ onSelectionChange })
      await userEvent.click(trigger())

      await userEvent.click(await screen.findByRole('option', { name: 'Uva' }))

      expect(onSelectionChange).toHaveBeenCalledWith('uva')
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      expect(screen.getByRole('button')).toHaveTextContent('Uva')
    })

    it('marca como seleccionada la opción actual cuando se vuelve a abrir', async () => {
      setup({ defaultSelectedKey: 'pera' })

      await userEvent.click(trigger())

      expect(await screen.findByRole('option', { name: 'Pera' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('option', { name: 'Manzana' })).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('option', { name: 'Pera' })).toHaveAttribute('data-option-select', 'true')
    })

    it('se puede elegir con el teclado (flechas + Enter)', async () => {
      const onSelectionChange = vi.fn()
      setup({ onSelectionChange })
      await userEvent.tab()
      await userEvent.keyboard('{Enter}')
      await screen.findByRole('listbox')

      await userEvent.keyboard('{ArrowDown}{Enter}')

      expect(onSelectionChange).toHaveBeenCalledTimes(1)
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
    })

    it('Escape cierra la lista sin cambiar la selección', async () => {
      const onSelectionChange = vi.fn()
      setup({ onSelectionChange, defaultSelectedKey: 'manzana' })
      await userEvent.click(trigger())
      await screen.findByRole('listbox')

      await userEvent.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
      expect(onSelectionChange).not.toHaveBeenCalled()
      expect(screen.getByRole('button')).toHaveTextContent('Manzana')
    })

    it('respeta selectedKey cuando se usa como componente controlado', async () => {
      const onSelectionChange = vi.fn()
      setup({ selectedKey: 'manzana', onSelectionChange })
      await userEvent.click(trigger())

      await userEvent.click(await screen.findByRole('option', { name: 'Uva' }))

      expect(onSelectionChange).toHaveBeenCalledWith('uva')
      expect(screen.getByRole('button')).toHaveTextContent('Manzana')
    })
  })

  describe('integración con formularios', () => {
    it('incluye un select oculto con el name recibido', () => {
      const { container } = setup()

      const hidden = container.querySelector('select[name="fruta"]')
      expect(hidden).toBeInTheDocument()
    })

    it('el select oculto refleja la opción elegida', async () => {
      const { container } = setup()
      await userEvent.click(trigger())

      await userEvent.click(await screen.findByRole('option', { name: 'Pera' }))

      await waitFor(() =>
        expect((container.querySelector('select[name="fruta"]') as HTMLSelectElement).value).toBe('pera')
      )
    })
  })
})
