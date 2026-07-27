# Solace

**A modern block-based note-taking workspace with embedded music and rich media.**

Solace is a premium note-taking app that combines a powerful block editor with embedded music playback, image support, and a beautiful theming system. Write notes with rich formatting, embed images and music that float alongside your text like a word processor, and customize your workspace with 20 handcrafted themes.

## Features

- **Block Editor** — TipTap-based rich text editor with slash commands, headings, lists, tasks, code blocks, highlights, links, and more
- **Embedded Music** — Search and embed music tracks directly in your notes with inline playback controls (powered by yt-dlp)
- **Resizable Images** — Insert images via URL with drag-to-resize and Word-style text wrapping (float left/right/center)
- **20 Themes** — 9 dark, 7 light, and 4 subtle/muted themes including Lavender, Rosé Pine, Gold, Ocean, Mint, and more
- **Collections** — Organize notes into folders with custom icons and colors
- **Favorites & Pinning** — Pin important notes and mark favorites for quick access
- **Trash & Recovery** — Soft-delete notes with restore capability
- **Real-time Autosave** — Content auto-saves to Firebase as you type
- **Word Count** — Live word count display in the editor

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| **Editor** | TipTap (ProseMirror), custom node extensions (ResizableImage, MusicNode) |
| **Backend** | Express 5, yt-dlp (music search & streaming) |
| **Auth & DB** | Firebase Auth, Cloud Firestore |
| **State** | Zustand, TanStack React Query |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

## Project Structure

```
Solace/
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/             # Pages & routes
│       │   ├── (auth)/      # Login & signup
│       │   └── (dashboard)/ # Main app
│       │       ├── dashboard/    # Note list
│       │       ├── note/[id]/    # Note editor
│       │       ├── collections/  # Folders
│       │       ├── favorites/    # Starred notes
│       │       ├── trash/        # Deleted notes
│       │       └── settings/     # Theme picker & account
│       ├── components/
│       │   ├── editor/      # TipTap editor, toolbar, slash menu, media nodes
│       │   └── ui/          # shadcn/ui components
│       ├── lib/             # Firebase, Firestore, themes, utilities
│       ├── providers/       # Auth & theme context providers
│       └── types/           # TypeScript type definitions
├── server/                  # Express music server
│   └── src/
│       ├── index.ts         # Server entry point
│       ├── routes/          # API routes (music search)
│       └── services/        # yt-dlp integration
└── package.json             # Workspace scripts (concurrently)
```

## Getting Started

### Prerequisites

- **Node.js** 18+
- **yt-dlp** installed and on PATH ([install guide](https://github.com/yt-dlp/yt-dlp#installation))
- **Firebase** project with Auth and Firestore enabled

### Setup

1. **Clone and install:**

```bash
git clone <repo-url> Solace
cd Solace
npm run install:all
```

2. **Configure Firebase** — create a Firebase project, enable Email/Password auth, and create a Firestore database. Add your Firebase config to the client.

3. **Run both servers:**

```bash
npm run dev
```

This starts both the Next.js frontend (port 3000) and Express music server (port 4000) via `concurrently`.

Or run them individually:

```bash
npm run dev:client   # Next.js on :3000
npm run dev:server   # Express on :4000
```

### Environment

The music server URL defaults to `http://localhost:4000`. To override, set:

```
NEXT_PUBLIC_MUSIC_SERVER_URL=http://localhost:4000
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Sign in with email |
| `/signup` | Create account |
| `/dashboard` | Notes list with search & sort |
| `/note/[id]` | Note editor with rich media |
| `/collections` | Note folders |
| `/favorites` | Favorited notes |
| `/trash` | Soft-deleted notes |
| `/settings` | Theme picker & account |

## Themes

20 handcrafted themes across 3 categories:

**Dark** — Midnight, Coffee, Ocean, Lavender Night, Rosé Pine, Emerald, Gold, Silver, Cherry

**Light** — Minimal, Lavender, Rose, Sand, Sky, Mint, Peach

**Subtle** — Slate, Olive, Parchment, Fog

Themes are applied via CSS custom properties and can be switched instantly from Settings.

## Editor Features

- **Slash commands** — Type `/` for quick insert menu (headings, lists, images, music, code blocks)
- **Floating toolbar** — Format text with bold, italic, underline, strikethrough, highlight, links
- **Image nodes** — Resizable with drag handle, Word-style text wrapping (left/right/center float)
- **Music nodes** — Inline audio player with play/pause, seek bar, resizable width, float positioning
- **Code blocks** — Syntax highlighting via lowlight
- **Task lists** — Interactive checkboxes with nesting
- **Keyboard shortcuts** — Standard formatting shortcuts (Ctrl+B, Ctrl+I, etc.)

## API Endpoints

### Music Server (Express, port 4000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/music/search?q=<query>` | Search for music tracks |
| `GET` | `/api/music/info/:videoId` | Get audio stream URL & metadata |

## License

Private — All rights reserved.
