import type { ComponentListEntry } from "./types.ts";

const BASE_URL = "https://shopify.dev/docs/api/app-home";
const POLARIS = "polaris-web-components";
const APP_BRIDGE = "app-bridge-web-components";

export const COMPONENTS: ComponentListEntry[] = [
	// Actions
	{ name: "Button", slug: `${POLARIS}/actions/button`, category: "Actions", categorySlug: "actions" },
	{ name: "ButtonGroup", slug: `${POLARIS}/actions/buttongroup`, category: "Actions", categorySlug: "actions" },
	{ name: "Clickable", slug: `${POLARIS}/actions/clickable`, category: "Actions", categorySlug: "actions" },
	{ name: "ClickableChip", slug: `${POLARIS}/actions/clickablechip`, category: "Actions", categorySlug: "actions" },
	{ name: "Link", slug: `${POLARIS}/actions/link`, category: "Actions", categorySlug: "actions" },
	{ name: "Menu", slug: `${POLARIS}/actions/menu`, category: "Actions", categorySlug: "actions" },

	// Feedback and Status Indicators
	{ name: "Badge", slug: `${POLARIS}/feedback-and-status-indicators/badge`, category: "Feedback and Status", categorySlug: "feedback-and-status-indicators" },
	{ name: "Banner", slug: `${POLARIS}/feedback-and-status-indicators/banner`, category: "Feedback and Status", categorySlug: "feedback-and-status-indicators" },
	{ name: "Spinner", slug: `${POLARIS}/feedback-and-status-indicators/spinner`, category: "Feedback and Status", categorySlug: "feedback-and-status-indicators" },

	// Forms
	{ name: "Checkbox", slug: `${POLARIS}/forms/checkbox`, category: "Forms", categorySlug: "forms" },
	{ name: "ChoiceList", slug: `${POLARIS}/forms/choicelist`, category: "Forms", categorySlug: "forms" },
	{ name: "ColorField", slug: `${POLARIS}/forms/colorfield`, category: "Forms", categorySlug: "forms" },
	{ name: "ColorPicker", slug: `${POLARIS}/forms/colorpicker`, category: "Forms", categorySlug: "forms" },
	{ name: "DateField", slug: `${POLARIS}/forms/datefield`, category: "Forms", categorySlug: "forms" },
	{ name: "DatePicker", slug: `${POLARIS}/forms/datepicker`, category: "Forms", categorySlug: "forms" },
	{ name: "DropZone", slug: `${POLARIS}/forms/dropzone`, category: "Forms", categorySlug: "forms" },
	{ name: "EmailField", slug: `${POLARIS}/forms/emailfield`, category: "Forms", categorySlug: "forms" },
	{ name: "MoneyField", slug: `${POLARIS}/forms/moneyfield`, category: "Forms", categorySlug: "forms" },
	{ name: "NumberField", slug: `${POLARIS}/forms/numberfield`, category: "Forms", categorySlug: "forms" },
	{ name: "PasswordField", slug: `${POLARIS}/forms/passwordfield`, category: "Forms", categorySlug: "forms" },
	{ name: "SearchField", slug: `${POLARIS}/forms/searchfield`, category: "Forms", categorySlug: "forms" },
	{ name: "Select", slug: `${POLARIS}/forms/select`, category: "Forms", categorySlug: "forms" },
	{ name: "Switch", slug: `${POLARIS}/forms/switch`, category: "Forms", categorySlug: "forms" },
	{ name: "TextArea", slug: `${POLARIS}/forms/textarea`, category: "Forms", categorySlug: "forms" },
	{ name: "TextField", slug: `${POLARIS}/forms/textfield`, category: "Forms", categorySlug: "forms" },
	{ name: "URLField", slug: `${POLARIS}/forms/urlfield`, category: "Forms", categorySlug: "forms" },

	// Layout and Structure
	{ name: "Box", slug: `${POLARIS}/layout-and-structure/box`, category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Divider", slug: `${POLARIS}/layout-and-structure/divider`, category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Grid", slug: `${POLARIS}/layout-and-structure/grid`, category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "OrderedList", slug: `${POLARIS}/layout-and-structure/orderedlist`, category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "QueryContainer", slug: `${POLARIS}/layout-and-structure/querycontainer`, category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Section", slug: `${POLARIS}/layout-and-structure/section`, category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Stack", slug: `${POLARIS}/layout-and-structure/stack`, category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "Table", slug: `${POLARIS}/layout-and-structure/table`, category: "Layout", categorySlug: "layout-and-structure" },
	{ name: "UnorderedList", slug: `${POLARIS}/layout-and-structure/unorderedlist`, category: "Layout", categorySlug: "layout-and-structure" },

	// Media and Visuals
	{ name: "Avatar", slug: `${POLARIS}/media-and-visuals/avatar`, category: "Media", categorySlug: "media-and-visuals" },
	{ name: "Icon", slug: `${POLARIS}/media-and-visuals/icon`, category: "Media", categorySlug: "media-and-visuals" },
	{ name: "Image", slug: `${POLARIS}/media-and-visuals/image`, category: "Media", categorySlug: "media-and-visuals" },
	{ name: "Thumbnail", slug: `${POLARIS}/media-and-visuals/thumbnail`, category: "Media", categorySlug: "media-and-visuals" },

	// Overlays
	{ name: "Modal", slug: `${POLARIS}/overlays/modal`, category: "Overlays", categorySlug: "overlays" },
	{ name: "Popover", slug: `${POLARIS}/overlays/popover`, category: "Overlays", categorySlug: "overlays" },

	// Structure
	{ name: "Page", slug: `${POLARIS}/structure/page`, category: "Structure", categorySlug: "structure" },

	// Typography and Content
	{ name: "Chip", slug: `${POLARIS}/typography-and-content/chip`, category: "Typography", categorySlug: "typography-and-content" },
	{ name: "Heading", slug: `${POLARIS}/typography-and-content/heading`, category: "Typography", categorySlug: "typography-and-content" },
	{ name: "Paragraph", slug: `${POLARIS}/typography-and-content/paragraph`, category: "Typography", categorySlug: "typography-and-content" },
	{ name: "Text", slug: `${POLARIS}/typography-and-content/text`, category: "Typography", categorySlug: "typography-and-content" },
	{ name: "Tooltip", slug: `${POLARIS}/typography-and-content/tooltip`, category: "Typography", categorySlug: "typography-and-content" },

	// App Bridge
	{ name: "AppNav", slug: `${APP_BRIDGE}/app-nav`, category: "App Bridge", categorySlug: "app-bridge-web-components" },
	{ name: "AppWindow", slug: `${APP_BRIDGE}/app-window`, category: "App Bridge", categorySlug: "app-bridge-web-components" },
	{ name: "Forms", slug: `${APP_BRIDGE}/forms`, category: "App Bridge", categorySlug: "app-bridge-web-components" },
	{ name: "TitleBar", slug: `${APP_BRIDGE}/title-bar`, category: "App Bridge", categorySlug: "app-bridge-web-components" },
];

export function getComponentUrl(slug: string): string {
	return `${BASE_URL}/${slug}`;
}

export function getComponentMdUrl(slug: string): string {
	return `${BASE_URL}/${slug}.md`;
}

export { APP_BRIDGE };
