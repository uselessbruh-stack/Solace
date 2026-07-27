# Solace

**Your thoughts, beautifully organized.**

A modern, block-based note-taking web application built with a separated client/server architecture.

## Project Structure

```
Solace/
├── client/           ← Next.js frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.local
├── server/           ← Express music server
│   ├── src/
│   └── package.json
├── package.json      ← Root scripts (runs both)
└── readme.md
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, TipTap, Zustand |
| Server | Express, Node.js, yt-dlp |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Cloudinary (images) |
| Deployment | Vercel (client), Render (server) |

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (Auth + Firestore)
- Python + yt-dlp (`pip install yt-dlp`)

### Quick Setup

```bash
# 1. Install all dependencies (root + client + server)
npm install
npm run install:all

# 2. Fill in client/.env.local with your Firebase + Cloudinary config

# 3. Run both client and server together
npm run dev
```

Or run them individually:

```bash
# Terminal 1 — Frontend (port 3000)
npm run dev:client

# Terminal 2 — Music Server (port 4000)
npm run dev:server
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Home — recent & pinned notes |
| `/note/[id]` | Block editor |
| `/collections` | Note collections |
| `/favorites` | Starred notes |
| `/trash` | Deleted notes |
| `/settings` | Themes & account |

## License

Private — All rights reserved.
