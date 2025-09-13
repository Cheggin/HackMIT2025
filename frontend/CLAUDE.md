# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start the Vite development server with hot module replacement
- `npm run build` - Run TypeScript compiler and build for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

### TypeScript
The project uses TypeScript with a project references setup:
- `tsconfig.app.json` - Configuration for application code in src/
- `tsconfig.node.json` - Configuration for Vite config and other Node.js files

## Architecture

This is a React application built with Vite as the build tool and bundler. The project structure follows a standard Vite + React + TypeScript template:

- **Build System**: Vite with React plugin for fast HMR and optimized builds
- **Frontend Framework**: React 19 with functional components and hooks
- **Type System**: TypeScript with strict type checking
- **Styling**: CSS modules (App.css, index.css)
- **Entry Point**: src/main.tsx renders the App component into the root element
- **Component Structure**: Components are defined in src/ directory as .tsx files

The application currently uses the default Vite template structure with a simple counter component demonstration in App.tsx.