/**
 * Compute Levenshtein edit distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () =>
		Array(n + 1).fill(0),
	);

	for (let i = 0; i <= m; i++) dp[i]![0] = i;
	for (let j = 0; j <= n; j++) dp[0]![j] = j;

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			dp[i]![j] =
				a[i - 1] === b[j - 1]
					? dp[i - 1]![j - 1]!
					: 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
		}
	}

	return dp[m]![n]!;
}

/**
 * Synonym map for icon search. Maps common search terms to
 * actual icon name segments used in the Polaris icon set.
 */
export const ICON_SYNONYMS: Record<string, string[]> = {
	warning: ["alert"],
	error: ["alert"],
	danger: ["alert"],
	shop: ["store"],
	merchant: ["store"],
	retry: ["refresh"],
	reload: ["refresh"],
	rotate: ["refresh"],
	login: ["lock", "key", "passkey", "person"],
	auth: ["lock", "key", "passkey", "shield"],
	password: ["lock", "key", "passkey"],
	close: ["x"],
	remove: ["delete", "x"],
	trash: ["delete"],
	search: ["magnifying-glass"],
	find: ["magnifying-glass"],
	settings: ["gear"],
	config: ["gear"],
	home: ["house"],
	money: ["cash", "payment", "credit-card"],
	copy: ["clipboard"],
	paste: ["clipboard"],
	user: ["person"],
	account: ["person"],
	profile: ["person"],
	mail: ["email", "envelope"],
	notification: ["bell", "alert"],
	info: ["info", "question-circle"],
	help: ["question-circle"],
	expand: ["chevron", "arrow"],
	collapse: ["chevron", "arrow"],
	dropdown: ["chevron-down", "caret-down"],
	upload: ["upload", "arrow-up"],
	download: ["download", "arrow-down"],
	save: ["floppy-disk"],
	edit: ["edit", "pen"],
	write: ["edit", "pen"],
	time: ["clock"],
	schedule: ["clock", "calendar"],
	image: ["image", "camera"],
	photo: ["image", "camera"],
	link: ["link"],
	external: ["external", "arrow-up-right"],
	sort: ["sort", "arrow-up", "arrow-down"],
	filter: ["filter"],
	attach: ["attachment", "paperclip"],
	pin: ["pin"],
	star: ["star", "favorite"],
	favourite: ["star", "favorite"],
	favorite: ["star", "favorite"],
	like: ["heart", "thumbs-up"],
	share: ["share"],
	print: ["print"],
	eye: ["eye", "view"],
	visible: ["eye", "view"],
	hidden: ["eye-slash", "hide"],
	invisible: ["eye-slash", "hide"],
};

/**
 * Search icons with fuzzy matching. Splits query into words,
 * expands through synonyms, and falls back to Levenshtein distance.
 */
export function searchIcons(
	icons: string[],
	query: string,
): { exact: string[]; fuzzy: string[] } {
	const words = query
		.toLowerCase()
		.split(/\s+/)
		.filter((w) => w.length > 0);

	if (words.length === 0) return { exact: icons, fuzzy: [] };

	// Expand words through synonyms
	const expandedWords = new Set<string>();
	for (const word of words) {
		expandedWords.add(word);
		const synonyms = ICON_SYNONYMS[word];
		if (synonyms) {
			for (const syn of synonyms) expandedWords.add(syn);
		}
	}

	// Exact substring matches (any expanded word)
	const exact = new Set<string>();
	for (const icon of icons) {
		for (const word of expandedWords) {
			if (icon.includes(word)) {
				exact.add(icon);
				break;
			}
		}
	}

	// Fuzzy matches via Levenshtein on icon name segments
	const fuzzy = new Set<string>();
	if (exact.size === 0) {
		for (const icon of icons) {
			const segments = icon.split("-");
			for (const word of words) {
				for (const segment of segments) {
					if (
						word.length >= 3 &&
						levenshtein(word, segment) <= 2
					) {
						fuzzy.add(icon);
						break;
					}
				}
			}
		}
	}

	return {
		exact: [...exact].sort(),
		fuzzy: [...fuzzy].filter((i) => !exact.has(i)).sort(),
	};
}

/**
 * Find closest matches for a string from a list of candidates.
 */
export function findClosest(
	input: string,
	candidates: string[],
	maxResults = 3,
): string[] {
	const scored = candidates
		.map((c) => ({ value: c, dist: levenshtein(input.toLowerCase(), c.toLowerCase()) }))
		.sort((a, b) => a.dist - b.dist);

	return scored.slice(0, maxResults).map((s) => s.value);
}
