#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { existsSync } from "fs";
import { join } from "path";
import type { ComponentDoc } from "./types.ts";
import { COMPONENTS, getComponentUrl } from "./components.ts";

const DATA_FILE = join(import.meta.dir, "data/components.json");

let components: ComponentDoc[] = [];

if (existsSync(DATA_FILE)) {
	components = JSON.parse(await Bun.file(DATA_FILE).text());
	console.error(`Loaded ${components.length} Polaris components.`);
} else {
	console.error(
		"Warning: components.json not found. Run `bun run scrape` first.",
	);
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
			filtered = components.filter(
				(c) =>
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

// Tool: Get component details (properties, events, slots)
server.registerTool(
	"get_component",
	{
		title: "Get Component",
		description:
			"Get the full definition of a Polaris Web Component including properties, events, slots, and usage guidelines. Accepts component name (e.g., 'Button') or tag name (e.g., 's-button').",
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

		const result = {
			name: component.name,
			tagName: component.tagName,
			category: component.category,
			description: component.description,
			url: component.url,
			properties: component.properties,
			events: component.events,
			slots: component.slots,
			usefulFor: component.usefulFor,
			bestPractices: component.bestPractices,
			contentGuidelines: component.contentGuidelines,
		};

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(result, null, "\t"),
				},
			],
		};
	},
);

// Tool: Get component examples
server.registerTool(
	"get_component_examples",
	{
		title: "Get Component Examples",
		description:
			"Get code examples for a Polaris Web Component in both JSX and HTML formats.",
		inputSchema: {
			name: z
				.string()
				.describe("Component name or tag name"),
			format: z
				.enum(["html", "jsx", "both"])
				.default("html")
				.describe("Code format to return"),
		},
	},
	async ({ name, format }) => {
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

		const examples = component.examples.map((ex) => {
			const result: Record<string, string> = {
				title: ex.title,
			};
			if (ex.description) result.description = ex.description;
			if (format === "jsx" || format === "both") result.jsx = ex.jsx;
			if (format === "html" || format === "both") result.html = ex.html;
			return result;
		});

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(
						{
							name: component.name,
							tagName: component.tagName,
							examples,
						},
						null,
						"\t",
					),
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
			"Search Polaris Web Components by keyword across names, descriptions, and properties.",
		inputSchema: {
			query: z.string().describe("Search query"),
		},
	},
	async ({ query }) => {
		const lower = query.toLowerCase();
		const matches = components.filter((c) => {
			if (c.name.toLowerCase().includes(lower)) return true;
			if (c.tagName.toLowerCase().includes(lower)) return true;
			if (c.description.toLowerCase().includes(lower)) return true;
			if (c.properties.some((p) => p.name.toLowerCase().includes(lower)))
				return true;
			if (c.usefulFor.some((u) => u.toLowerCase().includes(lower)))
				return true;
			return false;
		});

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

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Polaris Web Components MCP server running on stdio.");
