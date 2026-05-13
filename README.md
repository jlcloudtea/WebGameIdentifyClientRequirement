# WebGameIdentifyClientRequirement

A Next.js + Tailwind CSS app that supports client requirement identification and documentation through interactive game-like UI components.

## Features

- Interactive client requirement identification game
- Documentation and scenario workflows
- Shadcn UI components with Tailwind CSS
- Prisma database schema support

## Local Development

```bash
bun install
bun dev
```

Open `http://localhost:3000` in your browser.

## Build

```bash
bun build
bun start
```

## Database

If you need to initialize or sync the Prisma schema:

```bash
bun prisma db push
bun prisma generate
```

## Notes

- This project uses Bun as the JavaScript runtime.
- The current branch is `main`.
