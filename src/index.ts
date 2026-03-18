#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { existsSync } from "fs";
import { join } from "path";
import type { ComponentDoc } from "./types.ts";

const DATA_FILE = join(import.meta.dir, "data/components.json");
const ICONS_FILE = join(import.meta.dir, "data/icons.json");

let components: ComponentDoc[] = [];
let icons: string[] = [];

if (existsSync(DATA_FILE)) {
	components = JSON.parse(await Bun.file(DATA_FILE).text());
	console.error(`Loaded ${components.length} Polaris components.`);
} else {
	console.error(
		"Warning: components.json not found. Run `bun run scrape` first.",
	);
}

if (existsSync(ICONS_FILE)) {
	icons = JSON.parse(await Bun.file(ICONS_FILE).text());
	console.error(`Loaded ${icons.length} Polaris icons.`);
}

function findComponent(name: string): ComponentDoc | undefined {
	const lower = name.toLowerCase().replace(/^s-/, "");
	return components.find(
		(c) =>
			c.name.toLowerCase() === lower ||
			c.tagName.toLowerCase() === `s-${lower}` ||
			c.tagName.toLowerCase() === name.toLowerCase(),
	);
}

const server = new McpServer({
	name: "polaris-web-components",
	version: "1.0.0",
});

// Tool: List all components
server.registerTool(
	"list_components",
	{
		title: "List Components",
		description:
			"List all available Shopify Polaris Web Components, optionally filtered by category.",
		inputSchema: {
			category: z
				.string()
				.optional()
				.describe(
					"Filter by category (e.g., 'Actions', 'Forms', 'Layout', 'Media', 'Overlays', 'Typography', 'Structure', 'Feedback and Status')",
				),
		},
	},
	async ({ category }) => {
		let filtered = components;
		if (category) {
			const lower = category.toLowerCase();
			filtered = components.filter((c) =>
				c.category.toLowerCase().includes(lower),
			);
		}

		const list = filtered.map((c) => ({
			name: c.name,
			tagName: c.tagName,
			category: c.category,
			description: c.description,
			url: c.url,
		}));

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(list, null, "\t"),
				},
			],
		};
	},
);

// Tool: Get component details (full markdown documentation)
server.registerTool(
	"get_component",
	{
		title: "Get Component",
		description:
			"Get the full Shopify documentation for a Polaris Web Component including properties, events, slots, examples, and usage guidelines. Accepts component name (e.g., 'Button') or tag name (e.g., 's-button').",
		inputSchema: {
			name: z
				.string()
				.describe(
					"Component name (e.g., 'Button', 'TextField') or tag name (e.g., 's-button', 's-text-field')",
				),
		},
	},
	async ({ name }) => {
		const component = findComponent(name);
		if (!component) {
			return {
				content: [
					{
						type: "text" as const,
						text: `Component "${name}" not found. Use list_components to see available components.`,
					},
				],
				isError: true,
			};
		}

		return {
			content: [
				{
					type: "text" as const,
					text: component.markdown,
				},
			],
		};
	},
);

// Tool: Search components by keyword
server.registerTool(
	"search_components",
	{
		title: "Search Components",
		description:
			"Search Polaris Web Components by keyword across names, descriptions, and documentation.",
		inputSchema: {
			query: z.string().describe("Search query"),
		},
	},
	async ({ query }) => {
		const lower = query.toLowerCase();
		const matches = components.filter((c) =>
			c.markdown.toLowerCase().includes(lower),
		);

		const results = matches.map((c) => ({
			name: c.name,
			tagName: c.tagName,
			category: c.category,
			description: c.description,
			url: c.url,
		}));

		return {
			content: [
				{
					type: "text" as const,
					text: results.length
						? JSON.stringify(results, null, "\t")
						: `No components found matching "${query}".`,
				},
			],
		};
	},
);

// Tool: Search icons by keyword
server.registerTool(
	"search_icons",
	{
		title: "Search Icons",
		description:
			"Search available Polaris icon names by keyword. Returns matching icon names that can be used in the `icon` property of components like Button, Badge, Select, and TextField.",
		inputSchema: {
			query: z
				.string()
				.optional()
				.describe(
					"Search keyword to filter icons (e.g., 'cart', 'arrow', 'check'). Omit to list all icons.",
				),
		},
	},
	async ({ query }) => {
		const matches = query
			? icons.filter((icon) => icon.includes(query.toLowerCase()))
			: icons;

		return {
			content: [
				{
					type: "text" as const,
					text: matches.length
						? `${matches.length} icons found:\n${matches.join(", ")}`
						: `No icons found matching "${query}".`,
				},
			],
		};
	},
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Polaris Web Components MCP server running on stdio.");
