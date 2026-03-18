import {
	COMPONENTS,
	getComponentMdUrl,
	getComponentUrl,
} from "./components.ts";
import { parseFrontmatterDescription, camelToKebab } from "./parser.ts";
import type { ComponentDoc } from "./types.ts";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(import.meta.dir, "data");
const OUTPUT_FILE = join(DATA_DIR, "components.json");
const ICONS_FILE = join(DATA_DIR, "icons.json");

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

async function fetchComponentMarkdown(slug: string): Promise<string> {
	const url = getComponentMdUrl(slug);
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status}`);
	}
	return response.text();
}

async function scrapeAll(): Promise<void> {
	if (!existsSync(DATA_DIR)) {
		mkdirSync(DATA_DIR, { recursive: true });
	}

	const results: ComponentDoc[] = [];
	const errors: string[] = [];
	const allIcons = new Set<string>();

	console.log(`Scraping ${COMPONENTS.length} components...\n`);

	for (const component of COMPONENTS) {
		try {
			process.stdout.write(`  ${component.name}...`);
			const rawMarkdown = await fetchComponentMarkdown(component.slug);
			const description = parseFrontmatterDescription(rawMarkdown);
			const { markdown, icons } = extractIcons(rawMarkdown);

			for (const icon of icons) allIcons.add(icon);

			results.push({
				name: component.name,
				tagName: `s-${camelToKebab(component.name)}`,
				url: getComponentUrl(component.slug),
				category: component.category,
				description,
				markdown,
			});

			const saved = rawMarkdown.length - markdown.length;
			const iconNote = saved > 0 ? ` (${saved} chars saved)` : "";
			console.log(` OK (${markdown.length} chars)${iconNote}`);

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

	if (errors.length > 0) {
		console.error(`\n${errors.length} errors:`);
		for (const err of errors) {
			console.error(`  - ${err}`);
		}
	}
}

scrapeAll();
