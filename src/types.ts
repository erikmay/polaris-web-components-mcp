export type ComponentProp = {
	name: string;
	type: string;
	default?: string;
};

export type ComponentDoc = {
	name: string;
	tagName: string;
	url: string;
	category: string;
	description: string;
	markdown: string;
	props: ComponentProp[];
};

export type ComponentListEntry = {
	name: string;
	slug: string;
	category: string;
	categorySlug: string;
};

export type PatternEntry = {
	name: string;
	slug: string;
	category: "Compositions" | "Templates";
};

export type PatternDoc = {
	name: string;
	slug: string;
	url: string;
	category: "Compositions" | "Templates";
	description: string;
	markdown: string;
};
