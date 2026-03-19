#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import componentsData from "./data/components.json";
import iconsData from "./data/icons.json";
import patternsData from "./data/patterns.json";
import guide from "./data/guide.md" with { type: "text" };
import type { ComponentDoc, PatternDoc } from "./types.ts";
import { searchIcons, findClosest } from "./fuzzy.ts";

const components: ComponentDoc[] = componentsData;
const icons: string[] = iconsData;
const patterns: PatternDoc[] = patternsData;

console.error(
	`Loaded ${components.length} components, ${patterns.length} patterns, ${icons.length} icons.`,
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

// Common HTML attributes that are always valid on any element
const GLOBAL_HTML_ATTRS = new Set([
	"id", "class", "classname", "style", "slot", "hidden", "tabindex",
	"aria-label", "aria-hidden", "aria-describedby", "aria-expanded",
	"aria-controls", "aria-live", "aria-busy", "role",
	"data-", "part", "key", "ref", "dangerouslysetinnerhtml",
]);

/**
 * Replace JSX expressions {...} with a safe placeholder so that
 * characters like > inside arrow functions don't break tag parsing.
 */
function stripJsxExpressions(source: string): string {
	let result = "";
	let depth = 0;
	let inString: string | null = null;

	for (let i = 0; i < source.length; i++) {
		const ch = source[i]!;
		const prev = source[i - 1];

		// Track string literals inside expressions
		if (depth > 0 && !inString && (ch === '"' || ch === "'" || ch === "`")) {
			inString = ch;
		} else if (inString && ch === inString && prev !== "\\") {
			inString = null;
		}

		if (!inString && ch === "{") {
			if (depth === 0) result += '"__jsx__"';
			depth++;
		} else if (!inString && ch === "}") {
			depth--;
		} else if (depth === 0) {
			result += ch;
		}
	}

	return result;
}

function validateSource(
	source: string,
	fileName?: string,
): string[] {
	// Strip JSX expressions to avoid > in arrows breaking tag parsing
	const cleaned = stripJsxExpressions(source);
	// Match both regular and self-closing tags: <s-button ...> and <s-button ... />
	const tagPattern = /<(s-[\w-]+)(\s[^>]*?)?\s*\/?>/g;
	const issues: string[] = [];
	const checked = new Set<string>();
	const prefix = fileName ? `${fileName}: ` : "";

	let match;
	while ((match = tagPattern.exec(cleaned)) !== null) {
		const tagName = match[1]!;
		const attrsStr = match[2] ?? "";

		const component = components.find(
			(c) => c.tagName === tagName,
		);

		if (!component) {
			if (!checked.has(tagName)) {
				const allTags = components.map((c) => c.tagName);
				const suggestions = findClosest(tagName, allTags);
				issues.push(
					`${prefix}Unknown component <${tagName}>. Did you mean: ${suggestions.join(", ")}?`,
				);
				checked.add(tagName);
			}
			continue;
		}

		// Extract attributes — handles HTML ("val"), JSX ({val}), and bare attributes
		const attrPattern = /\s([\w-]+)(?:=(?:"[^"]*"|'[^']*'|\{[^}]*\}|[^\s>]*))?/g;
		const knownProps = new Set(
			component.props.map((p) => p.name.toLowerCase()),
		);

		let attrMatch;
		while ((attrMatch = attrPattern.exec(attrsStr)) !== null) {
			const attr = attrMatch[1]!;
			const attrLower = attr.toLowerCase();

			// Skip global HTML/aria/data attributes and event handlers
			if (
				GLOBAL_HTML_ATTRS.has(attrLower) ||
				attrLower.startsWith("aria-") ||
				attrLower.startsWith("data-") ||
				attrLower.startsWith("on")
			) {
				continue;
			}

			if (!knownProps.has(attrLower)) {
				const propNames = component.props.map((p) => p.name);
				const suggestions = findClosest(attr, propNames, 2);
				issues.push(
					`${prefix}<${tagName}>: Unknown attribute "${attr}". Did you mean: ${suggestions.join(", ")}?`,
				);
			}
		}
	}

	return issues;
}

// Tool: Validate markup against known components and properties
server.registerTool(
	"validate_markup",
	{
		title: "Validate Markup",
		description:
			"Validate HTML/JSX markup against known Polaris Web Components. Checks for unknown components, unknown attributes, and suggests fixes. Accepts inline markup, a file path, or a glob pattern to validate multiple files at once.",
		inputSchema: {
			html: z
				.string()
				.optional()
				.describe("Inline HTML/JSX markup to validate"),
			file: z
				.string()
				.optional()
				.describe("Absolute file path to validate (e.g., '/path/to/app/routes/login.tsx')"),
			glob: z
				.string()
				.optional()
				.describe("Glob pattern to validate multiple files (e.g., 'src/**/*.tsx'). Paths are relative to the working directory."),
		},
	},
	async ({ html, file, glob: globPattern }) => {
		if (!html && !file && !globPattern) {
			return {
				content: [
					{
						type: "text" as const,
						text: "Provide at least one of: html, file, or glob.",
					},
				],
				isError: true,
			};
		}

		const allIssues: string[] = [];
		let filesChecked = 0;

		// Inline HTML
		if (html) {
			allIssues.push(...validateSource(html));
			filesChecked++;
		}

		// Single file
		if (file) {
			try {
				const content = await Bun.file(file).text();
				allIssues.push(...validateSource(content, file));
				filesChecked++;
			} catch {
				allIssues.push(`Could not read file: ${file}`);
			}
		}

		// Glob pattern
		if (globPattern) {
			const g = new Bun.Glob(globPattern);
			for await (const path of g.scan({ dot: false })) {
				try {
					const content = await Bun.file(path).text();
					const fileIssues = validateSource(content, path);
					allIssues.push(...fileIssues);
					filesChecked++;
				} catch {
					allIssues.push(`Could not read file: ${path}`);
				}
			}
		}

		if (allIssues.length === 0) {
			return {
				content: [
					{
						type: "text" as const,
						text: `Validated ${filesChecked} source${filesChecked > 1 ? "s" : ""}. All components and attributes are recognized.`,
					},
				],
			};
		}

		return {
			content: [
				{
					type: "text" as const,
					text: `Validated ${filesChecked} source${filesChecked > 1 ? "s" : ""}. Found ${allIssues.length} issue${allIssues.length > 1 ? "s" : ""}:\n\n${allIssues.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}`,
				},
			],
		};
	},
);

// Tool: List all patterns
server.registerTool(
	"list_patterns",
	{
		title: "List Patterns",
		description:
			"List all available Shopify Polaris UI patterns (compositions and page templates). Patterns show how to combine components into common UI layouts like empty states, index tables, settings pages, and more.",
		inputSchema: {
			category: z
				.enum(["Compositions", "Templates"])
				.optional()
				.describe(
					"Filter by category: 'Compositions' for reusable UI blocks (cards, lists, empty states), 'Templates' for full page layouts (details, homepage, index, settings)",
				),
		},
	},
	async ({ category }) => {
		let filtered = patterns;
		if (category) {
			filtered = patterns.filter((p) => p.category === category);
		}

		const list = filtered.map((p) => ({
			name: p.name,
			category: p.category,
			description: p.description,
			url: p.url,
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

// Tool: Get pattern details
server.registerTool(
	"get_pattern",
	{
		title: "Get Pattern",
		description:
			"Get the full documentation for one or more Shopify Polaris UI patterns including code examples and best practices. Use list_patterns first to see available patterns.",
		inputSchema: {
			names: z
				.array(z.string())
				.describe(
					"One or more pattern names (e.g., ['Empty State', 'Index Table', 'Settings'])",
				),
		},
	},
	async ({ names }) => {
		const results: { type: "text"; text: string }[] = [];
		const errors: string[] = [];

		for (const name of names) {
			const lower = name.toLowerCase();
			const pattern = patterns.find(
				(p) =>
					p.name.toLowerCase() === lower ||
					p.slug.endsWith(lower.replace(/\s+/g, "-")),
			);

			if (!pattern) {
				const allNames = patterns.map((p) => p.name);
				const suggestions = findClosest(name, allNames);
				errors.push(
					`Pattern "${name}" not found. Did you mean: ${suggestions.join(", ")}?`,
				);
			} else {
				results.push({
					type: "text" as const,
					text: pattern.markdown,
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
				: [{ type: "text" as const, text: "No pattern names provided." }],
			...(errors.length > 0 && results.length === errors.length
				? { isError: true }
				: {}),
		};
	},
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Polaris Web Components MCP server running on stdio.");
