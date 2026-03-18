import { COMPONENTS, getComponentMdUrl, getComponentUrl } from "./components.ts";
import { parseComponentMarkdown } from "./parser.ts";
import type { ComponentDoc } from "./types.ts";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const DATA_DIR = join(import.meta.dir, "data");
const OUTPUT_FILE = join(DATA_DIR, "components.json");

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

	console.log(`Scraping ${COMPONENTS.length} components...\n`);

	for (const component of COMPONENTS) {
		try {
			process.stdout.write(`  ${component.name}...`);
			const markdown = await fetchComponentMarkdown(component.slug);
			const doc = parseComponentMarkdown(markdown, {
				name: component.name,
				url: getComponentUrl(component.slug),
				category: component.category,
			});
			results.push(doc);
			console.log(
				` ${doc.properties.length} props, ${doc.events.length} events, ${doc.examples.length} examples`,
			);

			// Be polite with requests
			await Bun.sleep(200);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			errors.push(`${component.name}: ${msg}`);
			console.log(` FAILED - ${msg}`);
		}
	}

	await Bun.write(OUTPUT_FILE, JSON.stringify(results, null, "\t"));
	console.log(`\nSaved ${results.length} components to ${OUTPUT_FILE}`);

	if (errors.length > 0) {
		console.error(`\n${errors.length} errors:`);
		for (const err of errors) {
			console.error(`  - ${err}`);
		}
	}
}

scrapeAll();
