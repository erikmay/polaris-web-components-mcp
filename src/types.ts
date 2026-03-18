export type ComponentProperty = {
	name: string;
	type: string;
	default?: string;
	description: string;
};

export type ComponentEvent = {
	name: string;
	type: string;
	description: string;
};

export type ComponentSlot = {
	name: string;
	type: string;
	description: string;
};

export type ComponentExample = {
	title: string;
	description: string;
	jsx: string;
	html: string;
};

export type ComponentDoc = {
	name: string;
	tagName: string;
	url: string;
	category: string;
	description: string;
	properties: ComponentProperty[];
	events: ComponentEvent[];
	slots: ComponentSlot[];
	examples: ComponentExample[];
	bestPractices: string[];
	contentGuidelines: string[];
	usefulFor: string[];
};

export type ComponentListEntry = {
	name: string;
	slug: string;
	category: string;
	categorySlug: string;
};
