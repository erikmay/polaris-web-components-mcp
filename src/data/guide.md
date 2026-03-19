---
title: Using Polaris web components
description: >
  Polaris web components are Shopify's UI toolkit for building interfaces that
  match the Shopify Admin design system. This toolkit provides a set of custom
  HTML elements (web components) that you can use to create consistent,
  accessible, and performant user interfaces for the Shopify App Home and UI
  Extensions.
api_name: app-home
source_url:
  html: 'https://shopify.dev/docs/api/app-home/using-polaris-components'
  md: 'https://shopify.dev/docs/api/app-home/using-polaris-components.md'
---

# Using Polaris web components

Polaris web components are Shopify's UI toolkit for building interfaces that match the Shopify Admin design system. This toolkit provides a set of custom HTML elements (web components) that you can use to create consistent, accessible, and performant user interfaces for the Shopify App Home and UI Extensions.

***

## Availability

You can start using Polaris web components in any framework right away. Simply add the script tag to your app's HTML head.

## Example

##### HTML

```html
<head>
  <meta name="shopify-api-key" content="%SHOPIFY_API_KEY%" />
  <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
  <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
</head>
```

##### Remix

```tsx
import {useNavigate} from '@remix-run/react';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigate = (event) => {
      const href = event.target.getAttribute('href');
      if (href) navigate(href);
    };

    document.addEventListener('shopify:navigate', handleNavigate);
    return () => {
      document.removeEventListener('shopify:navigate', handleNavigate);
    };
  }, [navigate]);

  return (
    <html>
      <head>
        ...
        <script src="https://cdn.shopify.com/shopifycloud/polaris.js"></script>
      </head>
      ...
    </html>
  );
}
```

***

## Styling

Polaris web components come with built-in styling that follows Shopify's design system. The components will automatically apply the correct styling based on the properties you set and the context in which they are used. For example, headings automatically display at progressively less prominent sizes based on how many levels deep they are nested inside of sections.

In general, you should not need to use custom CSS to style Polaris web components. By building with only the components, you can ensure that your app will look and feel consistent with the Shopify Admin and its style will automatically adjust to match future updates.

## Example

## JSX

```jsx
<s-box
  padding="base"
  background="subdued"
  border="base"
  borderRadius="base"
>
  Content
</s-box>
```

***

## Opinionated Layout

To ensure the white space between components stays aligned with the Admin Design Language use components with opinionated spacing like `s-page` and `s-section`.

### s-page component

The `s-page` adds the global padding, background color, and internal layout for the Admin. It includes opinionated spacing between `s-section` and `s-banner`.

Two sizes:

* `large` which is full width used for tables and data visualization
* `base` which is narrow and used for forms with a sidebar

Can add a sidebar with the `aside` slot

### s-section component

The `s-section` component provides structured content areas with proper spacing. It provides default vertical white space to children

* `s-stack` and `s-grid` are not necessary as children unless building a complex layout
* Nesting `s-section` elements changes the heading level and the appearance of the section.
* The top level `s-section` renders a card appearance

## Example

```html
<s-page>
  <s-banner tone="critical" heading="Media upload failed">
    File extension doesn't match the format of the file.
  </s-banner>
  <s-section>
    <s-text-field label="Title"></s-text-field>
    <s-text-area label="Description"> </s-text-area>
  </s-section>


  <s-section heading="Status" slot="aside">
    <s-select>
      <s-option value="active">Active</s-option>
      <s-option value="draft">Draft</s-option>
    </s-select>
  </s-section>
</s-page>
```

***

## Custom layout

When you need to build custom layouts you can use `s-stack`, `s-grid` and `s-box`. You should always try to use `s-section` and `s-page` components first to ensure your white space stays aligned with the Admin Design Language.

* `s-stack` and `s-grid` do not include space between children by default. To apply the default white space between children use `gap="base"`
* Try to avoid adding vertical spacing with custom layouts. Use the `s-section` and `s-page` default white space instead.
* When `s-stack` is `display="inline"` it will automatically wrap children to a new line when space is limited.
* `s-grid` will allow children to overflow unless template rows/columns are properly set.
* Order is important for shorthand properties, e.g. border takes `size-keyword`, `color-keyword`, `style-keyword`

***

## Scale

Our components use a middle-out scale for multiple properties like `padding`, `size` and `gap`.

Our scale moves from the middle out:

* `small-300` is smaller than `small-100`
* `large-300` is bigger than `large-100`
* `small-100` and `large-100` have aliases of `small` and `large`
* `base` is the default value

## Example

```ts
export type Scale =
  | 'small-300'
  | 'small-200'
  | 'small-100'
  | 'small' // alias of small-100
  | 'base'
  | 'large' // alias of large-100
  | 'large-100'
  | 'large-200'
  | 'large-300';
```

***

## Responsive values

Some properties accept responsive values, which enables you to change the value of the property depending on a parent block size.

##### Syntax

The syntax for a responsive value generally follows the ternary operator syntax. For example, `@container (inline-size < 500px) small, large` means that the value will be `small` if the container is less than 500px wide, and `large` if the container is 500px or wider. The syntax rules are:

1. Begin the value with `@container`
2. Optionally add a name to target a specific container
3. Use the `inline-size` keyword inside of parentheses to query the inline-size of the container. This is the condition that will be evaluated to determine which value to use.
4. Set the value if that condition is true
5. Set the value to be used if the condition is false.

##### Using s-query-container

When using responsive values, you must also place the `<s-query-container>` component in the location you want to query the inline-size.

By default, the responsive value will query against the closest parent; to look up a specific parent, this component also accepts a `queryname` attribute which adds a name to the container. Then add that name after `@container` in your responsive value to target it.

##### Values with reserved characters

Some values could contain reserved characters used in the responsive value syntax, such as `()` or `,`. To use these values, escape them by wrapping them in quotes.

##### Advanced patterns

The syntax is flexible enough to support advanced patterns such as compound conditions, and|or conditions, and nested conditions.

## HTML

```html
<s-box padding="@container (inline-size < 500px) small, large">Hello</s-box>
```

## Pseudocode

##### Basic example

```html
<s-page>
  <s-query-container>
    <s-box padding="@container (inline-size < 500px) small, large">Hello</s-box>
  </s-query-container>
</s-page>
```

##### Named example

```html
<s-query-container containername="outer">
  <s-page>
    <s-query-container>
      <s-box padding="@container outer (inline-size < 500px) small, large">
        Hello
      </s-box>
    </s-query-container>
  </s-page>
</s-query-container>
```

## Escaped characters

```html
<s-query-container>
  <s-grid
    gridtemplatecolumns="@container (inline-size < 500px) 'repeat(2, 1fr)', 'repeat(3, 1fr)'"
  >
    ...
  </s-grid>
</s-query-container>
```

## Advanced patterns

##### Compound

```html
<s-query-container>
  <s-box padding="@container (300px < inline-size < 500px) small, large">
    The padding will be "small" when the container is between 300px and 500px
    wide. Otherwise it will be "large".
  </s-box>
</s-query-container>
```

##### And|or

```html
<s-query-container>
  <s-box
    padding="@container (inline-size < 500px) or (inline-size > 1000px) small, large"
  >
    This padding will be "small" when the container is less than 500px wide, or
    when the container is greater than 1000px wide. Otherwise it will be
    "large".
  </s-box>
</s-query-container>
```

##### Nested

```html
<s-query-container>
  <s-box
    padding="@container (inline-size < 500px) small, (500px <= inline-size < 1000px) base, large"
  >
    This padding will be "small" when the container is less than 500px wide,
    "base" when the container is between 500px and 1000px wide, and "large" when
    the container is greater than 1000px wide.
  </s-box>
</s-query-container>
```

***

## Interactive elements

`s-clickable` `s-button` and `s-link` render as anchor elements when they have a `href` and render as a button element when they have an `onClick` without a `href`. The HTML specification states that interactive elements cannot have interactive children.

`s-clickable` is an escape hatch for when `s-link` and `s-button` are not able to implement a specific design. You should always try to use `s-link` and `s-button` first.

Interactive components with `target="auto"` automatically use `_self` for internal links and `_blank` for external URLs. This behavior ensures a consistent navigation experience for users without requiring developers to manually set the correct target for each link.

***

## Variant tone and color

The `tone` is used to apply a group of color design tokens to the component such as `critical` `success` or `info`.

The `color` adjusts the intensity of the `tone` making it more `subdued` or `strong`.

The `variant` is used to change how the component is rendered to match the design language. This is different for each component.

## Example

```html
<s-button tone="critical" variant="primary"> Primary Critical Button </s-button>


<s-badge tone="success" color="strong"> Success Strong Badge </s-badge>
```

***

## Using with React (App Home)

When building in the App Home with the Shopify Remix template, you'll be using React. Here's how to use Polaris web components in your React components:

## Example

## JSX

```jsx
import {useState} from 'react';


function ProductForm() {
  const [productName, setProductName] = useState('');


  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Product name:', productName);
  };


  return (
    <s-section heading="Add Product">
      <form onSubmit={handleSubmit}>
        <s-stack gap="base">
          <s-text-field
            label="Product name"
            value={productName}
            onChange={(e) => setProductName(e.currentTarget.value)}
            required
          />
          <s-button variant="primary" type="submit">
            Save product
          </s-button>
        </s-stack>
      </form>
    </s-section>
  );
}
```

***

## Using with Preact (UI Extensions)

For UI Extensions, Shopify provides Preact as the framework of choice. Using Polaris web components with Preact is very similar to using them with React:

## Example

## JSX

```jsx
export function ProductExtension() {
  return (
    <s-box padding="base">
      <s-stack gap="base">
        <s-text>Enable special pricing</s-text>
        <s-checkbox
          onChange={() => console.log('Checkbox toggled')}
        />
        <s-number-field
          label="Discount percentage"
          suffix="%"
          min="0"
          max="100"
        />
      </s-stack>
    </s-box>
  );
}
```

***

## Properties vs Attributes

Polaris web components follow the same property and attribute patterns as standard HTML elements. Understanding this distinction is important for using the components effectively.

##### Key Concepts

1. **Attributes** are HTML attributes that appear in the HTML markup.
2. **Properties** are JavaScript object properties accessed directly on the DOM element.
3. Most attributes in Polaris web components are reflected as properties, with a few exceptions like `value` and `checked` which follow HTML's standard behavior.

##### How JSX Props Are Applied

When using Polaris web components in JSX (React or Preact), the framework determines how to apply your props based on whether the element has a matching property name.

If the element has a property with the exact same name as your prop, the value is set as a property. Otherwise, it's applied as an attribute. Here's how this works in pseudocode:

##### Examples

For Polaris web components, you can generally just use the property names as documented, and everything will work as expected.

## Pseudocode

## JavaScript

```javascript
if (propName in element) {
  // Set as a property
  element[propName] = propValue;
} else {
  // Set as an attribute
  element.setAttribute(propName, propValue);
}
```

## Examples

## JSX

```jsx
// This works as expected - the "gap" property accepts string values
<s-stack gap="base">...</s-stack>


// This also works - the "checked" property accepts boolean values
<s-checkbox checked={true}>...</s-checkbox>


// Complex values like objects and arrays are set as properties
<s-data-table items={[{ id: 1, name: 'Product' }]}>...</s-data-table>
```

***

## Event Handling

Polaris web components use standard DOM events, making them work seamlessly with your preferred framework. You can attach event handlers using the same patterns as with native HTML elements.

##### Basic Event Handling

Event handlers in Polaris components work just like standard HTML elements. In frameworks, use the familiar camelCase syntax (like `onClick` in React). In plain HTML, use lowercase attributes or `addEventListener`.

##### Form Input Events

Polaris form components support two primary event types for tracking input changes:

* **onInput**: Fires immediately on every keystroke or value change
* **onChange**: Fires when the field loses focus or Enter is pressed

Choose the appropriate event based on your needs:

* Use `onInput` for real-time validation or character counting
* Use `onChange` for validation after a user completes their input

##### Focus Management

Track when users interact with form elements using these events:

* **onFocus**: Fires when an element receives focus
* **onBlur**: Fires when an element loses focus

##### Form Values and Types

Important details about form values in Polaris web components:

* All form elements return string values in their events, even numeric inputs
* Multi-select components (like `s-choice-list`) use a `values` prop (array of strings)
* Access values in event handlers via `event.currentTarget.value`

##### Controlled vs. Uncontrolled Components

Polaris components can be used in two ways:

**Uncontrolled (simpler)**: Component manages its own internal state - use `defaultValue` prop

**Controlled (more powerful)**: Your code manages the component's state - use `value` prop

Use controlled components when you need to:

* Validate input as the user types
* Format or transform input values
* Synchronize multiple inputs

##### Technical Details

Under the hood, Polaris web components handle event registration consistently across frameworks:

* In React 18+, Polaris components properly register events via `addEventListener` instead of setting attributes
* Event names are automatically converted to lowercase (`onClick` becomes `click`)
* All event handlers receive standard DOM events as their first argument

For example, when you write `<s-button onClick={handleClick}>`, the component:

1. Sees that `"onclick" in element` is `true`
2. Registers your handler via `addEventListener('click', handler)`
3. Passes the event object to your handler when clicked

## Basic Event Handling Examples

##### JSX

```jsx
<s-button onClick={() => console.log('Clicked!')}>
  Inline Handler
</s-button>

<s-button onClick={(event) => {
  console.log('Event details:', event.type);
  console.log('Target:', event.currentTarget);
}}>
  With Event Object
</s-button>
```

##### HTML

```html
<s-button onclick="console.log('Button clicked!')">
  Click me
</s-button>

<s-button id="eventButton">
  Click me (addEventListener)
</s-button>

<script>
  const eventButton = document.getElementById('eventButton');

  eventButton.addEventListener('click', () => {
    console.log('Button clicked via addEventListener!');
  });
</script>
```

## Form Input Events Examples

##### JSX

```jsx
// OnInput fires on every keystroke
<s-text-field
  label="Email"
  name="email"
  onInput={(e) => console.log('Typing:', e.currentValue.value)}
/>

// OnChange fires on blur or Enter press
<s-text-field
  label="Name"
  name="name"
  onChange={(e) => console.log('Value committed:', e.currentValue.value)}
/>

// Using both together
<s-search-field
  label="Search"
  name="search"
  onInput={(e) => console.log('Real-time:', e.currentTarget.value)}
  onChange={(e) => console.log('Final value:', e.currentTarget.value)}
/>
```

##### HTML

```html
<s-text-field
  label="Email"
  name="email"
  oninput="console.log('Typing:', this.value)"
></s-text-field>

<s-text-field
  label="Name"
  name="name"
  onchange="console.log('Value committed:', this.value)"
></s-text-field>

<!-- Using addEventListener -->
<s-search-field
  label="Search"
  name="search"
></s-search-field>

<script>
  const field = document.querySelector('s-search-field');

  field.addEventListener('input', (e) => {
    console.log('Real-time:', e.currentTarget.value);
  });

  field.addEventListener('change', (e) => {
    console.log('Final value:', e.currentTarget.value);
  });
</script>
```

## Focus Management Examples

##### JSX

```jsx
<s-search-field
  label="Search"
  name="search"
  onFocus={() => console.log('Field focused')}
  onBlur={() => console.log('Field blurred')}
/>

<s-text-field
  label="Name"
  name="name"
  details="Tab to next field to trigger blur"
  onFocus={(e) => {
    e.currentTarget.setAttribute('details', 'Field is active!')
  }}
  onBlur={(e) => {
    e.currentTarget.setAttribute('details', 'Tab to next field to trigger blur')
  }}
/>
```

##### HTML

```html
<s-search-field
  label="Search"
  name="search"
  onfocus="console.log('Field focused')"
  onblur="console.log('Field blurred')"
></s-search-field>

<s-text-field
  label="Name"
  name="name"
  details="Tab to next field to trigger blur"
></s-text-field>

<script>
  const field = document.querySelector('s-text-field');

  field.addEventListener('focus', () => {
    field.setAttribute('details', 'Field is active!');
  });

  field.addEventListener('blur', () => {
    field.setAttribute('details', 'Tab to next field to trigger blur');
  });
</script>
```

## Form Values and Types Examples

##### JSX

```jsx
// Number field example - values are strings
<s-number-field
  label="Quantity"
  name="quantity"
  onChange={(e) => {
    // e.currentTarget.value is a string, convert if needed
    const quantity = Number(e.currentTarget.value);
    console.log('Quantity as number:', quantity);
  }}
/>

// Multi-select example - values is an array of strings
<s-choice-list
  name="colors"
  label="Colors"
  multiple
  onChange={(e) => {
    // e.currentTarget.values is an array of strings
    console.log('Selected colors:', e.currentTarget.values);
  }}
>
  <s-choice label="Red" value="red" />
  <s-choice label="Blue" value="blue" />
  <s-choice label="Green" value="green" />
</s-choice-list>
```

##### HTML

```html
<!-- Number field example - values are strings -->
<s-number-field
  label="Quantity"
  name="quantity"
  onchange="console.log('Value type:', typeof this.value, 'Value:', this.value)"
></s-number-field>

<!-- Multi-select example - values is an array of strings -->
<s-choice-list name="colors" label="Colors" multiple>
  <s-choice value="red">Red</s-choice>
  <s-choice value="blue">Blue</s-choice>
  <s-choice value="green">Green</s-choice>
</s-choice-list>

<script>
  const choiceList = document.querySelector('s-choice-list');

  choiceList.addEventListener('change', (e) => {
    // e.currentTarget.values is an array of strings
    console.log('Selected colors:', e.currentTarget.values);
  });
</script>
```

## Controlled vs. Uncontrolled Components Examples

##### JSX

```jsx
// Uncontrolled component - internal state
<s-text-field
  label="Comment"
  name="comment"
  defaultValue="Initial value"
  onChange={(e) => console.log('New value:', e.currentTarget.value)}
/>

// Controlled component - external state
// In a real component, 'name' would be from framework state
const name = "John Doe";

<s-text-field
  label="Name"
  name="name"
  value={name}
  onChange={(e) => {
    console.log('Would update state:', e.currentTarget.value)
  }}
/>
```

##### HTML

```html
<!-- Uncontrolled component - internal state -->
<s-text-field
  label="Comment"
  name="comment"
  value="Initial value"
  onchange="console.log('New value:', this.value)"
></s-text-field>

<!-- Controlled component - external state -->
<s-text-field
  id="nameField"
  label="Name"
  name="name"
  value="John Doe"
></s-text-field>

<button onclick="updateName()">
  Change Name
</button>

<script>
  const nameField = document.getElementById('nameField');

  // Listen for changes to update our "state"
  nameField.addEventListener('input', (e) => {
    console.log('Value changed:', e.currentTarget.value);
  });

  // Manually update the component value (controlled)
  function updateName() {
    nameField.value = "Jane Smith";
  }
</script>
```

## Complete Examples

##### JSX

```jsx
<s-button onClick={() => console.log('Clicked!')}>
  Click me
</s-button>

<s-text-field
  label="Email"
  name="email"
  onChange={(e) => console.log('Value changed:', e.currentTarget.value)}
  onFocus={() => console.log('Field focused')}
  onBlur={() => console.log('Field blurred')}
/>
```

##### HTML

```html
<s-button onclick="console.log('Clicked!')">
  Click me
</s-button>

<s-text-field
  label="Email"
  name="email"
  onchange="console.log('Value changed:', e.currentTarget.value)"
  onfocus="console.log('Field focused')"
  onblur="console.log('Field blurred')"
></s-text-field>

<!-- or -->

<script>
  const textField = document.querySelector('s-text-field');

  textField.addEventListener('change', (e) => {
    console.log('Value changed:', e.currentTarget.value);
  });
</script>
```

***

## Slots

Slots allow you to insert custom content into specific areas of Polaris web components. Use the `slot` attribute to specify where your content should appear within a component.

Key points:

* Named slots (e.g., `slot="title"`) place content in designated areas
* Multiple elements can share the same slot name
* Elements without a slot attribute go into the default (unnamed) slot

## Examples

##### Banner

```jsx
<s-banner heading="Order created" status="success">
  The order has been created successfully.
  <s-button slot="secondary-actions">
    View order
  </s-button>
  <s-button slot="secondary-actions">
    Download invoice
  </s-button>
</s-banner>
```

##### Page

```jsx
<s-page>
  <s-section>
    Main content
  </s-section>

  <div slot="aside">
    <s-section>
      Aside content
    </s-section>
  </div>
</s-page>
```

***

## Working with Forms

Polaris web components work seamlessly with standard HTML forms:

### Form Behavior

The form components will automatically participate in form submission and validation.

## Example

## JSX

```jsx
<form onSubmit={handleSubmit}>
  <s-stack gap="base">
    <s-text-field
      name="email"
      label="Email"
      type="email"
      required
    />
    <s-password-field
      name="password"
      label="Password"
      required
    />
    <s-button type="submit" variant="primary">
      Sign in
    </s-button>
  </s-stack>
</form>
```

***

## Accessibility

Polaris web components are built with accessibility in mind. They:

* Use semantic HTML under the hood
* Support keyboard navigation
* Include proper ARIA attributes
* Manage focus appropriately
* Provide appropriate color contrast
* Log warnings when component properties are missing and required for accessibility

To ensure your application remains accessible, follow these best practices:

1. Always use the `label` and `error` properties for form elements
2. Use appropriate heading levels with `s-heading` or the `heading` property
3. Ensure sufficient color contrast
4. Test keyboard navigation
5. Use `labelAccessibilityVisibility` to hide labels and keep them visible to assistive technologies
6. Use `accessibilityRole` to specify the `aria-role` of the component

## Example

## JSX

```jsx
// Good - provides a label
<s-text-field label="Email address" />


// Bad - missing a label
<s-text-field placeholder="Enter email" />
```

***

## Troubleshooting

Common issues and debugging tips for using Polaris web components.

##### Common Issues

1. **Properties not updating**: Ensure you're using the property name as documented, not a different casing or naming convention.

2. **Event handlers not firing**: Check that you're using the correct event name (e.g., `onClick` for click events).

3. **Form values not being submitted**: Make sure your form elements have `name` attributes.

##### Debugging Tips

1. Inspect the element in your browser's developer tools to see the current property and attribute values.

2. Use `console.log` to verify that event handlers are being called and receiving the expected event objects.

3. Check for any errors in the browser console that might indicate issues with your component usage.

***
