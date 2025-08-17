````markdown
# Barber Booking (Next.js + Prisma + SQLite)

Minimal full-stack barber booking demo you can run locally.

Prereqs:
- Node 18+
- pnpm/npm/yarn
- Git

Setup

1. Copy .env.example to .env
   cp .env.example .env

2. Install
   npm install

3. Generate Prisma client, migrate and seed
   npx prisma generate
   npx prisma migrate dev --name init
   # seed (uses ts-node)
   npx ts-node --transpile-only prisma/seed.ts

4. Run
   npm run dev
   Open http://localhost:3000

Push to GitHub (example)
# if repository already exists remotely:
git init
git add .
git commit -m "Add barber booking app"
git branch -M main
git remote add origin git@github.com:<your_user>/<your_repo>.git
git push -u origin main

Notes
- 30-minute slot granularity, working hours 09:00–17:00
- Booking conflict prevention uses start < existing.end && existing.start < end
- SQLite DB stored in dev.db by default
````