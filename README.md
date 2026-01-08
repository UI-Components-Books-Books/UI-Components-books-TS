<h1 align="center">
  <img src="./public/logo.jpg" alt="Books UI" width="100" />
  <br />
  Books UI
</h1>

<p align="center">
  <strong>Biblioteca moderna de componentes React con TypeScript</strong>
</p>

<p align="center">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/books-ui">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/books-ui">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.2-blue">
  <img alt="React" src="https://img.shields.io/badge/React-18.2-61dafb">
  <img alt="License" src="https://img.shields.io/npm/l/books-ui">
</p>

<br />

## 🎯 Acerca de Books UI

Books UI es una biblioteca completa de componentes de interfaz de usuario diseñada para construir aplicaciones React modernas, accesibles y altamente personalizables. Con más de 20 componentes listos para usar, Books UI acelera tu desarrollo sin comprometer la calidad.

### ✨ Características principales

- 🎨 **20+ Componentes** - Desde botones hasta componentes complejos como drag & drop, modal, tabs, video player, y más
- 📘 **TypeScript First** - Tipado completo y seguro con excelente experiencia de desarrollo
- ♿ **Accesible** - Sigue las especificaciones WAI-ARIA con atributos `aria-*` correctos
- 🎭 **Altamente Personalizable** - Componentes flexibles que se adaptan a tus necesidades
- ⚡ **Rendimiento Optimizado** - Construido con las mejores prácticas de React
- 🎪 **Storybook** - Documentación interactiva con ejemplos en vivo

## 📦 Instalación

```bash
# Usando npm
npm install books-ui @popperjs/core gsap

# Usando yarn
yarn add books-ui @popperjs/core gsap

# Usando pnpm
pnpm add books-ui @popperjs/core gsap
```

### Peer Dependencies

Books UI requiere React 18.2 o superior:

```bash
npm install react@^18.2.0 react-dom@^18.2.0
```

## 🚀 Inicio Rápido

1. **Importa los estilos** en el archivo principal de tu aplicación:

```tsx
import "books-ui/styles";
```

2. **Comienza a usar los componentes**:

```tsx
import { Button, Modal, Tabs, Video } from "books-ui";

function App() {
  return (
    <div>
      <Button variant="primary">Click me!</Button>
    </div>
  );
}
```

## 📚 Componentes Disponibles

### Layout & Estructura
- `Row` / `Col` - Sistema de grid flexible
- `Panel` - Paneles colapsables y navegación
- `Tabs` - Pestañas con soporte para navegación

### Formularios & Inputs
- `Button` - Botones con múltiples variantes
- `Checkbox` - Casillas de verificación personalizables
- `Radio` - Botones de radio con grupos
- `Select` - Selector con búsqueda y opciones múltiples
- `NumberInput` - Input numérico con steppers
- `Switch` - Interruptor toggle

### Feedback & Overlays
- `Modal` - Diálogos modales accesibles
- `Popover` - Contenido contextual flotante
- `Tooltip` - Información de ayuda
- `Toggletip` - Tooltips interactivos

### Multimedia
- `Audio` - Reproductor de audio personalizable
- `Video` - Reproductor de video con controles avanzados
- `Image` - Imágenes optimizadas con lazy loading

### Interacción
- `DragAndDrop` - Sistema completo de arrastrar y soltar
- `Accordion` - Paneles expansibles
- `Tour` - Guías interactivas para usuarios
- `Pagination` - Paginación de contenido

### Navegación & Información
- `Filter` - Filtros dinámicos
- `Icon` - Iconos personalizables
- `Kbd` - Atajos de teclado visuales
- `Interpreter` - Componente para interpretación

## 📖 Documentación

Visita nuestra [documentación completa](https://books-ui-docs.netlify.app/) con ejemplos interactivos y guías detalladas.

Para explorar todos los componentes en Storybook:

```bash
npm run storybook
```

## 🎨 Personalización

Books UI está diseñado para ser altamente personalizable. Cada componente acepta clases CSS personalizadas y props de estilo:

```tsx
import { Button } from "books-ui";

<Button className="mi-clase-personalizada" style={{ borderRadius: '20px' }}>
  Botón Personalizado
</Button>
```

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar Storybook en modo desarrollo
npm run storybook

# Construir la biblioteca
npm run build
```

## 🔗 Enlaces

- [Documentación](https://books-ui-docs.netlify.app/)
- [NPM Package](https://www.npmjs.com/package/books-ui)
- [GitHub Repository](https://github.com/UI-Components-Books-Books/UI-Components-books-TS)

## ❤️ Hecho con el 💙 en Books&Books  

Nos enorgullece desarrollar este proyecto como parte del compromiso de **Books&Books** con la educación y la innovación tecnológica. 🌟 

Gracias por visitar nuestro proyecto. ¡Juntos podemos hacer del aprendizaje una experiencia increíble! 🥳✨