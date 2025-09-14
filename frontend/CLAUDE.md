# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite frontend application for HackMIT2025. It's currently a fresh Vite template setup with minimal customization.

## Development Commands

```bash
# Start development server with hot module replacement
npm run dev

# Build for production (runs TypeScript compiler and Vite build)
npm run build

# Run ESLint for code linting
npm run lint

# Preview production build locally
npm run preview
```

## Technology Stack

- **React 19.1.1** - UI framework
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 7.1.2** - Build tool and dev server
- **ESLint** - Linting with React Hooks and React Refresh plugins

## Project Structure

The application follows standard Vite + React conventions:
- `src/` - Application source code
  - `main.tsx` - Application entry point
  - `App.tsx` - Root React component
  - `index.css` and `App.css` - Styling
- `public/` - Static assets
- TypeScript configuration split across:
  - `tsconfig.json` - Base configuration
  - `tsconfig.app.json` - Application code configuration
  - `tsconfig.node.json` - Node/Vite configuration

## Configuration Notes

- ESLint is configured with TypeScript and React support via `eslint.config.js`
- Vite uses the React plugin with default settings
- The project uses ES modules (`"type": "module"` in package.json)