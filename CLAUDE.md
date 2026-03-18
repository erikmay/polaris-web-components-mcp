# Polaris Web Components MCP

MCP server providing Shopify Polaris Web Component documentation to AI assistants.

## Project Structure

- `src/index.ts` — MCP server entry point (stdio transport)
- `src/parser.ts` — Extracts frontmatter description and kebab-case helper
- `src/scraper.ts` — Fetches `.md` docs from shopify.dev, extracts icons
- `src/components.ts` — Static component list with slugs/categories
- `src/types.ts` — TypeScript type definitions
- `src/data/components.json` — Scraped component data with raw markdown (generated)
- `src/data/icons.json` — Polaris icon names (generated)

## Commands

- `bun run start` — Run the MCP server
- `bun run scrape` — Re-scrape all component docs from shopify.dev

## Data Source

Component docs are fetched as raw markdown from:
`https://shopify.dev/docs/api/app-home/polaris-web-components/{category}/{component}.md`

The raw markdown is stored directly — no lossy parsing. Icon type unions are extracted into `icons.json` and replaced with a reference to the `search_icons` tool.

## Runtime

Uses Bun. See `node_modules/bun-types/docs/**.mdx` for Bun API docs.
