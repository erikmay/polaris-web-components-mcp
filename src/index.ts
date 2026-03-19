#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import componentsData from "./data/components.json";
import iconsData from "./data/icons.json";
import guide from "./data/guide.md" with { type: "text" };
import type { ComponentDoc } from "./types.ts";
import { searchIcons, findClosest } from "./fuzzy.ts";

const components: ComponentDoc[] = componentsData;
const icons: string[] = iconsData;

console.error(
	`Loaded ${components.length} Polaris components, ${icons.length} icons.`,
);

function findComponent(name: string): ComponentDoc | undefined {
	const lower = name.toLowerCase().replace(/^s-/, "");
	return components.find(
		(c) =>
			c.name.toLowerCase() === lower ||
			c.tagName.toLowerCase() === `s-${lower}` ||
			c.tagName.toLowerCase() === name.toLowerCase(),
	);
}

function componentNotFoundMessage(name: string): string {
	const allNames = components.flatMap((c) => [c.tagName, c.name]);
	const suggestions = findClosest(name, allNames);
	const suggestionText = suggestions.length
		? `\n\nDid you mean: ${suggestions.join(", ")}?`
		: "";
	return `Component "${name}" not found. Use list_components to see available components.${suggestionText}`;
}

const server = new McpServer({
	name: "polaris-web-components",
	version: "1.0.0",
	instructions: guide,
});

// Tool: List all components
server.registerTool(
	"list_components",
	{
		title: "List Components",
		description:
			"List all available Shopify Polaris Web Components with their properties. Start here to decide which components you need, then use get_component for full documentation on specific ones.",
		inputSchema: {
			category: z
				.string()
				.optional()
				.describe(
					"Filter by category (e.g., 'Actions', 'Forms', 'Layout', 'Media', 'Overlays', 'Typography', 'Structure', 'Feedback and Status')",
				),
			detail: z
				.enum(["summary", "props"])
				.optional()
				.default("summary")
				.describe(
					"Level of detail: 'summary' returns names and descriptions, 'props' also includes property names with types and defaults",
				),
		},
	},
	async ({ category, detail }) => {
		let filtered = components;
		if (category) {
			const lower = category.toLowerCase();
			filtered = components.filter((c) =>
				c.category.toLowerCase().includes(lower),
			);
		}

		const list = filtered.map((c) => {
			const base = {
				name: c.name,
				tagName: c.tagName,
				category: c.category,
				description: c.description,
			};
			if (detail === "props") {
				return { ...base, props: c.props };
			}
			return base;
		});

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
			"Get the full Shopify documentation for one or more Polaris Web Components including properties, events, slots, examples, and usage guidelines. Use list_components first to decide which components you need, then request full docs here.",
		inputSchema: {
			names: z
				.array(z.string())
				.describe(
					"One or more component names (e.g., ['Button', 'TextField']) or tag names (e.g., ['s-button', 's-text-field'])",
				),
		},
	},
	async ({ names }) => {
		const results: { type: "text"; text: string }[] = [];
		const errors: string[] = [];

		for (const name of names) {
			const component = findComponent(name);
			if (!component) {
				errors.push(componentNotFoundMessage(name));
			} else {
				results.push({
					type: "text" as const,
					text: component.markdown,
				});
			}
		}

		if (errors.length > 0) {
			results.push({
				type: "text" as const,
				text: errors.join("\n\n"),
			});
		}

		return {
			content: results.length
				? results
				: [{ type: "text" as const, text: "No component names provided." }],
			...(errors.length > 0 && results.length === errors.length
				? { isError: true }
				: {}),
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

// Tool: Search icons by keyword (fuzzy)
server.registerTool(
	"search_icons",
	{
		title: "Search Icons",
		description:
			"Search available Polaris icon names by keyword with fuzzy matching and synonym support. Understands common aliases (e.g., 'warning' finds alert icons, 'shop' finds store icons). Returns matching icon names for use in the `icon` property of components like Button, Badge, Select, and TextField.",
		inputSchema: {
			query: z
				.string()
				.optional()
				.describe(
					"Search keywords to filter icons (e.g., 'cart', 'warning', 'shop login'). Supports multiple words and common synonyms. Omit to list all icons.",
				),
		},
	},
	async ({ query }) => {
		if (!query) {
			return {
				content: [
					{
						type: "text" as const,
						text: `${icons.length} icons available:\n${icons.join(", ")}`,
					},
				],
			};
		}

		const { exact, fuzzy } = searchIcons(icons, query);
		const parts: string[] = [];

		if (exact.length > 0) {
			parts.push(`${exact.length} icons found:\n${exact.join(", ")}`);
		}

		if (fuzzy.length > 0) {
			parts.push(
				`${fuzzy.length} similar icons (fuzzy match):\n${fuzzy.join(", ")}`,
			);
		}

		if (parts.length === 0) {
			parts.push(
				`No icons found matching "${query}". Try broader terms or use without a query to see all ${icons.length} icons.`,
			);
		}

		return {
			content: [
				{
					type: "text" as const,
					text: parts.join("\n\n"),
				},
			],
		};
	},
);

// Tool: Validate markup against known components and properties
server.registerTool(
	"validate_markup",
	{
		title: "Validate Markup",
		description:
			"Validate HTML markup against known Polaris Web Components. Checks for unknown components, unknown attributes, and suggests fixes.",
		inputSchema: {
			html: z.string().describe("HTML markup containing Polaris Web Components (s-* tags) to validate"),
		},
	},
	async ({ html }) => {
		const tagPattern = /<(s-[\w-]+)([^>]*)>/g;
		const issues: string[] = [];
		const checked = new Set<string>();

		let match;
		while ((match = tagPattern.exec(html)) !== null) {
			const tagName = match[1]!;
			const attrsStr = match[2]!;

			// Find the component
			const component = components.find(
				(c) => c.tagName === tagName,
			);

			if (!component) {
				if (!checked.has(tagName)) {
					const allTags = components.map((c) => c.tagName);
					const suggestions = findClosest(tagName, allTags);
					issues.push(
						`Unknown component <${tagName}>. Did you mean: ${suggestions.join(", ")}?`,
					);
					checked.add(tagName);
				}
				continue;
			}

			// Extract attributes from the tag
			const attrPattern = /\s([\w-]+)(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?/g;
			const knownProps = new Set(
				component.props.map((p) => p.name.toLowerCase()),
			);
			// Common HTML attributes that are always valid
			const htmlAttrs = new Set([
				"id", "class", "style", "slot", "hidden", "tabindex",
				"aria-label", "aria-hidden", "aria-describedby", "aria-expanded",
				"aria-controls", "aria-live", "aria-busy", "role",
				"data-", "part",
			]);

			let attrMatch;
			while ((attrMatch = attrPattern.exec(attrsStr)) !== null) {
				const attr = attrMatch[1]!;
				const attrLower = attr.toLowerCase();

				// Skip common HTML/aria/data attributes
				if (
					htmlAttrs.has(attrLower) ||
					attrLower.startsWith("aria-") ||
					attrLower.startsWith("data-")
				) {
					continue;
				}

				if (!knownProps.has(attrLower)) {
					const propNames = component.props.map((p) => p.name);
					const suggestions = findClosest(attr, propNames, 2);
					issues.push(
						`<${tagName}>: Unknown attribute "${attr}". Did you mean: ${suggestions.join(", ")}?`,
					);
				}
			}
		}

		if (issues.length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: "Markup is valid. All components and attributes are recognized.",
					},
				],
			};
		}

		return {
			content: [
				{
					type: "text" as const,
					text: `Found ${issues.length} issue${issues.length > 1 ? "s" : ""}:\n\n${issues.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}`,
				},
			],
		};
	},
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Polaris Web Components MCP server running on stdio.");
