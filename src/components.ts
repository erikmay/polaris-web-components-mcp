import type { ComponentListEntry } from "./types.ts";

const BASE_URL =
	"https://shopify.dev/docs/api/app-home/polaris-web-components";

export const COMPONENTS: ComponentListEntry[] = [
	// Actions
	{ name: "Button", slug: "actions/button", category: "Actions", categorySlug: "actions" },
	{ name: "ButtonGroup", slug: "actions/buttongroup", category: "Actions", categorySlug: "actions" },
	{ name: "Clickable", slug: "actions/clickable", category: "Actions", categorySlug: "actions" },
	{ name: "ClickableChip", slug: "actions/clickablechip", category: "Actions", categorySlug: "actions" },
	{ name: "Link", slug: "actions/link", category: "Actions", categorySlug: "actions" },
	{ name: "Menu", slug: "actions/menu", category: "Actions", categorySlug: "actions" },

	// Feedback and Status Indicators
	{ name: "Badge", slug: "feedback-and-status-indicators/badge", category: "Feedback and Status", categorySlug: "feedback-and-status-indicators" },
	{ name: "Banner", slug: "feedback-and-status-indicators/banner", category: "Feedback and Status", categorySlug: "feedback-and-status-indicators" },
	{ name: "Spinner", slug: "feedback-and-status-indicators/spinner", category: "Feedback and Status", categorySlug: "feedback-and-status-indicators" },

	// Forms
	{ name: "Checkbox", slug: "forms/checkbox", category: "Forms", categorySlug: "forms" },
	{ name: "ChoiceList", slug: "forms/choicelist", category: "Forms", categorySlug: "forms" },
	{ name: "ColorField", slug: "forms/colorfield", category: "Forms", categorySlug: "forms" },
	{ name: "ColorPicker", slug: "forms/colorpicker", category: "Forms", categorySlug: "forms" },
	{ name: "DateField", slug: "forms/datefield", category: "Forms", categorySlug: "forms" },
	{ name: "DatePicker", slug: "forms/datepicker", category: "Forms", categorySlug: "forms" },
	{ name: "DropZone", slug: "forms/dropzone", category: "Forms", categorySlug: "forms" },
	{ name: "EmailField", slug: "forms/emailfield", category: "Forms", categorySlug: "forms" },
	{ name: "MoneyField", slug: "forms/moneyfield", category: "Forms", categorySlug: "forms" },
	{ name: "NumberField", slug: "forms/numberfield", category: "Forms", categorySlug: "forms" },
	{ name: "PasswordField", slug: "forms/passwordfield", category: "Forms", categorySlug: "forms" },
	{ name: "SearchField", slug: "forms/searchfield", category: "Forms", categorySlug: "forms" },
	{ name: "Select", slug: "forms/select", category: "Forms", categorySlug: "forms" },
	{ name: "Switch", slug: "forms/switch", category: "Forms", categorySlug: "forms" },
	{ name: "TextArea", slug: "forms/textarea", category: "Forms", categorySlug: "forms" },
	{ name: "TextField", slug: "forms/textfield", category: "Forms", categorySlug: "forms" },
	{ name: "URLField", slug: "forms/urlfield", category: "Forms", categorySlug: "forms" },

	// Layout and Structure
	{ name: "Box", slug: "layout-and-structure/box", category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Divider", slug: "layout-and-structure/divider", category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Grid", slug: "layout-and-structure/grid", category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "OrderedList", slug: "layout-and-structure/orderedlist", category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "QueryContainer", slug: "layout-and-structure/querycontainer", category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Section", slug: "layout-and-structure/section", category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Stack", slug: "layout-and-structure/stack", category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Table", slug: "layout-and-structure/table", category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "UnorderedList", slug: "layout-and-structure/unorderedlist", category: "Layout", categorySlug: "layout-and-structure" },

	// Media and Visuals
	{ name: "Avatar", slug: "media-and-visuals/avatar", category: "Media", categorySlug: "media-and-visuals" },
	{ name: "Icon", slug: "media-and-visuals/icon", category: "Media", categorySlug: "media-and-visuals" },
	{ name: "Image", slug: "media-and-visuals/image", category: "Media", categorySlug: "media-and-visuals" },
	{ name: "Thumbnail", slug: "media-and-visuals/thumbnail", category: "Media", categorySlug: "media-and-visuals" },

	// Overlays
	{ name: "Modal", slug: "overlays/modal", category: "Overlays", categorySlug: "overlays" },
	{ name: "Popover", slug: "overlays/popover", category: "Overlays", categorySlug: "overlays" },

	// Structure
	{ name: "Page", slug: "structure/page", category: "Structure", categorySlug: "structure" },

	// Typography and Content
	{ name: "Chip", slug: "typography-and-content/chip", category: "Typography", categorySlug: "typography-and-content" },
	{ name: "Heading", slug: "typography-and-content/heading", category: "Typography", categorySlug: "typography-and-content" },
	{ name: "Paragraph", slug: "typography-and-content/paragraph", category: "Typography", categorySlug: "typography-and-content" },
	{ name: "Text", slug: "typography-and-content/text", category: "Typography", categorySlug: "typography-and-content" },
	{ name: "Tooltip", slug: "typography-and-content/tooltip", category: "Typography", categorySlug: "typography-and-content" },
];

export function getComponentUrl(slug: string): string {
	return `${BASE_URL}/${slug}`;
}

export function getComponentMdUrl(slug: string): string {
	return `${BASE_URL}/${slug}.md`;
}
