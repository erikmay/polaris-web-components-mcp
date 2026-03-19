import type { PatternEntry } from "./types.ts";

const BASE_URL = "https://shopify.dev/docs/api/app-home/patterns";

export const PATTERNS: PatternEntry[] = [
	// Compositions
	{ name: "Account Connection", slug: "compositions/account-connection", category: "Compositions" },
	{ name: "App Card", slug: "compositions/app-card", category: "Compositions" },
	{ name: "Callout Card", slug: "compositions/callout-card", category: "Compositions" },
	{ name: "Empty State", slug: "compositions/empty-state", category: "Compositions" },
	{ name: "Footer Help", slug: "compositions/footer-help", category: "Compositions" },
	{ name: "Index Table", slug: "compositions/index-table", category: "Compositions" },
	{ name: "Interstitial Nav", slug: "compositions/interstitial-nav", category: "Compositions" },
	{ name: "Media Card", slug: "compositions/media-card", category: "Compositions" },
	{ name: "Metrics Card", slug: "compositions/metrics-card", category: "Compositions" },
	{ name: "Resource List", slug: "compositions/resource-list", category: "Compositions" },
	{ name: "Setup Guide", slug: "compositions/setup-guide", category: "Compositions" },

	// Templates
	{ name: "Details", slug: "templates/details", category: "Templates" },
	{ name: "Homepage", slug: "templates/homepage", category: "Templates" },
	{ name: "Index", slug: "templates/index", category: "Templates" },
	{ name: "Settings", slug: "templates/settings", category: "Templates" },
];

export function getPatternUrl(slug: string): string {
	return `${BASE_URL}/${slug}`;
}

export function getPatternMdUrl(slug: string): string {
	return `${BASE_URL}/${slug}.md`;
}
