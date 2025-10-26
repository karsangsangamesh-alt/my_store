# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production bundle
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint on the codebase

### PowerShell-Specific
Since this is a Windows environment with PowerShell, use PowerShell-native commands:
- `Get-ChildItem` instead of `ls`
- Environment variables: `$env:VARIABLE_NAME` instead of `$VARIABLE_NAME`

## Architecture

### Framework & Stack
- **Next.js 16** with App Router (not Pages Router)
- **React 19** with TypeScript
- **Tailwind CSS v4** for styling
- **Supabase** for backend/database
- **PWA support** via next-pwa

### Key Dependencies
- **SWR** - Data fetching and caching library for client-side state
- **Axios** - HTTP client for API requests
- **Framer Motion** - Animation library
- **React Hook Form** - Form state management and validation
- **clsx** - Utility for constructing className strings

### Project Structure
```
app/
  layout.tsx      - Root layout with Geist fonts (sans & mono)
  page.tsx        - Home page component
  globals.css     - Global styles with Tailwind and CSS variables
public/           - Static assets (SVG icons)
```

### Next.js App Router Pattern
This project uses the **App Router** (not Pages Router):
- All routes are file-based within the `app/` directory
- `layout.tsx` wraps all pages and defines shared UI
- `page.tsx` files define route pages
- Server Components by default (add `"use client"` for client components)
- `@/*` path alias maps to project root (configured in tsconfig.json)

### Styling Architecture
- Tailwind CSS v4 via PostCSS plugin
- CSS variables defined in `globals.css` for theming
- Dark mode support using `prefers-color-scheme`
- Custom theme variables: `--color-background`, `--color-foreground`, `--font-sans`, `--font-mono`
- Geist font family loaded via `next/font/google`

### State & Data Fetching
- **SWR** for client-side data fetching with automatic caching, revalidation
- **Supabase** client for database/auth operations
- React Hook Form for form state

## TypeScript Configuration
- Strict mode enabled
- Path alias `@/*` maps to project root
- ES2017 target
- JSX uses `react-jsx` (new JSX transform, no need to import React)

## Linting
- ESLint v9 with Next.js config
- Includes TypeScript-specific rules
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`
