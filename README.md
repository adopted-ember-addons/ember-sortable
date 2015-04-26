# Ember-sortable

[![npm version](https://badge.fury.io/js/ember-sortable.svg)](http://badge.fury.io/js/ember-sortable)
[![Ember Observer Score](http://emberobserver.com/badges/ember-sortable.svg)](http://emberobserver.com/addons/ember-sortable)
[![Build Status](https://travis-ci.org/jgwhite/ember-sortable.svg?branch=master)](https://travis-ci.org/jgwhite/ember-sortable)
[![Code Climate](https://codeclimate.com/github/jgwhite/ember-sortable/badges/gpa.svg)](https://codeclimate.com/github/jgwhite/ember-sortable)

Sortable UI primitives for Ember.

![ember-sortable in action](https://raw.githubusercontent.com/jgwhite/ember-sortable/master/demo.gif)

[Check out the demo](http://jgwhite.co.uk/ember-sortable/demo)

## Installation

```sh
$ ember install ember-sortable
```

## Usage

```hbs
{{#sortable-group tagName="ul" onChange="reorderItems" as |group|}}
  {{#each model.items as |item|}}
    {{#sortable-item tagName="li" model=item group=group}}
      {{item.name}}
    {{/sortable-item}}
  {{/each}}
{{/sortable-group}}
```

**Things to note:**

1. `sortable-group` and `sortable-item` do not mutate any data. Instead, a
   fresh array is passed with the `onChange` action (see below).
2. `sortable-group` yields itself and must be assigned to the `group` property
   of each sortable item (`group=group`).
3. `sortable-item` takes a `model` property which is handed back in
   `sortable-group`’s `onChange` action.

```js
actions: {
  reorderItems(newOrder) {
    this.set('currentModel.items', newOrder);
  }
}
```

## CSS

Ensure the parent element (the `ul` in our demo) has `position: relative`.

Two classes are applied during interaction:

- `is-dragging`
- `is-dropping`

Ember sortable will detect animation and wait accordingly before firing the
`onChange` action.

## Developing

```sh
$ git clone git@github.com:jgwhite/ember-sortable
$ cd ember-sortable
$ ember install
$ ember server
```

### Running Tests

```sh
$ ember test
```

### Building and publishing the demo

```sh
$ make demo
```
