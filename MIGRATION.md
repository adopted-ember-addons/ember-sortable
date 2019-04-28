# From 1.x to 2.x

Having this as an example:
```handlebars
{{#sortable-group as |group|}}
  {{#sortable-item group=group}}
    {{item}}
  {{/sortable-item}}
{{/sortable-group}}
```

You should do following steps:
1. Remove all `group=group` occurrences:
```diff
{{#sortable-group as |group|}}
-  {{#sortable-item group=group}}
+  {{#sortable-item}}
    {{item}}
  {{/sortable-item}}
{{/sortable-group}}
```
2. Use yielded `{{group.item}}` component instead of global `{{sortable-item}}`:
```diff
{{#sortable-group as |group|}}
-  {{#sortable-item}}
+  {{#group.item}}
    {{item}}
-  {{/sortable-item}}
+  {{/group.item}}
{{/sortable-group}}
```

Final code:
```handlebars
{{#sortable-group as |group|}}
  {{#group.item}}
    {{item}}
  {{/group.item}}
{{/sortable-group}}
```
