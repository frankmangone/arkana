# Arkana Frontend

A multilingual Next.js blog.

## 🌍 Languages

Content is organized by locale in `src/content/`:

- `en` (English)
- `es` (Spanish)
- `pt` (Portuguese)

## 🚀 Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3333](http://localhost:3333).

### Environment

Create `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8082

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Site URL
NEXT_PUBLIC_SITE_URL=https://arkana.blog

# Optional: enable testnet chains
NEXT_PUBLIC_DEV_MODE=false
```

## 🧰 Scripts

| Script                 | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start dev server (`:3333`)                 |
| `npm run build`        | Build production app                       |
| `npm run start`        | Start production server                    |
| `npm run lint`         | Run lint checks                            |
| `npm run scrap:medium` | Run Medium scraper pipeline                |
| `npm run post:medium`  | Create Medium draft from markdown          |

## 📁 Content Structure

```text
src/content/
├── en/
├── es/
└── pt/
```

## 🛠️ Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- gray-matter

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
