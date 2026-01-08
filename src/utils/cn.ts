import clsx, { type ClassValue } from 'clsx'

/**
 * Combina nombres de clase de forma condicional
 * @param inputs - Valores de clase a combinar
 * @returns String con las clases combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}