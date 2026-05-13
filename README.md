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

## Deploy to Vercel

Go to [vercel.com/signup](https://vercel.com/signup)  
Click **Continue with GitHub** → Authorize Vercel  
Click **"Add New..."** → **Project**  

You'll see your GitHub repos listed:

```
┌─────────────────────────────────────────────┐
│  Import Git Repository                       │
│                                              │
│  🔍 WebGameIdentifyClientRequirement  [Import] │
│                                              │
└─────────────────────────────────────────────┘
```

Click **Import** on your repo  

Configure deployment (default settings are perfect):

```
┌────────────────────────────────────────────────┐
│  Configure Project                              │
│                                                 │
│  Project Name: WebGameIdentifyClientRequirement │
│  Framework:    Next.js  (auto-detected ✅)      │
│  Root Dir:     ./          (leave default ✅)   │
│  Build Cmd:    next build  (leave default ✅)   │
│  Output Dir:   .next       (leave default ✅)   │
│                                                 │
│  Environment Variables: None needed ✅          │
│                                                 │
│              [Deploy]  ← Click this!            │
└────────────────────────────────────────────────┘
```

Click **Deploy** 🚀  
Wait ~2 minutes while Vercel builds and deploys
