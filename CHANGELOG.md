# ember-sortable changelog

## 1.13.0 (2019-04-04)

#### :rocket: Enhancement
* [#238](https://github.com/heroku/ember-sortable/pull/238) {{sortable-item}} as сlosure component ([@H1D](https://github.com/H1D))

#### Committers: 1
- Artem Suschev ([@H1D](https://github.com/H1D))

## 1.12.6 (2019-02-25)

#### :bug: Bug Fix
* [#236](https://github.com/heroku/ember-sortable/pull/236) getX and getY methods do provide now for non-wrapped events too (fixe… ([@froskos](https://github.com/froskos))

#### Committers: 1
- [@froskos](https://github.com/froskos)

## 1.12.5 (2019-02-15)

#### :bug: Bug Fix
* [#229](https://github.com/heroku/ember-sortable/pull/229) inline `touch-action:none` not being properly applied ([@froskos](https://github.com/froskos))

#### :house: Internal
* [#228](https://github.com/heroku/ember-sortable/pull/228) Upgrade to 3.7.x family ([@jgwhite](https://github.com/jgwhite))

#### Committers: 2
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- [@froskos](https://github.com/froskos)

## 1.12.4 (2019-01-03)

#### :bug: Bug Fix
* [#224](https://github.com/heroku/ember-sortable/pull/224) [bugfix] default `dx` and `dy` to 0 for drag helper ([@fivetanley](https://github.com/fivetanley))
* [#223](https://github.com/heroku/ember-sortable/pull/223) fixes for Firefox ([@fivetanley](https://github.com/fivetanley))

#### Committers: 1
- Stanley Stuart ([@fivetanley](https://github.com/fivetanley))

## 1.12.3 (2018-12-19)

#### :bug: Bug Fix
* [#216](https://github.com/heroku/ember-sortable/pull/216) Fix incorrect ScrollContainer dimension calcs ([@nlfurniss](https://github.com/nlfurniss))
* [#220](https://github.com/heroku/ember-sortable/pull/220) replace window.releaseEvents with window.removeEventListener ([@fonkgoku](https://github.com/fonkgoku))
* [#221](https://github.com/heroku/ember-sortable/pull/221) Pass event to _preventClickHandler ([@fonkgoku](https://github.com/fonkgoku))

#### Committers: 2
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Paul Csapak ([@fonkgoku](https://github.com/fonkgoku))

## 1.12.2 (2018-12-06)

#### :rocket: Enhancement
* [#212](https://github.com/heroku/ember-sortable/pull/212) Replace jQuery with vanilla JS ([@nlfurniss](https://github.com/nlfurniss))

#### :house: Internal
* [#214](https://github.com/heroku/ember-sortable/pull/214) add lerna changelog for generating changelogs ([@fivetanley](https://github.com/fivetanley))

#### Committers: 3
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Stanley Stuart ([@fivetanley](https://github.com/fivetanley))
- Todd Evanoff ([@tevanoff](https://github.com/tevanoff))

### 1.12.1 (2018-11-16)

- [#209](https://github.com/heroku/ember-sortable/pull/209) Revert "Ember 3.5"

### 1.12.0 (2018-11-16)

- [#189](https://github.com/heroku/ember-sortable/pull/189) Fix travis node version [@acburdine](https://github.com/acburdine)
- [#188](https://github.com/heroku/ember-sortable/pull/188) Don't break if A extensions are not enabled [@btecu](https://github.com/btecu)
- [#190](https://github.com/heroku/ember-sortable/pull/190) set rootURL for tests [@jmar910](https://github.com/jmar910)
- [#206](https://github.com/heroku/ember-sortable/pull/206) Ember 3.5 [@jmar910](https://github.com/jmar910)
- [#200](https://github.com/heroku/ember-sortable/pull/200) Update links to use new owner [@raulb](https://github.com/raulb)
- [#203](https://github.com/heroku/ember-sortable/pull/203) Remove ember-invoke-action [@raulb](https://github.com/raulb)
- [#182](https://github.com/heroku/ember-sortable/pull/182) Updated README to include js example for accessibility [@alanwguo](https://github.com/alanwguo)
- [#185](https://github.com/heroku/ember-sortable/pull/185) docs: use action helper in more examples [@knownasilya](https://github.com/knownasilya)

### 1.11.2 (2018-02-23)

- [#172](https://github.com/jgwhite/ember-sortable/pull/172) Fix deprecation warnings for targetObject [@nlfurniss](https://github.com/nlfurniss)
- [#174](https://github.com/jgwhite/ember-sortable/pull/174) use yarn in tests too! [@Dhaulagiri](https://github.com/Dhaulagiri)
- [#175](https://github.com/jgwhite/ember-sortable/pull/175) remove ember-new-computed [@Dhaulagiri](https://github.com/Dhaulagiri)
- [#176](https://github.com/jgwhite/ember-sortable/pull/176) ember-cli-htmlbars 2.0.3 [@Dhaulagiri](https://github.com/Dhaulagiri)

### 1.11.1 (2018-02-20)

- [#162](https://github.com/jgwhite/ember-sortable/pull/162) Remove jquery event listener from component element [@jackson-dean](https://github.com/jackson-dean)

### 1.11.0 (2018-01-26)

- [#168](https://github.com/jgwhite/ember-sortable/pull/168) ember-cli-update to 2.18 [@Dhaulagiri](https://github.com/Dhaulagiri)

### 1.10.0 (2017-10-19)

- [#157](https://github.com/jgwhite/ember-sortable/pull/157) Add tabindex attribute binding [@hjdivad](https://github.com/hjdivad)
- [#156](https://github.com/jgwhite/ember-sortable/pull/156) fix for issue with transforms being left after drop [@shidel-dev](https://github.com/shidel-dev)
- [#151](https://github.com/jgwhite/ember-sortable/pull/151) Alias sortable direction to group [@feedbackfruits](https://github.com/feedbackfruits)
- [#150](https://github.com/jgwhite/ember-sortable/pull/150) Disable isDragging when element is destroyed [@nbibler](https://github.com/nbibler)
- [#140](https://github.com/jgwhite/ember-sortable/pull/140) make `_scrollOnEdges()` get `itemContainer` height dinamically [@marlosin](https://github.com/marlosin)

### 1.9.4 (2017-07-12)

- [#137](https://github.com/jgwhite/ember-sortable/pull/137) Add distance attribute to specify after what distance sorting should start [@mupkoo](https://github.com/mupkoo)

### 1.9.3 (2017-02-12)

- return preventDefault calls to touch event [@acburdine](https://github.com/acburdine)

### 1.9.2 (2017-02-12)

- [#131](https://github.com/jgwhite/ember-sortable/pull/131) prevent touch-actions on element or handle using css [@acburdine](https://github.com/acburdine)
- [#118](https://github.com/jgwhite/ember-sortable/pull/118) improve performance of dragging by throttling drag event using ember run [@estshy](https://github.com/estshy)

### 1.9.1 (2016-11-28)

- [#119](https://github.com/jgwhite/ember-sortable/pull/119) use document as the scroll parent if the body is the scroll parent [@tim-evans](https://github.com/tim-evans)
- [#120](https://github.com/jgwhite/ember-sortable/pull/120) add support for 'data-test-selector' attribute [@cspanring](https://github.com/cspanring)
- [#114](https://github.com/jgwhite/ember-sortable/pull/114) replace sendAction with ember-invoke-action [@acburdine](https://github.com/acburdine)

### 1.9.0 (2016-10-27)

- [#106](https://github.com/jgwhite/ember-sortable/pull/106) Fix test-helpers in ember-cli-qunit 3.0 [@omghax](https://github.com/omghax)
- [#104](https://github.com/jgwhite/ember-sortable/pull/104) Autoscroll while dragging sortable-items [@tim-evans](https://github.com/tim-evans)
- [#112](https://github.com/jgwhite/ember-sortable/pull/112) Remove event listeners on willDestroyElement [@tim-evans](https://github.com/tim-evans)
- [#107](https://github.com/jgwhite/ember-sortable/pull/107) Upgrade to ember-cli 2.9.1 [@jgwhite](https://github.com/jgwhite)
- [#111](https://github.com/jgwhite/ember-sortable/pull/111) Fix mixin unit tests [@acburdine](https://github.com/acburdine)
- [#102](https://github.com/jgwhite/ember-sortable/pull/102) Ember 2.7 update [@jgwhite](https://github.com/jgwhite)

### 1.8.2 (2016-08-05)

- [#100](https://github.com/jgwhite/ember-sortable/pull/100) Fix for dragging outside of ember-modal-dialog boundaries [@davelowensohn](https://github.com/davelowensohn)

### 1.8.1 (2016-03-10)

- [#87](https://github.com/jgwhite/ember-sortable/pull/90) Backfill triggerEvent in drag for Ember >= 2.5 [@jgwhite](https://github.com/jgwhite)

### 1.8.0 (2016-02-23)

- [#87](https://github.com/jgwhite/ember-sortable/pull/87) Introduce `spacing` property on sortable-item [@dianafa](https://github.com/dianafa)

### 1.7.0 (2016-02-04)

- [#82](https://github.com/jgwhite/ember-sortable/pull/82) Expose `drag` and `reorder` test helpers [@seanpdoyle](https://github.com/seanpdoyle)

### 1.6.3 (2016-01-06)

- [#78](https://github.com/jgwhite/ember-sortable/pull/78) Flush styles in reset and thaw [@jgwhite](https://github.com/jgwhite)
- [#77](https://github.com/jgwhite/ember-sortable/pull/77) Fix typos in example [@HeroicEric](https://github.com/HeroicEric)

### 1.6.2 (2015-10-22)

- [#64](https://github.com/jgwhite/ember-sortable/pull/64) Ignore right-click [@jgwhite](https://github.com/jgwhite)

### 1.6.1 (2015-09-18)

- [#58](https://github.com/jgwhite/ember-sortable/pull/58) Support scrolling while dragging [@eugeniodepalo](https://github.com/eugeniodepalo)

### 1.6.0 (2015-09-04)

- [#60](https://github.com/jgwhite/ember-sortable/pull/60) Add actions for `onDragStart` and `onDragStop` [@drapergeek](https://github.com/drapergeek)

### 1.5.3 (2015-08-26)

- [#56](https://github.com/jgwhite/ember-sortable/pull/56) Fix touch support [@jgwhite](https://github.com/jgwhite)

### 1.5.2 (2015-08-14)

- [#53](https://github.com/jgwhite/ember-sortable/pull/53) Out out damm deprecations [@rlivsey](https://github.com/rlivsey)

### 1.5.1 (2015-08-10)

- [#51](https://github.com/jgwhite/ember-sortable/pull/51) Distinguish between clicking and dragging an item [@opsb](https://github.com/opsb)

### 1.5.0 (2015-08-04)

- [#49](https://github.com/jgwhite/ember-sortable/pull/49) Pass draggedModel with onChange [@scottmessinger](https://github.com/scottmessinger) & [@mehulkar](https://github.com/mehulkar)

### 1.4.0 (2015-08-03)

- [#45](https://github.com/jgwhite/ember-sortable/pull/44) Add support for tables [@jgwhite](https://github.com/jgwhite)
- [#44](https://github.com/jgwhite/ember-sortable/pull/44) Refactor and cleanup [@jgwhite](https://github.com/jgwhite)

### 1.3.1 (2015-07-27)

- [#42](https://github.com/jgwhite/ember-sortable/pull/42) Call `_super` in `didInsertElement` [@jgwhite](https://github.com/jgwhite)

### 1.3.0 (2015-07-07)

- [#29](https://github.com/jgwhite/ember-sortable/pull/29) Add horizontal sorting [@igorrKurr](https://github.com/igorrKurr)
- [#35](https://github.com/jgwhite/ember-sortable/pull/35) Use `closest` vs `is` to support complex handles (e.g. SVG) [@rlivsey](https://github.com/rlivsey)

### 1.2.0 (2015-06-09)

- [#32](https://github.com/jgwhite/ember-sortable/pull/32) Upgrade ember-cli to 0.2.7 [@jgwhite](https://github.com/jgwhite)
- [#31](https://github.com/jgwhite/ember-sortable/pull/31) New computed syntax [@jmurphyau](https://github.com/jmurphyau)
- [#30](https://github.com/jgwhite/ember-sortable/pull/30) Add demo URL [@jmurphyau](https://github.com/jmurphyau)

### 1.1.0 (2015-05-18)

- [#28](https://github.com/jgwhite/ember-sortable/pull/28) Add `model` attr to `sortable-group` [@ujamer](https://github.com/ujamer)

### 1.0.0 (2015-05-13)

First stable release.
