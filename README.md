# Askian AI (Beta) — U of R

Retrieval-only, citation-first chatbot for uregina.ca. No PII logs, 14-day retention, file-based kill switch.

## Quick Start
1) `pnpm install`
2) Seed `data/allowlist.txt`, `data/flags.json`, `data/logs.jsonl`
3A) Instant demo: put sample `data/passages.json` (see below), or  
3B) Real index: `pnpm index:crawl && pnpm index:chunk && pnpm index:embed`
4) `pnpm dev:web` and `pnpm build:widget`
5) Embed:
```html
<script src="http://localhost:3000/widget.js"
        crossorigin="anonymous"
        data-askian-src="http://localhost:3000/widget.html"></script>

---

# 🌐 API app (Next.js 14)

## `apps/web/package.json`
```json
{
  "name": "@askian/web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "@xenova/transformers": "^2.17.2",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "sanitize-html": "^2.13.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "typescript": "^5.5.4"
  }
}