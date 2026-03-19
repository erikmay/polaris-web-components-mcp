import {
	COMPONENTS,
	getComponentMdUrl,
	getComponentUrl,
} from "./components.ts";
import { PATTERNS, getPatternMdUrl, getPatternUrl } from "./patterns.ts";
import { parseFrontmatterDescription, camelToKebab } from "./parser.ts";
import type { ComponentDoc, ComponentProp, PatternDoc } from "./types.ts";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dir, "data");
const OUTPUT_FILE = join(DATA_DIR, "components.json");
const ICONS_FILE = join(DATA_DIR, "icons.json");
const PATTERNS_FILE = join(DATA_DIR, "patterns.json");
const GUIDE_FILE = join(DATA_DIR, "guide.md");

const GUIDE_URL =
	"https://shopify.dev/docs/api/app-home/using-polaris-components.md";

/**
 * Extracts icon names from a markdown icon type union and replaces it
 * with a short reference. Returns the modified markdown and any extracted icons.
 */
function extractIcons(markdown: string): {
	markdown: string;
	icons: string[];
} {
	// Match the icon property's type line: **"" | "icon1" | "icon2" | ...**
	const iconTypePattern =
		/(\* \*\*icon\*\*\s*\n\s*)\*\*(""\s*\|[\s\S]*?)\*\*(\s*\n)/;
	const match = markdown.match(iconTypePattern);
	if (!match) return { markdown, icons: [] };

	const typeStr = match[2]!;
	const icons = typeStr
		.split("|")
		.map((s) => s.trim().replace(/^"|"$/g, ""))
		.filter((s) => s !== "");

	const replacement = `${match[1]}**IconName**\n\n  One of ${icons.length} Polaris icon names. Use the \`search_icons\` tool to find available icons.${match[3]}`;

	return {
		markdown: markdown.replace(iconTypePattern, replacement),
		icons,
	};
}

/**
 * Extracts property names, types, and defaults from the markdown.
 * Pattern: `* **propName**` followed by `**type**` and optionally `**Default: value**`
 */
function extractProps(markdown: string): ComponentProp[] {
	const props: ComponentProp[] = [];
	const lines = markdown.split("\n");

	// Find the properties section — either "## Properties" or "## ComponentName"
	let inProps = false;
	let i = 0;

	for (; i < lines.length; i++) {
		const line = lines[i]!;
		if (line.startsWith("## Properties") || (line.startsWith("## ") && i > 0 && lines[i - 1]?.trim() === "")) {
			// Check if this is the first ## after the # heading (i.e., the properties section)
			if (line.startsWith("## Properties")) {
				inProps = true;
				i++;
				break;
			}
			// For "## ComponentName" style, check if the next property-like line follows soon
			const lookahead = lines.slice(i + 1, i + 6).join("\n");
			if (lookahead.includes("* **")) {
				inProps = true;
				i++;
				break;
			}
		}
	}

	if (!inProps) return props;

	for (; i < lines.length; i++) {
		const line = lines[i]!;

		// Stop at next ## section (but not ### subsections)
		if (line.startsWith("## ") && !line.startsWith("### ")) break;

		// Match property name: `* **propName**`
		const propMatch = line.match(/^\* \*\*(\w+)\*\*$/);
		if (!propMatch) continue;

		const name = propMatch[1]!;
		let type = "";
		let defaultVal: string | undefined;

		// Look ahead for type and default (skip blank lines)
		for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
			const nextLine = lines[j]!.trim();

			// Stop at next property
			if (nextLine.startsWith("* **")) break;

			// Skip blank lines
			if (nextLine === "") continue;

			// Type line: **someType**
			const typeMatch = nextLine.match(/^\*\*(.+)\*\*$/);
			if (typeMatch) {
				const val = typeMatch[1]!;
				if (val.startsWith("Default:")) {
					defaultVal = val.replace("Default:", "").trim().replace(/^'|'$/g, "");
				} else if (!type) {
					// Truncate very long type unions
					type = val.length > 100 ? val.slice(0, 97) + "..." : val;
				}
			} else {
				// Hit a description line — stop looking
				break;
			}
		}

		props.push({ name, type, ...(defaultVal !== undefined && { default: defaultVal }) });
	}

	return props;
}

async function fetchComponentMarkdown(slug: string): Promise<string> {
	const url = getComponentMdUrl(slug);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}
	return response.text();
}

async function fetchGuide(): Promise<void> {
	process.stdout.write("Fetching usage guide...");
	const response = await fetch(GUIDE_URL);
	if (!response.ok) {
		console.log(` FAILED (${response.status})`);
		return;
	}
	const markdown = await response.text();
	await Bun.write(GUIDE_FILE, markdown);
	console.log(` OK (${markdown.length} chars)`);
}

async function scrapeAll(): Promise<void> {
	if (!existsSync(DATA_DIR)) {
		mkdirSync(DATA_DIR, { recursive: true });
	}

	await fetchGuide();

	const results: ComponentDoc[] = [];
	const errors: string[] = [];
	const allIcons = new Set<string>();

	console.log(`\nScraping ${COMPONENTS.length} components...\n`);

	for (const component of COMPONENTS) {
		try {
			process.stdout.write(`  ${component.name}...`);
			const rawMarkdown = await fetchComponentMarkdown(component.slug);
			const description = parseFrontmatterDescription(rawMarkdown);
			const { markdown, icons } = extractIcons(rawMarkdown);

			for (const icon of icons) allIcons.add(icon);

			const props = extractProps(markdown);

			results.push({
				name: component.name,
				tagName: `s-${camelToKebab(component.name)}`,
				url: getComponentUrl(component.slug),
				category: component.category,
				description,
				markdown,
				props,
			});

			const saved = rawMarkdown.length - markdown.length;
			const iconNote = saved > 0 ? ` (${saved} chars saved)` : "";
			console.log(` OK (${markdown.length} chars, ${props.length} props)${iconNote}`);

			// Be polite with requests
			await Bun.sleep(200);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			errors.push(`${component.name}: ${msg}`);
			console.log(` FAILED - ${msg}`);
		}
	}

	const iconList = [...allIcons].sort();
	await Bun.write(ICONS_FILE, JSON.stringify(iconList, null, "\t"));
	console.log(`\nSaved ${iconList.length} icons to ${ICONS_FILE}`);

	await Bun.write(OUTPUT_FILE, JSON.stringify(results, null, "\t"));
	console.log(`Saved ${results.length} components to ${OUTPUT_FILE}`);

	// Scrape patterns
	const patternResults: PatternDoc[] = [];
	console.log(`\nScraping ${PATTERNS.length} patterns...\n`);

	for (const pattern of PATTERNS) {
		try {
			process.stdout.write(`  ${pattern.name}...`);
			const url = getPatternMdUrl(pattern.slug);
			const response = await fetch(url);
			if (!response.ok) throw new Error(`${response.status}`);
			const markdown = await response.text();
			const description = parseFrontmatterDescription(markdown);

			patternResults.push({
				name: pattern.name,
				slug: pattern.slug,
				url: getPatternUrl(pattern.slug),
				category: pattern.category,
				description,
				markdown,
			});

			console.log(` OK (${markdown.length} chars)`);
			await Bun.sleep(200);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			errors.push(`Pattern ${pattern.name}: ${msg}`);
			console.log(` FAILED - ${msg}`);
		}
	}

	await Bun.write(PATTERNS_FILE, JSON.stringify(patternResults, null, "\t"));
	console.log(`\nSaved ${patternResults.length} patterns to ${PATTERNS_FILE}`);

	if (errors.length > 0) {
		console.error(`\n${errors.length} errors:`);
		for (const err of errors) {
			console.error(`  - ${err}`);
		}
	}
}

scrapeAll();
