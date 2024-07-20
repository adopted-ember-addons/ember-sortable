# ember-sortable

[![npm version](https://badge.fury.io/js/ember-sortable.svg)](http://badge.fury.io/js/ember-sortable)
[![Build Status](https://github.com/adopted-ember-addons/ember-sortable/actions/workflows/ci.yml/badge.svg)](https://github.com/adopted-ember-addons/ember-sortable/actions?query=branch%3Amaster)
[![Downloads Weekly](https://img.shields.io/npm/dw/ember-sortable)](http://badge.fury.io/js/ember-sortable)
[![Ember Observer Score](http://emberobserver.com/badges/ember-sortable.svg)](http://emberobserver.com/addons/ember-sortable)
[![Code Climate](https://codeclimate.com/github/jgwhite/ember-sortable/badges/gpa.svg)](https://codeclimate.com/github/jgwhite/ember-sortable)

Sortable UI primitives for Ember.

[Check out the demo](https://ember-sortable.netlify.app/)

## Requirements

| Ember Sortable | Ember | Node |
|----------------|-------|------|
| 3.0.0          | 3.24+ | 12+  |
| 4.0.0          | 3.24+ | 14+  |
| 5.0.0          | 3.28+ | n/a[^1]  |

[^1]: Node is not relevant for v2 addons. As of v5.0.0, ember-sortable is a v2 addon. V2 addons don't have to be for browser-only contexts, but ember-sortable is -- so node is not relevant anymore. This is different from v1 addons, which are not browser libraries, but node programs that happen emit browser code to the consuming app at app-build time.

## Installation

```sh
$ ember install ember-sortable
```

## Usage

```hbs
{{! app/components/my-list/template.hbs }}

<ol {{sortable-group onChange=this.reorderItems}}>
  {{#each this.items as |item|}}
    <li {{sortable-item model=item}}>
      {{item}}
      <span class='handle' {{sortable-handle}}>&varr;</span>
    </li>
  {{/each}}
</ol>

<p>The last dragged item was: {{this.lastDragged}}</p>
```

The `onChange` action is called with two arguments:

- Your item models in their new order
- The model you just dragged

```js
// app/components/my-list/component.js

export default class MyList extends Component {
  @tracked lastDragged;
  @tracked items = ['Coal Ila', 'Askaig', 'Bowmore'];

  @action
  reorderItems(itemModels, draggedModel) {
    this.items = itemModels;
    this.lastDragged = draggedModel;
  }
}
```

The modifier version does not support `groupModel`, use the currying of `action` or the `fn` helper.

```hbs
{{! app/components/my-list/template.hbs }}

<ol {{sortable-group onChange=(fn this.reorderItems model)}}>
  {{#each this.items as |item|}}
    <li {{sortable-item model=item}}>
      {{item}}
      <span class='handle' {{sortable-handle}}>&varr;</span>
    </li>
  {{/each}}
</ol>
```

### Changing sort direction

To change sort direction, define `direction` on `sortable-group`
Possible values are:
- `y` (default): allowes to move items up/down
- `x`: allowes to move items left/right
- `grid`: items can be moved in all directions inside a group

```hbs
<ol {{sortable-group direction="x" onChange=this.reorderItems}>
```

### Changing spacing between currently dragged element and the rest of the group

When user starts to drag element, other elements jump back. Works for all direction option.

In `y` case: elements above current one jump up, and elements below current one - jump down.
In `x` / `grid` case: elements before current one jump to the left, and elements after current one - jump to the right.

To change this property, define `spacing` on `sortable-item` (default is `0`):

```hbs
<li {{sortable-item spacing=15}}>
```

### Changing the drag tolerance

`distance` attribute changes the tolerance, in pixels, for when sorting should start.
If specified, sorting will not start until after mouse is dragged beyond distance.
Can be used to allow for clicks on elements within a handle.

```hbs
<li {{sortable-item distance=30}}>
```

### Disabling reordering

The `disabled` attribute allows you to disable sorting for the entire group and its child items.

```hbs
<li {{sortable-group disabled=true}}>
```

### CSS, Animation

Sortable items can be in one of four states: default, dragging, dropping, and activated.
The classes look like this:

```html
<!-- Default -->
<li class="sortable-item">...</li>
<!-- Dragging -->
<li class="sortable-item is-dragging">...</li>
<!-- Dropping -->
<li class="sortable-item is-dropping">...</li>
<!-- Keyboard -->
<li class="sortable-item is-activated">...</li>
```

In our [example app.css](docs/app/styles/app.css) we apply a
transition of `.125s` in the default case:

```css
.sortable-item {
  transition: all 0.125s;
}
```

While an item is dragging we want it to move pixel-for-pixel with the
user’s mouse so we bring the transition duration to 0. We also give
it a highlight color and bring it to the top of the stack:

```css
.sortable-item.is-dragging {
  transition-duration: 0s;
  background: red;
  z-index: 10;
}
```

While dropping, the `is-dragging` class is removed and the item returns to its default transition duration. If we wanted to apply a
different duration we could do so with the `is-dropping` class. In
our example we opt to simply maintain the z-index and apply a
slightly different colour:

```css
.sortable-item.is-dropping {
  background: #f66;
  z-index: 10;
}
```

If the user presses space to activate and move an item via the keyboard, `is-activated` is added. Once the user drops the item it is
removed. Use this class to add a visual indicator that the item is selected and being manipulated.

### Drag Actions

The `onDragStart` and `onDragStop` actions are available for the
`sortable-item`s. You can provide an action to listen to these actions to
be notified when an item is being dragged or not.

When the action is called, the item's model will be provided as the only
argument.

```js
// app/components/my-list/component.js

export default class MyRoute extends Route {
  @action
  dragStarted(item) {
    console.log(`Item started dragging: ${item}`);
  },
  @action
  dragStopped(item) {
    console.log(`Item stopped dragging: ${item}`);
  }
}
```

```hbs
<li {{sortable-item onDragStart=this.dragStarted onDragStop=this.dragStopped model=item}}>
  {{item}}
  <span class='handle' {{sortable-handle}}>&varr;</span>
</li>
```

### Multiple Ember-Sortables renders simultaneously

There is a service behind the scenes for communication between the group and the items and to maintain state. It does this seemlessly when the elements are rendered on the screen. However, if there are two sortables rendered at the same time, either in the same component or different components, the state management does not know which items belong to which group.

Both the `{{sortable-group}}` and `{{sortable-item}}` take an additional argument `groupName`. Should you encounter this conflict, assign a `groupName` to the group and items. You only need to do this for one of the sortables in conflict, but you can on both if you wish.

```hbs
<ol {{sortable-group groupName='products' onChange=this.reorderItems}}>
  {{#each this.items as |item|}}
    <li {{sortable-item groupName='products' model=item}}>
      {{item}}
      <span class='handle' {{sortable-handle}}>&varr;</span>
    </li>
  {{/each}}
</ol>
```

Ensure that the same name is passed to both the group and the items, this would be best accomplished by creating property on the component and referring to that property. If you are able to use the `{{#let}}` helper (useful in template only components), using `{{#let}}` makes the usage clearer.

```hbs
{{#let 'products' as |myGroupName|}}
  <ol {{sortable-group groupName=myGroupName onChange=this.reorderItems}}>
    {{#each this.items as |item|}}
      <li {{sortable-item groupName=myGroupName model=item}}>
        {{item}}
        <span class='handle' {{sortable-handle}}>&varr;</span>
      </li>
    {{/each}}
  </ol>
{{/let}}
```

### Disabling Drag (Experimental)

`sortable-item` exposes an optional `disabled` (previously `isDraggingDisabled`) flag that you can use to disable reordering for that particular item. Disabling and item won't prevent it from changing position in the array. The user can still move other non-disabled items to over it.

This flag is intended as an utility to make your life easier with 3 main benefits:

1. You can now specify which `sortable-item` are not intended to be draggable/sortable.
2. You do not have to duplicate the `sortable-item` UI just for the purpose of disabling the `sorting` behavior.
3. Allows you to access the entire list of `models` for your `onChange` action, which can now be a mix of sortable and non-sortable items.

### Data down, actions up

No data is mutated by `sortable-group` or `sortable-item`. In the spirit of “data down, actions up”, a fresh array containing the models from each item in their new order is sent via the group’s `onChange` action.

Each item takes a `model` property. This should be fairly self-explanatory but it’s important to note that it doesn’t do anything with this object besides keeping a reference for later use in `onChange`.

### Accessibility

The `sortable-group` has support for the following accessibility functionality:

#### Built-in Functionalities

##### Keyboard Navigation

There are 4 modes during keyboard navigation:

- **ACTIVATE**
  enables the keyboard navigation.
  Activate via `ENTER/SPACE`
- **MOVE**
  enables item(s) to be moved up, down, left, or right based on `direction`.
  Activate via `ARROW UP/DOWN/LEFT/RIGHT`
- **CONFIRM**
  submits the new sort order, invokes the `onChange` action.
  Activate via `ENTER/SPACE`.
- **CANCEL**
  cancels the new sort order, reverts back to the old sort order.
  Activate via `ESCAPE` or when `focus` is lost.

##### Focus Management

- When `focus` is on a `item` or `handle`, user can effectively select the `item` via `ENTER/SPACE`. This is the `ACTIVATE` mode.
- While `ACTIVATE`, the `focus` is locked on `sortable-group` container and will not be lost until `CONFIRM`, `CANCEL`, or `focus` is lost.

#### User configurable

##### Screen Reader

The default language for `ember-sortable` is English. Any language can be supported by passing in the configuration below in the appropriate language.

- **a11yItemName**
  a name for the item. Defaults to `item`.
- **a11yAnnouncementConfig**
  a map of `action enums` to `functions` that takes the following `config`, which is exposed by `sortable-group`.

```javascript
a11yAnnounceConfig = {
  a11yItemName, // name associated with the name
  index, // 0-based
  maxLength, // length of the items
  direction, // x or y
  delta, // +1 means down or right, -1 means up or left
};
```

and returns a `string` constructed from the `config`.

**Default value**

```javascript
{
  ACTIVATE: function({ a11yItemName, index, maxLength, direction }) {
    let message = `${a11yItemName} at position, ${index + 1} of ${maxLength}, is activated to be repositioned.`;
    if (direction === 'y') {
      message += 'Press up and down keys to change position,';
    } else {
      message += 'Press left and right keys to change position,';
    }

    message += ' Space to confirm new position, Escape to cancel.';

    return message;
  },
  MOVE: function({ a11yItemName, index, maxLength, delta }) {
    return `${a11yItemName} is moved to position, ${index + 1 + delta} of ${maxLength}. Press Space to confirm new position, Escape to cancel.`;
  },
  CONFIRM: function({ a11yItemName}) {
    return `${a11yItemName} is successfully repositioned.`;
  },
  CANCEL: function({ a11yItemName }) {
    return `Cancelling ${a11yItemName} repositioning`;
  }
}
```

##### Visual Indicator

- **handleVisualClass**
  This class will be added to the `sortable-handle` during `ACTIVATE` and `MOVE` operations. This allows you to add custom styles such as `visual arrows` via `pseudo` classes.

- **itemVisualClass**
  This class will be added to the `sortable-item` during `ACTIVATE` and `MOVE` operations. The default class added is `is-activated`. This is needed to creating a `visual indicator` that mimics `focus` b/c the native `focus` is on the container.

## Testing

`ember-sortable` exposes some acceptance test helpers:

- [`drag`][drag]: Drags elements by an offset specified in pixels.
- [`reorder`][reorder]: Reorders elements to the specified state.
- [`keyboard`][keyboard]: Keycode constants for quick.

[drag]: addon/src/test-support/helpers/drag.js
[reorder]: addon/src/test-support/helpers/reorder.js
[keyboard]: addon/src/test-support/utils/kebyoard.js

To include them in your application, you can import them:

```js
import { 
  drag, reorder,
  ENTER_KEY_CODE,
  SPACE_KEY_CODE,
  ESCAPE_KEY_CODE,
  ARROW_KEY_CODES,
} from 'ember-sortable/test-support';
```

### Examples

`Reorder`

```js
await reorder('mouse', '[data-test-vertical-demo-handle]', ...order);
```

`Drag`

```js
await drag('mouse', '[data-test-scrollable-demo-handle] .handle', () => {
  return { dy: itemHeight() * 2 + 1, dx: undefined };
});
```

`Keyboard`

```js
await triggerKeyEvent('[data-test-vertical-demo-handle]', 'keydown', ENTER_KEY_CODE);
```

## Migrating

### v3 -> v4

None, just make sure Node v14+ and Ember is v3.24+. Although older versions might work, but are no longer tested against. Specifically ember-modifier dropped support for older versions of Ember.

### v2 -> v3

The component versions have been removed and you must use the modifier.
The modifier version does not support `groupModel`, use the currying of the `fn` helper.

### v1 -> v2

If you are migrating from `1.x.x` to `2.x.x`,
For components, please read this [migration guide](/MIGRATION_GUIDE_V2.md).
For modifiers, please read this [migration guide](/MIGRATION_GUIDE_MODIFIERS.md).

## Developing

### Requirement

You need to install nodejs and [pnpm](https://pnpm.io/installation)
The specific versions you need, you can find [here](package.json#L19-L22)

### Setup

```sh
$ git clone git@github.com:adopted-ember-addons/ember-sortable
$ pnpm install
```

### Dev Server

```sh
$ cd test-app
$ ember serve
```

### Running Tests

```sh
$ pnpm run test
```

### Publishing Demo

```sh
$ make demo
```
