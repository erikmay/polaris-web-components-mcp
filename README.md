# Polaris Web Components MCP

An [MCP](https://modelcontextprotocol.io) server that provides [Shopify Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components) documentation to AI assistants.

Instead of relying on training data, your AI assistant can look up accurate, up-to-date component docs on demand.

## Tools

| Tool | Description |
|------|-------------|
| `list_components` | List all 47 Polaris Web Components, optionally filtered by category |
| `get_component` | Get the full Shopify documentation for a component (properties, events, slots, examples) |
| `search_components` | Search components by keyword across all documentation |
| `search_icons` | Search the 560+ available Polaris icon names |

## What you can ask your AI assistant

After setup, your AI assistant can answer questions like:

- "Build a form with email, password, and a submit button using Polaris Web Components"
- "What properties does the TextField component have?"
- "Show me how to use the Modal component"
- "Which components are available for forms?"
- "Find me an icon for a shopping cart"

## Requirements

- **Node.js 18 or higher** installed on your system
- An **AI development tool** that supports MCP

## Setup

### Claude Code

Add the MCP server using the Claude CLI:

```terminal
claude mcp add --transport stdio polaris -- npx -y github:erikmay/polaris-web-components-mcp
```

Restart Claude Code to load the new server.

### Cursor

Go to **Cursor** > **Settings** > **Cursor Settings** > **Tools and integrations** > **New MCP server** and add:

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

If you see connection errors on Windows, try this alternative:

```json
{
  "mcpServers": {
    "polaris": {
      "command": "cmd",
      "args": ["/k", "npx", "-y", "github:erikmay/polaris-web-components-mcp"]
    }
  }
}
```

Save and restart Cursor.

### Claude Desktop

Open settings, navigate to your MCP configuration, and add:

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

Save and restart Claude Desktop.

### VS Code

Open the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux), search for **MCP: Open User Configuration**, and add:

```json
{
  "servers": {
    "polaris": {
      "command": "npx",
      "args": ["-y", "github:erikmay/polaris-web-components-mcp"]
    }
  }
}
```

Save and restart VS Code.

### Codex CLI

Add to your `~/.codex/config.toml`:

```toml
[mcp_servers.polaris]
command = "npx"
args = ["-y", "github:erikmay/polaris-web-components-mcp"]
```

Restart Codex to load the server.

### Gemini CLI

```terminal
gemini extensions install github:erikmay/polaris-web-components-mcp
```

Or manually add to your `settings.json`:

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

### Windsurf

Go to **Windsurf** > **Settings** > **Cascade** > **MCP** > **Add Server** > **Add custom server** and add:

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

Save and restart Windsurf.

## Updating component data

The repo ships with pre-scraped documentation. To refresh from shopify.dev:

```bash
git clone https://github.com/erikmay/polaris-web-components-mcp.git
cd polaris-web-components-mcp
bun install
bun run scrape
bun run build
```

This requires [Bun](https://bun.sh).

## How it works

1. The **scraper** fetches raw markdown docs from `shopify.dev/docs/api/app-home/polaris-web-components/{category}/{component}.md`
2. Icon type unions (~9KB each) are extracted into a separate searchable index
3. The **MCP server** serves the raw Shopify markdown directly -- no lossy parsing, no broken data
4. AI assistants call the tools to look up exactly what they need

## License

MIT
