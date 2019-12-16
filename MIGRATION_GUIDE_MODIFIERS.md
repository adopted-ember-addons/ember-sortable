# Ember-sortable

## Migration Guide (Components -> Modifiers)

To use modifieres, you must use angle-bracket syntax

### New Root component
1. Instead of using `sortable-group` as the root component, use `sortable`. This new root does not
generate a dom element `ol`. It does generates a `span` used for a11y, but your
content is not yielded within this `span`.

**Old Component**
```hbs
{{#sortable-group model=model.items onChange=(action "reorderItems") as |group|}}
  {{#each group.model as |item|}}
```
**New Component**
```hbs
<Sortable @model={{model.items}} @onChange={{action "reorderItems"}} as |group|>
  {{#each group.model as |item|}}
```

2. Each `item` can be represented by any dom element or component

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
<Sortable @model={{model.items}} @onChange={{action "reorderItems"}} as |sortable|>
  <ol>
    {{#each sortable.model as |item|}}
       <li {{sortable-item api=sortable.api model=item}}>
          {{tem.name}}
       </li>
    {{/each}}
  </ol>
</Sortable>
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
<Sortable @model={{model.items}} @onChange={{action "reorderItems"}} as |sortable|>
  <ol>
    {{#each sortable.model as |item|}}
       <li {{sortable-item api=sortable.api model=item}}>
          {{tem.name}}
          <span class="handle" {{sortable-handle api=sortable.api model=item}}>&varr;</span>
       </li>
    {{/each}}
  </ol>
</Sortable>
```

4. The modifier `sortable-group` only needs to be applied to get the a11y support. Because of this, the 
`a11yItemName`, `a11yAnnouncementConfig`, `itemVisualClass`, `handleVisualClass` have been moved to this
modifier.

```hbs
<Sortable @model={{model.items}} @onChange={{action "reorderItems"}} as |sortable|>
  <ol {{sortable-group api=sortable.api}}>
    {{#each sortable.model as |item|}}
       <li {{sortable-item api=sortable.api model=item a11yItemName=this.a11yItemName}}>
          {{tem.name}}
          <span class="handle" {{sortable-handle api=sortable.api model=item}}>&varr;</span>
       </li>
    {{/each}}
  </ol>
</Sortable>
```

