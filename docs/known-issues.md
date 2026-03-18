# Known Issues & Improvements

## Bugs

### 1. Some components parse with 0 properties

`OrderedList`, `UnorderedList`, and `Tooltip` return 0 properties. Either they genuinely have none or their markdown uses a heading structure the parser doesn't handle (e.g., a different sub-heading pattern).

**Fix:** Inspect the `.md` files for those components and add handling for any new heading variants.

### 2. Slot descriptions bleed into next section

The Button's `children` slot description includes the stray word "Examples" at the end (`"The content of the Button.\n\nExamples"`). The parser isn't cleanly cutting off before the Examples section when it falls within the Slots section.

**Fix:** Strip trailing content that matches known section headings from slot/property descriptions.

## Data Quality

### 3. Icon type unions are enormous

The `icon` property on many components includes ~400+ string literals, bloating every `get_component` response with thousands of tokens. This wastes context window for the AI consumer.

**Options:**
- Truncate the icon type to a summary like `"One of 400+ Polaris icon names (e.g., 'plus', 'delete', 'search')"`
- Move icon values to a separate tool like `list_icons`
- Add a `compact` flag to `get_component` that omits large enums

## Missing Features

### 4. No automatic data refresh

If Shopify adds or changes components, someone must manually run `bun run scrape`. There's no staleness detection or self-updating mechanism.

**Options:**
- Add a `refresh_components` MCP tool that re-scrapes on demand
- Add a timestamp to `components.json` and warn when data is older than N days
- Set up a scheduled GitHub Action to re-scrape weekly

### 5. Component list is hardcoded

The 47 components in `src/components.ts` are manually maintained. If Shopify adds a new component, it won't be discovered unless someone updates the list.

**Options:**
- Scrape the component index page to auto-discover components
- Fetch the sitemap or navigation data from shopify.dev

### 6. No multi-component composition guidance

Each tool returns one component at a time. There's no way to ask "how do I build a form with validation?" or "what components work together for a settings page?"

**Options:**
- Add a `get_pattern` tool with curated multi-component recipes
- Add a resource/prompt that provides composition guidance
- Include "related components" data in `get_component` responses

### 7. No project setup context

The MCP doesn't tell the AI how to include Polaris in a project — the script tag, CDN URL, or npm package needed to get started.

**Options:**
- Add a `getting_started` tool or resource
- Include setup instructions in the `list_components` output as a preamble
