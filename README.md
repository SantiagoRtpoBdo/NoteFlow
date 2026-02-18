# NoteFlow

Workspace de documentos inspirado en Notion, desarrollado como proyecto personal para afianzar habilidades en desarrollo fullstack moderno.

## Tecnologías

- **Next.js 16** — App Router, Server Components, Server Actions
- **TypeScript** — Tipado estricto en todo el proyecto
- **Tailwind CSS + shadcn/ui** — Sistema de diseño con componentes accesibles
- **Supabase** — Auth, PostgreSQL con Row Level Security
- **TipTap** — Editor de texto enriquecido (headings, listas, tareas, código, links)
- **Zustand** — Estado global mínimo (sidebar, editor)

## Funcionalidades

- Autenticación (registro/login con email)
- Workspaces con roles (owner, editor, viewer)
- Páginas anidadas en estructura de árbol
- Editor rich text con auto-guardado
- Búsqueda rápida (Ctrl+K)
- Compartir páginas por email con roles
- Páginas públicas
- Tema oscuro/claro
- Diseño responsive

## Inicio rápido

```bash
npm install
cp .env.example .env.local  # Configurar credenciales de Supabase
npm run dev
```

Ejecutar `supabase/migrations/002_fixed_schema.sql` en el SQL Editor de Supabase para crear las tablas.

## Licencia

MIT
