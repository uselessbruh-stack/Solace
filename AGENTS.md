<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `client/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Solace Project Structure

- `client/` — Next.js 16 frontend (all source code in `client/src/`)
- `server/` — Express 5 music server (yt-dlp integration, port 4000)
- Root `package.json` has workspace scripts to run both via `concurrently`

## Key Directories

### Client (`client/src/`)

- `app/` — Next.js pages and routes (App Router)
  - `(auth)/` — Login/signup pages
  - `(dashboard)/` — Main workspace (dashboard, note editor, collections, favorites, trash, settings)
- `components/editor/` — TipTap editor system
  - `NoteEditor.tsx` — Main editor component, extension configuration
  - `EditorToolbar.tsx` — Formatting toolbar with link support
  - `SlashMenu.tsx` — Slash command dropdown menu
  - `ResizableImage.tsx` — Custom TipTap node: resizable image with float positioning
  - `MusicNode.tsx` — Custom TipTap node: inline music player with resize & float
  - `MusicSearchDialog.tsx` — Music search dialog (queries Express server)
  - `ImageUploadDialog.tsx` — Image URL input dialog
- `components/ui/` — shadcn/ui base components
- `lib/themes.ts` — 20 theme definitions (dark, light, subtle)
- `lib/firestore.ts` — Firestore CRUD for notes, collections, user profiles
- `lib/auth.ts` — Firebase Auth helpers
- `providers/` — ThemeProvider, AuthProvider context
- `types/index.ts` — Shared TypeScript types (Note, Collection, ThemeKey, etc.)

### Server (`server/src/`)

- `index.ts` — Express server entry (CORS, helmet, compression)
- `routes/music.ts` — `/api/music/search` and `/api/music/info/:videoId` endpoints
- `services/ytdlp.ts` — yt-dlp child process wrapper for search & stream URLs

## Conventions

- Theme colors use CSS custom properties (`--background`, `--foreground`, etc.) applied via `ThemeProvider`
- Editor nodes use `ReactNodeViewRenderer` with `any` props type (TipTap type workaround)
- Media nodes support Word-style float: `float` attribute ("left"/"right"/"none") with CSS `display: contents` on wrappers
- All toolbar/dialog buttons use `onMouseDown={e => e.preventDefault()}` to prevent editor blur
