import type {
	ComponentDoc,
	ComponentProperty,
	ComponentEvent,
	ComponentSlot,
	ComponentExample,
} from "./types.ts";

/**
 * Parses a Polaris component markdown doc into structured data.
 *
 * The markdown from shopify.dev follows a consistent format:
 * - Frontmatter with title/description
 * - ## Properties (bullet list)
 * - ## Events (bullet list)
 * - ## Slots (bullet list)
 * - ### Examples (nested bullet list with code blocks)
 * - ## Useful for / Best practices / Content guidelines
 */
export function parseComponentMarkdown(
	markdown: string,
	meta: { name: string; url: string; category: string },
): ComponentDoc {
	const lines = markdown.split("\n");

	// Parse frontmatter description
	const description = parseFrontmatterDescription(lines);

	// Split into sections by h2 headings
	const sections = splitSections(lines, meta.name);

	const properties = parseProperties(sections["Properties"] ?? "");
	const events = parseEvents(sections["Events"] ?? "");
	const slots = parseSlots(sections["Slots"] ?? "");
	const examples = parseExamples(sections["Examples"] ?? "");
	const bestPractices = parseBulletList(sections["Best practices"] ?? "");
	const contentGuidelines = parseBulletList(
		sections["Content guidelines"] ?? "",
	);
	const usefulFor = parseBulletList(sections["Useful for"] ?? "");

	return {
		name: meta.name,
		tagName: `s-${camelToKebab(meta.name)}`,
		url: meta.url,
		category: meta.category,
		description,
		properties,
		events,
		slots,
		examples,
		bestPractices,
		contentGuidelines,
		usefulFor,
	};
}

function parseFrontmatterDescription(lines: string[]): string {
	let inFrontmatter = false;
	let descLines: string[] = [];
	let collectingDesc = false;

	for (const line of lines) {
		if (line.trim() === "---") {
			if (inFrontmatter) break;
			inFrontmatter = true;
			continue;
		}
		if (!inFrontmatter) continue;

		if (line.startsWith("description:")) {
			const inline = line.replace("description:", "").trim();
			if (inline && inline !== ">-") {
				descLines.push(inline);
			}
			collectingDesc = true;
			continue;
		}

		if (collectingDesc) {
			if (line.match(/^[a-zA-Z_]+:/) || line.trim() === "") {
				break;
			}
			descLines.push(line.trim());
		}
	}

	return descLines.join(" ").replace(/\s+/g, " ").trim();
}

function splitSections(
	lines: string[],
	componentName: string,
): Record<string, string> {
	const sections: Record<string, string> = {};
	let currentSection = "";
	let currentLines: string[] = [];
	let pastFrontmatter = false;
	let frontmatterCount = 0;

	// Some components use ## ComponentName instead of ## Properties
	// Normalize: strip zero-width chars for matching
	const normalizedName = componentName.replace(/[\u200B-\u200D\uFEFF]/g, "");

	for (const line of lines) {
		if (line.trim() === "---") {
			frontmatterCount++;
			if (frontmatterCount >= 2) pastFrontmatter = true;
			continue;
		}
		if (!pastFrontmatter) continue;

		const h2Match = line.match(/^## (.+)/);
		// Also match h3 "Examples" since it appears as ### Examples
		const h3ExamplesMatch = line.match(/^### Examples$/);

		if (h2Match || h3ExamplesMatch) {
			if (currentSection) {
				sections[currentSection] = currentLines.join("\n");
			}
			let sectionName = h2Match ? h2Match[1]!.trim() : "Examples";
			// Strip zero-width chars from section name for comparison
			const cleanName = sectionName.replace(/[\u200B-\u200D\uFEFF]/g, "");
			// Map ## ComponentName to Properties
			if (cleanName === normalizedName) {
				sectionName = "Properties";
			}
			currentSection = sectionName;
			currentLines = [];
		} else {
			currentLines.push(line);
		}
	}

	if (currentSection) {
		sections[currentSection] = currentLines.join("\n");
	}

	return sections;
}

function parseProperties(section: string): ComponentProperty[] {
	return parseDefinitionList(section).map((item) => ({
		name: item.name,
		type: item.type,
		default: item.default,
		description: item.description,
	}));
}

function parseEvents(section: string): ComponentEvent[] {
	return parseDefinitionList(section).map((item) => ({
		name: item.name,
		type: item.type,
		description: item.description,
	}));
}

function parseSlots(section: string): ComponentSlot[] {
	return parseDefinitionList(section).map((item) => ({
		name: item.name,
		type: item.type,
		description: item.description,
	}));
}

type DefinitionItem = {
	name: string;
	type: string;
	default?: string;
	description: string;
};

function parseDefinitionList(section: string): DefinitionItem[] {
	const items: DefinitionItem[] = [];
	const lines = section.split("\n");

	let i = 0;
	while (i < lines.length) {
		const line = lines[i]!;

		// Look for top-level bullet item starting with bold name: * **name**
		const nameMatch = line.match(/^\* \*\*(.+?)\*\*/);
		if (!nameMatch) {
			i++;
			continue;
		}

		const name = nameMatch[1]!;
		i++;

		// Collect all indented lines until next top-level bullet or end
		const blockLines: string[] = [];
		while (i < lines.length && !lines[i]!.match(/^\* \*\*/)) {
			blockLines.push(lines[i]!);
			i++;
		}

		const block = blockLines.join("\n");

		// Extract type: first bold on its own line within the block
		let type = "";
		let defaultValue: string | undefined;
		const descParts: string[] = [];

		for (const bline of blockLines) {
			const trimmed = bline.trim();

			// Type line: **type content**
			if (!type && trimmed.match(/^\*\*.+\*\*$/) && trimmed !== `**${name}**`) {
				type = trimmed.replace(/\*\*/g, "").trim();
				continue;
			}

			// Default line: **Default: value**
			const defaultMatch = trimmed.match(/^\*\*Default:\s*(.+?)\*\*$/);
			if (defaultMatch) {
				defaultValue = defaultMatch[1]!.trim();
				continue;
			}

			// Skip empty lines at start of description
			if (!descParts.length && !trimmed) continue;

			// Skip sub-headings (### type definitions)
			if (trimmed.startsWith("### ")) break;

			descParts.push(trimmed);
		}

		items.push({
			name,
			type,
			default: defaultValue,
			description: descParts.join("\n").trim(),
		});
	}

	return items;
}

function parseExamples(section: string): ComponentExample[] {
	const examples: ComponentExample[] = [];
	const lines = section.split("\n");

	let i = 0;
	while (i < lines.length) {
		const line = lines[i]!;

		// Example title: * #### Title
		const titleMatch = line.match(/^\* #### (.+)/);
		if (!titleMatch) {
			i++;
			continue;
		}

		const title = titleMatch[1]!.trim();
		i++;

		// Collect block until next example
		const blockLines: string[] = [];
		while (i < lines.length && !lines[i]!.match(/^\* #### /)) {
			blockLines.push(lines[i]!);
			i++;
		}

		const block = blockLines.join("\n");

		// Extract description
		const descMatch = block.match(
			/##### Description\s*\n([\s\S]*?)(?=\n\s*##### |\n\s*$)/,
		);
		const description = descMatch
			? descMatch[1]!.trim().replace(/^\s+/gm, "")
			: "";

		// Extract JSX code block
		const jsxMatch = block.match(
			/##### jsx\s*\n\s*```jsx\s*\n([\s\S]*?)```/,
		);
		const jsx = jsxMatch ? jsxMatch[1]!.trim() : "";

		// Extract HTML code block
		const htmlMatch = block.match(
			/##### html\s*\n\s*```html\s*\n([\s\S]*?)```/,
		);
		const html = htmlMatch ? htmlMatch[1]!.trim() : "";

		if (jsx || html) {
			examples.push({ title, description, jsx, html });
		}
	}

	return examples;
}

function parseBulletList(section: string): string[] {
	return section
		.split("\n")
		.filter((line) => line.match(/^\* /))
		.map((line) => line.replace(/^\* /, "").trim());
}

function camelToKebab(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();
}
