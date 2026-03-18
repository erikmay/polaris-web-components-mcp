# Polaris Web Components MCP

An [MCP](https://modelcontextprotocol.io) server that provides [Shopify Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components) documentation to AI assistants like Claude.

Instead of relying on training data, your AI assistant can look up accurate, up-to-date component docs on demand.

## Tools

| Tool | Description |
|------|-------------|
| `list_components` | List all 47 Polaris Web Components, optionally filtered by category |
| `get_component` | Get the full Shopify documentation for a component (properties, events, slots, examples) |
| `search_components` | Search components by keyword across all documentation |
| `search_icons` | Search the 560+ available Polaris icon names |

## Setup

Add to your `.mcp.json` (Claude Code, Cursor, etc.):

```json
{
  "mcpServers": {
    "polaris": {
      "command": "npx",
      "args": ["-y", "github:erikmay/polaris-web-components-mcp"]
    }
  }
}
```

That's it. No cloning, no install -- `npx` downloads and runs the server automatically.

## Updating component data

The repo ships with pre-scraped documentation. To refresh it from shopify.dev:

```bash
bun run scrape
```

This fetches the latest markdown docs for all components and extracts icon names.

## Project structure

```
src/
  index.ts          MCP server (stdio transport)
  scraper.ts        Fetches .md docs from shopify.dev
  parser.ts         Extracts frontmatter description
  components.ts     Component list with slugs/categories
  types.ts          TypeScript type definitions
  data/
    components.json   Scraped component docs (generated)
    icons.json        Polaris icon names (generated)
```

## How it works

1. The **scraper** fetches raw markdown documentation from `shopify.dev/docs/api/app-home/polaris-web-components/{category}/{component}.md`
2. Icon type unions (~9KB each) are extracted into a separate searchable index
3. The **MCP server** serves the raw Shopify markdown directly -- no lossy parsing, no broken data
4. AI assistants call the tools to look up exactly what they need

## License

MIT
