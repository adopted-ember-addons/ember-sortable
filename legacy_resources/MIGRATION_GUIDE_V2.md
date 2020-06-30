# Ember-sortable

## Migration Guide (v1 -> v2)

[High Order Components](#Higher Order Components) or [Modifiers](/MIGRATION_GUIDE_MODIFIERS.md)

### Higher Order Components
`Ember-sortable` can now be built using [higher order components](https://v4.chriskrycho.com/2018/higher-order-components-in-emberjs.html)

1. The array of models are now yielded out by `sortable-group`

**V1**
```hbs
{{#sortable-group onChange=(action "reorderItems") as |group|}}
  {{#each model.items as |item|}}
```
**V2**
```hbs
{{#sortable-group model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |item|}}
```

2. Each `item` can be represented by the yielded `sortable-item` instead of directly using `sortable-item` and passing the `group` manually.

**V1**
```hbs
{{#sortable-group onChange=(action "reorderItems") as |group|}}
  {{#each model.items as |item|}}
    {{#sortable-item model=item group=group handle=".handle"}}
      {{item.name}}
      <span class="handle">&varr;</span>
    {{/sortable-item}}
  {{/each}}
{{/sortable-group}}
```

**V2**
```hbs
{{#sortable-group model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |item|}}
    {{#group.item model=item}}
    ...
    {{/group.item}}
  {{/each}}
{{/sortable-group}}
```

3. It is recommended to use the yielded `sortable-handle` instead of referencing `handle` by `class`, as it guarantees accessibility support.

**V1**
```hbs
{{#sortable-group onChange=(action "reorderItems") as |group|}}
  {{#each model.items as |item|}}
    {{#sortable-item model=item group=group handle=".handle"}}
      {{item.name}}
      <span class="handle">&varr;</span>
    {{/sortable-item}}
  {{/each}}
{{/sortable-group}}
```

**V2**
```hbs
{{#sortable-group model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |modelItem|}}
    {{#group.item model=item as|item|}}
      {{modelItem.name}}
      {{#item.handle}}
        <span class="handle">&varr;</span>
      {{/item.handle}}
    {{/group.item}}
  {{/each}}
{{/sortable-group}}
```

4. `groupModel` is still supported via `groupModel` instead of `model`

**V1**
```hbs
{{#sortable-group model=model onChange=(action "reorderItems") as |group|}}
  {{#each model.items as |item|}}
  ...
{{/sortable-group}}
```

**V2**
```hbs
{{#sortable-group groupModel=model model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |item|}}
  ...
{{/sortable-group}}
```

### Modifiers

### Accessibility support
1. Keyboard navigation is built into `ember-sortable`.
2. `a11yItemName`, `a11yAnnouncementConfig`, `itemVisualClass`, `handleVisualClass` can be supplied to enhance the accessibility experience.
3. Refer to [Accessibility Section](/README.md#Accessibility) for more details.

```hbs
  {{#sortable-group a11yAnnouncementConfig=a11yAnnouncementConfig a11yItemName="spanish number" itemVisualClass=itemVisualClass handleVisualClass=handleVisualClass onChange=(action "update") model=model.items as |group|}}
```

### Testing
1. The `drag` and `reorder` test helpers are no longer global `async` helpers. They are now importable.

Refer to [Testing Section](/README.md#Testing) for more details.
