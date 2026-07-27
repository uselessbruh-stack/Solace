# Echoes

**Every memory has a soundtrack.**

Echoes is a premium memory journal where you preserve meaningful moments by combining photos, music snippets, and personal notes. Relive memories through emotion, not just images.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, Zustand
- **Backend:** Next.js Route Handlers, MongoDB Atlas, Mongoose, Better Auth
- **Storage:** Cloudinary (images), Cloudflare R2 (audio)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster
- Cloudinary account
- Cloudflare R2 bucket (for audio uploads)

### Setup

1. Clone and install dependencies:

```bash
cd echoes
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in your credentials in `.env.local`:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `BETTER_AUTH_SECRET` | Random secret (min 32 chars) |
| `BETTER_AUTH_URL` | App URL (http://localhost:3000 for dev) |
| `NEXT_PUBLIC_APP_URL` | Same as BETTER_AUTH_URL |
| `CLOUDINARY_*` | Cloudinary credentials |
| `R2_*` | Cloudflare R2 credentials |

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Memory timeline & grid view |
| `/create-memory` | Create a new memory |
| `/memory/[id]` | Memory detail & cinematic replay |
| `/collections` | Memory collections |
| `/favorites` | Favorited memories |
| `/calendar` | Calendar view |
| `/profile` | User profile |
| `/settings` | App settings |

## Deploy to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

## License

Private — All rights reserved.
