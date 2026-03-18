/**
 * Extracts the description from markdown frontmatter.
 */
export function parseFrontmatterDescription(markdown: string): string {
	const lines = markdown.split("\n");
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

/**
 * Converts a PascalCase component name to kebab-case.
 */
export function camelToKebab(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();
}
