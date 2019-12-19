# Ember-sortable

## Migration Guide (Components -> Modifiers)

To use modifiers, you must use angle-bracket syntax

### New Root component
1. Instead of using `sortable-group` as a component, use `sortable-group` as a modifier 
any element. You no longer need to tell `sortable-group` about the models, so the `each`
uses the models directly.

**Old Component**
```hbs
{{#sortable-group model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |item|}}
```
**New Component**
```hbs
<ol {{sortable-group onChange=(action "reorderItems")}}>
  {{#each model.items as |item|}}
```

2. Each `item` can be represented by any dom element or component using angle-bracket syntax

**Old Component**
```hbs
{{#sortable-group model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |item|}}
    {{#group.item model=item}}
       {{tem.name}}
    {{/group.item}}
  {{/each}}
{{/sortable-group}}
```

**New Component with modifier**
```hbs
<ol {{sortable-group onChange=(action "reorderItems")}}>
  {{#each model.items as |item|}}
    <li {{sortable-item model=item}}>
      {{tem.name}}
    </li>
  {{/each}}
</ol>
```

3. The Handle is also any element with a `sortable-handle` applied to it.

**Old Component**
```hbs
{{#sortable-group model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |modelItem|}}
    {{#group.item model=modelItem as|item|}}
      {{modelItem.name}}
      {{#item.handle}}
        <span class="handle">&varr;</span>
      {{/item.handle}}
    {{/group.item}}
  {{/each}}
{{/sortable-group}}
```

**New Component with modifier**
```hbs
<ol {{sortable-group onChange=(action "reorderItems")}}>
  {{#each model.items as |item|}}
    <li {{sortable-item model=item}}>
      {{tem.name}}
      <span class="handle" {{sortable-handle}}>&varr;</span>
    </li>
  {{/each}}
</ol>
```

4. The modifier `groupModel` property is no longer supported. The equivalent can 
be accomplished by the `action` helper or the new `fn` helper.

```hbs
<ol {{sortable-group onChange=(action "reorderItems" model)}}>
  {{#each model.items as |item|}}
    <li {{sortable-item model=item}}>
      {{tem.name}}
      <span class="handle" {{sortable-handle}}>&varr;</span>
    </li>
  {{/each}}
</ol>
```

