# Ember-sortable

[![npm version](https://badge.fury.io/js/ember-sortable.svg)](http://badge.fury.io/js/ember-sortable)
[![Build Status](https://travis-ci.org/adopted-ember-addons/ember-sortable.svg?branch=master)](https://travis-ci.org/adopted-ember-addons/ember-sortable)
[![Downloads Weekly](https://img.shields.io/npm/dw/ember-sortable)](http://badge.fury.io/js/ember-sortable)
[![Ember Observer Score](http://emberobserver.com/badges/ember-sortable.svg)](http://emberobserver.com/addons/ember-sortable)
[![Code Climate](https://codeclimate.com/github/jgwhite/ember-sortable/badges/gpa.svg)](https://codeclimate.com/github/jgwhite/ember-sortable)

Sortable UI primitives for Ember.

![ember-sortable in action](/demo.gif)

[Check out the demo](https://adopted-ember-addons.github.io/ember-sortable/demo/)

## Migration
If you are migrating from `1.x.x` to `2.x.x`. Please read this [migration guide](/MIGRATION_GUIDE_V2.md).

## Requirements

Version 1.0 depends upon the availability of 2D CSS transforms.
Check [the matrix on caniuse.com](http://caniuse.com/#feat=transforms2d)
to see if your target browsers are compatible.

## Installation

```sh
$ ember install ember-sortable
```

## Usage

```hbs
{{! app/templates/my-route.hbs }}

{{#sortable-group model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |modelItem|}}
    {{#group.item model=modelItem as |item|}}
      {{modelItem.name}}
      {{#item.handle}}
        <span class="handle">&varr;</span>
      {{/item.handle}}
    {{/group.item}}
  {{/each}}
{{/sortable-group}}
```

The `onChange` action is called with two arguments:

- Your item models in their new order
- The model you just dragged

```js
// app/routes/my-route.js

export default Ember.Route.extend({
  actions: {
    reorderItems(itemModels, draggedModel) {
      this.set('currentModel.items', itemModels);
      this.set('currentModel.justDragged', draggedModel);
    }
  }
});
```

### Declaring a “group model”

When `groupModel` is set on the `sortable-group`, the `onChange` action is called
with that group model as the first argument:

```hbs
{{! app/templates/my-route.hbs }}

{{#sortable-group groupModel=model model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |modelItem|}}
    {{#group.item model=modelItem as |item|}}
      {{modelItem.name}}
      {{#item.handle}}
        <span class="handle">&varr;</span>
      {{/item.handle}}
    {{/group.item}}
  {{/each}}
{{/sortable-group}}
```

```js
// app/routes/my-route.js

export default Ember.Route.extend({
  actions: {
    reorderItems(groupModel, itemModels, draggedModel) {
      groupModel.set('items', itemModels);
    }
  }
});
```

### Changing sort direction

To change sort direction, define `direction` on `sortable-group` (default is `y`):

```hbs
{{#sortable-group direction="x" onChange=(action "reorderItems") as |group|}}
```

### Changing spacing between currently dragged element and the rest of the group

When user starts to drag element, other elements jump back. Works both for the `x` and `y` direction option.

In `y` case: elements above current one jump up, and elements below current one - jump down.
In `x` case: elements before current one jump to the left, and elements after current one - jump to the right.

To change this property, define `spacing` on `sortable-item` (default is `0`):

```hbs
{{#sortable-item tagName="li" spacing=15}}
```

### Changing the drag tolerance

`distance` attribute changes the tolerance, in pixels, for when sorting should start.
If specified, sorting will not start until after mouse is dragged beyond distance.
Can be used to allow for clicks on elements within a handle.

```hbs
{{#sortable-item distance=30}}
```

### CSS, Animation

Sortable items can be in one of three states: default, dragging, dropping.
The classes look like this:

```html
<!-- Default -->
<li class="sortable-item">...</li>
<!-- Dragging -->
<li class="sortable-item is-dragging">...</li>
<!-- Dropping -->
<li class="sortable-item is-dropping">...</li>
```

In our [example app.css](tests/dummy/app/styles/app.css) we apply a
transition of `.125s` in the default case:

```css
.sortable-item {
  transition: all .125s;
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

### Drag Actions

The `onDragStart` and `onDragStop` actions are available for the
`sortable-item`s. You can provide an action name to listen to these actions to
be notified when an item is being dragged or not.

When the action is called, the item's model will be provided as the only
argument.

```js
// app/routes/my-route.js

export default Ember.Route.extend({
  actions: {
    dragStarted(item) {
      console.log(`Item started dragging: ${item.get('name')}`);
    },
    dragStopped(item) {
      console.log(`Item stopped dragging: ${item.get('name')}`);
    }
  }
});
```

```hbs
  {{#sortable-item
    onDragStart=(action "dragStarted")
    onDragStop=(action "dragStopped")
    model=modelItem
    as |item|
  }}
    {{modelItem.name}}
    {{#item.handle}}
      <span class="handle">&varr;</span>
    {{/item.handle}}
  {{/sortable-item}}
```

### Data down, actions up

No data is mutated by `sortable-group` or `sortable-item`. In the spirit of “data down, actions up”, a fresh array containing the models from each item in their new order is sent via the group’s `onChange` action.

`sortable-group` yields itself to the block so that it may be assigned explicitly to each item’s `group` property.

Each item takes a `model` property. This should be fairly self-explanatory but it’s important to note that it doesn’t do anything with this object besides keeping a reference for later use in `onChange`.

### Accessibility
The `sortable-group` has support for the following accessibility functionality:

#### Built-in Functionalities

##### Semantic HTML
- `sortable-group`
  an ordered list, `ol`, by default.
- `sortable-item`
  a list item, `li`, by default.

##### Keyboard Navigation
There are 4 modes during keyboard navigation:
- **ACTIVATE**
  enables the keyboard navigation.
  Activate via  `ENTER/SPACE`
- **MOVE**
  enables item(s) to be moved up, down, left, or right based on `direction`.
  Activate via  `ARROW UP/DOWN/LEFT/RIGHT`
- **CONFIRM**
  submits the new sort order, invokes the `onChange` action.
  Activate via  `ENTER/SPACE`.
- **CANCEL**
  cancels the new sort order, reverts back to the old sort order.
  Activate via  `ESCAPE` or when `focus` is lost.

##### Focus Management
- When `focus` is on a `item` or `handle`, user can effectively select the `item` via `ENTER/SPACE`. This is the `ACTIVATE` mode.
- While `ACTIVATE`, the `focus` is locked on `sortable-group` container and will not be lost until `CONFIRM`, `CANCEL`, or `focus` is lost.

#### User configurable
##### Screen Reader
- **a11yItemName**
  a name for the item.
- **a11yAnnouncementConfig**
  a map of `action enums` to `functions` that takes the following `config`, which is exposed by `sortable-group`.
```javascript
a11yAnnounceConfig = {
  a11yItemName, // name associated with the name
  index, // 0-based
  maxLength, // length of the items
  direction, // x or y
  delta, // +1 means down or right, -1 means up or left
}
```
and returns a `string` constructed from the `config`.

**Example**
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
  This class will be added to the `sortable-item` during `ACTIVATE` and `MOVE` operations. This is needed to creating a `visual indicator` that mimics `focus` b/c the native `focus` is on the container.

## Testing

`ember-sortable` exposes some acceptance test helpers:

* [`drag`][drag]: Drags elements by an offset specified in pixels.
* [`reorder`][reorder]: Reorders elements to the specified state.

[drag]: addon/helpers/drag.js
[reorder]: addon/helpers/reorder.js

To include them in your application, you can import them:

```js
import { drag, reorder } from 'ember-sortable/test-helpers';
```

## Developing

### Setup

```sh
$ git clone git@github.com:adopted-ember-addons/ember-sortable
$ cd ember-sortable
$ ember install
```

### Dev Server

```sh
$ ember serve
```

### Running Tests

```sh
$ npm test
```

### Publishing Demo

```sh
$ make demo
```
