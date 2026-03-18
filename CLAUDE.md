# Polaris Web Components MCP

MCP server providing Shopify Polaris Web Component documentation to AI assistants.

## Project Structure

- `src/index.ts` — MCP server entry point (stdio transport)
- `src/parser.ts` — Markdown parser for Shopify docs
- `src/scraper.ts` — Fetches `.md` docs from shopify.dev
- `src/components.ts` — Static component list with slugs/categories
- `src/types.ts` — TypeScript type definitions
- `src/data/components.json` — Scraped component data (generated)

## Commands

- `bun run start` — Run the MCP server
- `bun run scrape` — Re-scrape all component docs from shopify.dev

## Data Source

Component docs are fetched as markdown from:
`https://shopify.dev/docs/api/app-home/polaris-web-components/{category}/{component}.md`

## Runtime

Uses Bun. See `node_modules/bun-types/docs/**.mdx` for Bun API docs.
