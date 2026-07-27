<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `client/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Solace Project Structure

- `client/` — Next.js frontend (all source code in `client/src/`)
- `server/` — Express music server (yt-dlp integration)
- Root `package.json` has workspace scripts to run both
