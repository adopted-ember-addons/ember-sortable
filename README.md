# Ember-sortable

[![npm version](https://badge.fury.io/js/ember-sortable.svg)](http://badge.fury.io/js/ember-sortable)
[![Ember Observer Score](http://emberobserver.com/badges/ember-sortable.svg)](http://emberobserver.com/addons/ember-sortable)
[![Build Status](https://travis-ci.org/jgwhite/ember-sortable.svg?branch=master)](https://travis-ci.org/jgwhite/ember-sortable)
[![Code Climate](https://codeclimate.com/github/jgwhite/ember-sortable/badges/gpa.svg)](https://codeclimate.com/github/jgwhite/ember-sortable)

Sortable UI primitives for Ember.

![ember-sortable in action](https://raw.githubusercontent.com/jgwhite/ember-sortable/master/demo.gif)

[Check out the demo](http://jgwhite.co.uk/ember-sortable/demo)

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

{{#sortable-group tagName="ul" onChange="reorderItems" as |group|}}
  {{#each model.items as |item|}}
    {{#sortable-item tagName="li" model=item group=group handle=".handle"}}
      {{item.name}}
      <span class="handle">&varr;</span>
    {{/sortable-item}}
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

When `model` is set on the `sortable-group`, the `onChange` action is called
with that group model as the first argument:

```hbs
{{! app/templates/my-route.hbs }}

{{#sortable-group tagName="ul" model=model onChange="reorderItems" as |group|}}
  {{#each model.items as |item|}}
    {{#sortable-item tagName="li" model=item group=group handle=".handle"}}
      {{item.name}}
      <span class="handle">&varr;</span>
    {{/sortable-item}}
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
{{#sortable-group direction="x" onChange="reorderItems" as |group|}}
```

### Changing spacing between currently dragged element and the rest of the group

When user starts to drag element, other elements jump back. Works both for the `x` and `y` direction option.

In `y` case: elements above current one jump up, and elements below current one - jump down.
In `x` case: elements before current one jump to the left, and elements after current one - jump to the right.

To change this property, define `spacing` on `sortable-item` (default is `0`):

```hbs
{{#sortable-item tagName="li" group=group spacing=15}}
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
  {{#sortable-item onDragStart="dragStarted" onDragStop="dragStopped" tagName="li" model=item group=group handle=".handle"}}
    {{item.name}}
    <span class="handle">&varr;</span>
  {{/sortable-item}}
```

### Data down, actions up

No data is mutated by `sortable-group` or `sortable-item`. In the spirit of “data down, actions up”, a fresh array containing the models from each item in their new order is sent via the group’s `onChange` action.

`sortable-group` yields itself to the block so that it may be assigned explicitly to each item’s `group` property.

Each item takes a `model` property. This should be fairly self-explanatory but it’s important to note that it doesn’t do anything with this object besides keeping a reference for later use in `onChange`.

## Testing

`ember-sortable` exposes some acceptance test helpers:

* [`drag`][drag]: Drags elements by an offset specified in pixels.
* [`reorder`][reorder]: Reorders elements to the specified state.

[drag]: addon/helpers/drag.js
[reorder]: addon/helpers/reorder.js

To include them in your application, import then in your `start-app.js`:

```js
// tests/helpers/start-app.js

import './ember-sortable/test-helpers';
```

## Developing

### Setup

```sh
$ git clone git@github.com:jgwhite/ember-sortable
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
