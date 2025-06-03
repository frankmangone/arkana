# Arkana Frontend

A multilingual Next.js blog with automated Supabase search data synchronization.

## 🌍 Multilingual Support

This blog supports content in **three languages**:

- **English** (`en`) - Full content library
- **Spanish** (`es`) - Extensive translations
- **Portuguese** (`pt`) - Growing content collection

All content is stored in `/src/content/{language}/` directories and automatically processed with language-specific optimizations.

## 🚀 Getting Started

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### Environment Setup

Create a `.env.local` file with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Content Management & Search

### Available Scripts

| Script                 | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start development server                     |
| `npm run build`        | Build for production                         |
| `npm run build:search` | Extract search data from markdown            |
| `npm run sync`         | Sync single markdown file to Supabase        |
| `npm run sync:all`     | **Bulk sync all markdown files to Supabase** |

### 🔄 Supabase Sync Pipeline

#### Single File Sync

```bash
# Sync a specific article
npm run sync -- ./src/content/en/blockchain-101/consensus.md
npm run sync -- ./src/content/es/cryptography-101/hashing.md
npm run sync -- ./src/content/pt/cryptography-101/where-to-start.md
```

#### Bulk Sync (NEW!)

```bash
# Sync all content files across all languages
npm run sync:all

# Preview files without syncing
npm run sync:all -- --dry-run

# Sync with custom delay between files
npm run sync:all -- --delay 2000

# Sync specific language only
npm run sync:all -- --content-dir src/content/es

# Stop on first error (default: continue)
npm run sync:all -- --no-continue
```

#### What the Sync Does

✅ **Language Detection** - Automatically detects EN/ES/PT from file path  
✅ **Search Optimization** - Extracts keywords with language-specific stop words  
✅ **Smart Summaries** - Generates intelligent content summaries  
✅ **Tag Expansion** - Adds related terms in appropriate language  
✅ **UUID Injection** - Writes Supabase ID back to markdown frontmatter  
✅ **Change Detection** - Only updates when content actually changes  
✅ **Progress Tracking** - Detailed progress for bulk operations

#### Example Sync Output

```
🚀 Starting sync pipeline for: src/content/es/blockchain-101/consensus.md
🌍 Detected language: es
🔗 Generated slug: blockchain-101/consensus
📊 Extracting search data...
   📊 Extracted 50 keywords
   📝 Summary: 1,234 characters
   🏷️ Headings: 6 found
   💬 Word count: 2,500 words
🔍 Checking if article exists in Supabase...
✅ Created new article: Blockchain 101: Consenso (UUID: abc-123-def)
📝 Updated markdown with Supabase ID
```

### 🔍 Search Features

The sync pipeline creates optimized search data for enhanced multilingual search:

#### Multiple Search Strategies

| Strategy     | Description                              | Use Case                       |
| ------------ | ---------------------------------------- | ------------------------------ |
| `hybrid`     | Multi-tier search with relevance scoring | Best overall results (default) |
| `full_text`  | Comprehensive field search               | Broad content discovery        |
| `similarity` | Fuzzy matching                           | Typo-tolerant search           |
| `exact`      | Case-sensitive exact matching            | Precise term matching          |

#### Search Implementation

```typescript
// Enhanced search with multiple strategies
const results = await articlesService.searchArticles("blockchain", {
  language: "es",
  limit: 10,
  searchType: "hybrid", // or 'full_text', 'similarity', 'exact'
});

// Advanced search with filters
const advancedResults = await articlesService.advancedSearch({
  searchTerm: "criptografía",
  language: "es",
  tags: ["blockchain", "bitcoin"],
  minWordCount: 1000,
  sortBy: "relevance",
  limit: 20,
});

// Get related articles
const related = await articlesService.getRelatedArticles(
  "blockchain-101/consensus",
  "en",
  5
);
```

#### Search Field Optimization

- **Multilingual Keywords**: Language-specific stop word filtering (125+ EN, 80+ ES, 90+ PT)
- **Smart Summaries**: Intro + conclusion + key paragraphs
- **Heading Structure**: Searchable heading hierarchy with proper nesting
- **Tag Expansion**: Original tags + related terms in appropriate language
- **Content Metadata**: Word count, reading time, language detection
- **Relevance Scoring**: Priority-based ranking across multiple search tiers

#### Hybrid Search Strategy

The default `hybrid` search uses a **multi-tier approach** with relevance scoring:

1. **Title Matches** (Relevance: 3) - Exact title matching
2. **Keywords Search** (Relevance: 2) - Search in extracted keywords
3. **Content Search** (Relevance: 1) - Search in summaries and headings

Results are automatically deduplicated and ranked by relevance score.

### 📁 Content Structure

```
src/content/
├── en/                     # English content
│   ├── blockchain-101/
│   ├── cryptography-101/
│   └── ...
├── es/                     # Spanish content
│   ├── blockchain-101/
│   ├── cryptography-101/
│   └── ...
└── pt/                     # Portuguese content
    └── cryptography-101/
```

### 🗄️ Database Schema

Articles are stored in Supabase with these optimized fields:

| Field                  | Description                  |
| ---------------------- | ---------------------------- |
| `search_keywords`      | Language-filtered keywords   |
| `search_summary`       | Smart content summary        |
| `search_headings`      | Searchable heading text      |
| `search_tags_expanded` | Original + related tags      |
| `headings_structure`   | JSON heading hierarchy       |
| `word_count`           | Actual word count            |
| `language`             | Detected language (en/es/pt) |

## 🛠️ Development

This project uses:

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for database and search
- **gray-matter** for frontmatter parsing
- **Multilingual content** with automatic language detection

## 📚 Documentation

- [Sync Pipeline Documentation](./scripts/SYNC-PIPELINE.md) - Complete sync system guide
- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
- [Supabase Documentation](https://supabase.com/docs) - Database documentation

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Make sure to add your environment variables in Vercel's dashboard.

---

**Note**: The sync pipeline requires Supabase environment variables and will create/update articles in your database. Use `--dry-run` to preview changes before syncing.
