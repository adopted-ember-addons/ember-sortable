# ember-sortable changelog



## v4.0.1 (2022-10-03)

#### :memo: Documentation
* [#480](https://github.com/adopted-ember-addons/ember-sortable/pull/480) fix type in modifier migration doc ([@nlfurniss](https://github.com/nlfurniss))
* [#475](https://github.com/adopted-ember-addons/ember-sortable/pull/475) Update CHANGELOG.md ([@sandstrom](https://github.com/sandstrom))

#### :house: Internal
* [#487](https://github.com/adopted-ember-addons/ember-sortable/pull/487) Resolve `ember-modifier.no-args-property` deprecation warnings ([@bertdeblock](https://github.com/bertdeblock))

#### Committers: 3
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- [@sandstrom](https://github.com/sandstrom)

## v4.0.0 (2022-05-16)

#### :boom: Breaking Change
* [#479](https://github.com/adopted-ember-addons/ember-sortable/pull/479) Drop node 12 and Ember 3.20 support ([@BnitoBzh](https://github.com/BnitoBzh))
* [#476](https://github.com/adopted-ember-addons/ember-sortable/pull/476) Update ember-modifier to 3.2.0 (drop Ember < 3.24) ([@BnitoBzh](https://github.com/BnitoBzh))

#### :rocket: Enhancement
* [#477](https://github.com/adopted-ember-addons/ember-sortable/pull/477) perf: avoid creating callbacks for the destructor ([@BnitoBzh](https://github.com/BnitoBzh))

#### :house: Internal
* [#478](https://github.com/adopted-ember-addons/ember-sortable/pull/478) chore: update release process to match adopted standards ([@knownasilya](https://github.com/knownasilya))

#### Committers: 3
- Ewan McDougall ([@mrloop](https://github.com/mrloop))
- Ilya Radchenko ([@knownasilya](https://github.com/knownasilya))
- [@BnitoBzh](https://github.com/BnitoBzh)

## v3.0.1 (2022-03-16)

#### :bug: Bug Fix
* [#461](https://github.com/adopted-ember-addons/ember-sortable/pull/461) bugfix: Ensure horizontal scrolling can go negative ([@snewcomer](https://github.com/snewcomer))

#### :memo: Documentation
* [#458](https://github.com/adopted-ember-addons/ember-sortable/pull/458) Fix README.md typo ([@charlesfries](https://github.com/charlesfries))

#### :house: Internal
* [#456](https://github.com/adopted-ember-addons/ember-sortable/pull/456) Upgrade `release-it` packages ([@alexlafroscia](https://github.com/alexlafroscia))
* [#446](https://github.com/adopted-ember-addons/ember-sortable/pull/446) Bump ember-test-selectors v6.0.0 ([@snewcomer](https://github.com/snewcomer))

#### Committers: 3
- Alex LaFroscia ([@alexlafroscia](https://github.com/alexlafroscia))
- Charles Fries ([@charlesfries](https://github.com/charlesfries))
- Scott Newcomer ([@snewcomer](https://github.com/snewcomer))

## v3.0.0 (2021-11-29)

#### :rocket: Enhancement
* [#450](https://github.com/adopted-ember-addons/ember-sortable/pull/450) Add CI testing scenarios ([@snewcomer](https://github.com/snewcomer))
* [#377](https://github.com/adopted-ember-addons/ember-sortable/pull/377) Removed the component version ([@cah-briangantzler](https://github.com/cah-briangantzler))
* [#447](https://github.com/adopted-ember-addons/ember-sortable/pull/447) [breaking]: support node 12 and above ([@snewcomer](https://github.com/snewcomer))

#### :house: Internal
* [#449](https://github.com/adopted-ember-addons/ember-sortable/pull/449) relax `@ember/render-modifiers` dependency ([@miguelcobain](https://github.com/miguelcobain))

#### Committers: 4
- Brian Gantzler ([@cah-briangantzler](https://github.com/cah-briangantzler))
- Dave Laird ([@kiwiupover](https://github.com/kiwiupover))
- Miguel Andrade ([@miguelcobain](https://github.com/miguelcobain))
- Scott Newcomer ([@snewcomer](https://github.com/snewcomer))

## v2.4.0 (2021-11-10)

#### :rocket: Enhancement

- [#445](https://github.com/adopted-ember-addons/ember-sortable/pull/445) Use direct imports from `@ember/runloop` ([@charlesfries](https://github.com/charlesfries))

#### Committers: 2

- Charles Fries ([@charlesfries](https://github.com/charlesfries))
- Faith Or ([@faith-or](https://github.com/faith-or))

* Merge pull request #430 from jacojoubert/refactor-disabled (364fc80)
* (51ea46f)
* Merge pull request #444 from snewcomer/sn/deprecate-components (b70d5cd)
* Deprecate use of components (ffbd488)
* Add deprecation warning for `isDraggingDisabled` (ad38e58)
* Reset sortable-item (cebbe62)
* Merge pull request #440 from ntnz/patch-2 (2cbc2b5)
* Merge branch 'master' into refactor-disabled (0f315a6)
* Merge branch 'master' into refactor-disabled (36aa312)
* Fix syntax issues in readme (d2f8cc9)
* Update README.md (c0e88e7)
* Add disabled argument to sortable-item (888dc5c)
* Add examples of disabled item (4db5107)

## v2.2.6 (2021-10-21)

#### :bug: Bug Fix

- [#439](https://github.com/adopted-ember-addons/ember-sortable/pull/439) Resolve this-property-fallback deprecation ([@rmachielse](https://github.com/rmachielse))
- [#434](https://github.com/adopted-ember-addons/ember-sortable/pull/434) Update ember-cli-babel to @7.26.6, update README example ([@charlesfries](https://github.com/charlesfries))

#### Committers: 4

- Charles Fries ([@charlesfries](https://github.com/charlesfries))
- Jaco Joubert ([@jacojoubert](https://github.com/jacojoubert))
- Richard Machielse ([@rmachielse](https://github.com/rmachielse))
- Scott Newcomer ([@snewcomer](https://github.com/snewcomer))

* updated yarn.lock (ca925fa)
* Fix deprecation warning `Importing from ember-test-waiters is deprecated` (#423) (f817c5d)
* Require ember-decorators-polyfill to be installed by client app (#425) (f901543)
* Set default values for itemVisualClass and a11yAnnouncementConfig (#424) (436b7ac)

* update yarn.lock (a18d3cb)
* bump ember-get-config to version using babel v7 (#416) (92dd9b9)

* Remove event.stopPropagation from focusOut (#413) (48fd3eb)

Must provide GITHUB_AUTH

Must provide GITHUB_AUTH

- Use a service to track group/item state (#361) (68c12b6)
- Correct typos in modifier examples (#365) (17ecd1d)
- fixes parentNode of null (#370) (#371) (87953ce)
- fixes handle when using modifiers (#349) (81320bd)
- Merge pull request #357 from alexabreu/patch-1 (b6f0b97)
- Bumping travis node to 10 (#358) (5360e49)
- Actually use `onDragStop` argument rather then re-using `onDragStart`. (88b9562)

## v2.2.0-beta.0 (2020-01-31)

#### :rocket: Enhancement

- [#345](https://github.com/adopted-ember-addons/ember-sortable/pull/345) Create a modifier version - Part 2 - more streamlined ([@cah-briangantzler](https://github.com/cah-briangantzler))

#### :house: Internal

- [#348](https://github.com/adopted-ember-addons/ember-sortable/pull/348) [Ember try] Adding 3.15 to list of scenarios ([@ygongdev](https://github.com/ygongdev))

#### Committers: 2

- Brian Gantzler ([@cah-briangantzler](https://github.com/cah-briangantzler))
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.1.3 (2020-01-29)

#### :bug: Bug Fix

- [#347](https://github.com/adopted-ember-addons/ember-sortable/pull/347) [BUGFIX] Fixes scrolling outside of an overflow container's boundaries resolves#346 ([@validkeys](https://github.com/validkeys))

#### Committers: 1

- Kyle Davis ([@validkeys](https://github.com/validkeys))

* Added check for transitionDuration to isAnimated (#343) (b0597db)

* [A11y enhancement] Adding role=button to sortable-handle (828cace)
* [Bugfix] Use deregisterItem instead of registerItem on destroy [Feature] Adding isDraggingDisabled flag to allow specifying a sortable-item to be non-sortable (29fc641)

## v2.1.0-beta.0 (2019-11-22)

#### :rocket: Enhancement

- [#335](https://github.com/adopted-ember-addons/ember-sortable/pull/335) Refactoring group into actions and pass actions instead ([@ygongdev](https://github.com/ygongdev))

#### :bug: Bug Fix

- [#335](https://github.com/adopted-ember-addons/ember-sortable/pull/335) Refactoring group into actions and pass actions instead ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal

- [#335](https://github.com/adopted-ember-addons/ember-sortable/pull/335) Refactoring group into actions and pass actions instead ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1

- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.6 (2019-11-19)

#### :rocket: Enhancement

- [#334](https://github.com/adopted-ember-addons/ember-sortable/pull/334) Updating README regarding polyfill breaking production build ([@ygongdev](https://github.com/ygongdev))

#### :bug: Bug Fix

- [#332](https://github.com/adopted-ember-addons/ember-sortable/pull/332) Mitigate vendor build error ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal

- [#332](https://github.com/adopted-ember-addons/ember-sortable/pull/332) Mitigate vendor build error ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1

- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.6-1 (2019-11-19)

#### :bug: Bug Fix

- [#331](https://github.com/adopted-ember-addons/ember-sortable/pull/331) Attempt to fix vendor on consuming again again haha ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal

- [#331](https://github.com/adopted-ember-addons/ember-sortable/pull/331) Attempt to fix vendor on consuming again again haha ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1

- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.6-0 (2019-11-19)

#### :bug: Bug Fix

- [#330](https://github.com/adopted-ember-addons/ember-sortable/pull/330) Attempt to fix vendor on consuming app again ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal

- [#330](https://github.com/adopted-ember-addons/ember-sortable/pull/330) Attempt to fix vendor on consuming app again ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1

- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.5 (2019-11-19)

#### :bug: Bug Fix

- [#329](https://github.com/adopted-ember-addons/ember-sortable/pull/329) Attempt to fix vendor on consuming app production build ([@ygongdev](https://github.com/ygongdev))
- [#328](https://github.com/adopted-ember-addons/ember-sortable/pull/328) Correcting test-support helper extraction ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal

- [#329](https://github.com/adopted-ember-addons/ember-sortable/pull/329) Attempt to fix vendor on consuming app production build ([@ygongdev](https://github.com/ygongdev))
- [#328](https://github.com/adopted-ember-addons/ember-sortable/pull/328) Correcting test-support helper extraction ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1

- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.4 (2019-11-19)

#### :bug: Bug Fix

- [#327](https://github.com/adopted-ember-addons/ember-sortable/pull/327) Adding ember-sortable to the yield scope ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal

- [#327](https://github.com/adopted-ember-addons/ember-sortable/pull/327) Adding ember-sortable to the yield scope ([@ygongdev](https://github.com/ygongdev))
- [#325](https://github.com/adopted-ember-addons/ember-sortable/pull/325) Adding nested model integration test ([@ygongdev](https://github.com/ygongdev))

#### Committers: 2

- Cory Forsyth ([@bantic](https://github.com/bantic))
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.3 (2019-11-10)

#### :rocket: Enhancement

- [#324](https://github.com/adopted-ember-addons/ember-sortable/pull/324) Removing @ember/jquery and updating tests ([@ygongdev](https://github.com/ygongdev))
- [#322](https://github.com/adopted-ember-addons/ember-sortable/pull/322) Deprecating volatile in favor of native getter and setter ([@ygongdev](https://github.com/ygongdev))
- [#321](https://github.com/adopted-ember-addons/ember-sortable/pull/321) Updated demo example and added a few more code docs ([@ygongdev](https://github.com/ygongdev))
- [#318](https://github.com/adopted-ember-addons/ember-sortable/pull/318) Update README.md ([@2hu12](https://github.com/2hu12))

#### :house: Internal

- [#324](https://github.com/adopted-ember-addons/ember-sortable/pull/324) Removing @ember/jquery and updating tests ([@ygongdev](https://github.com/ygongdev))
- [#322](https://github.com/adopted-ember-addons/ember-sortable/pull/322) Deprecating volatile in favor of native getter and setter ([@ygongdev](https://github.com/ygongdev))

#### Committers: 2

- 2hu ([@2hu12](https://github.com/2hu12))
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.2 (2019-11-08)

#### :rocket: Enhancement

- [#317](https://github.com/adopted-ember-addons/ember-sortable/pull/317) Bug fixes ([@ygongdev](https://github.com/ygongdev))

#### :bug: Bug Fix

- [#317](https://github.com/adopted-ember-addons/ember-sortable/pull/317) Bug fixes ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1

- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.1 (2019-10-31)

#### :bug: Bug Fix

- [#305](https://github.com/adopted-ember-addons/ember-sortable/pull/305) [Bugfix] ember-test-waiters ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1

- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## v2.0.0 (2019-10-31)

#### :rocket: Enhancement

- [#295](https://github.com/adopted-ember-addons/ember-sortable/pull/295) Updating README.md and adding migration guide ([@ygongdev](https://github.com/ygongdev))
- [#294](https://github.com/adopted-ember-addons/ember-sortable/pull/294) add aria-live announcement ([@ygongdev](https://github.com/ygongdev))
- [#293](https://github.com/adopted-ember-addons/ember-sortable/pull/293) Visual Indicators ([@ygongdev](https://github.com/ygongdev))
- [#290](https://github.com/adopted-ember-addons/ember-sortable/pull/290) Adding built-in keyboard support and focus management ([@ygongdev](https://github.com/ygongdev))
- [#289](https://github.com/adopted-ember-addons/ember-sortable/pull/289) Adding sortable-handle ([@ygongdev](https://github.com/ygongdev))
- [#287](https://github.com/adopted-ember-addons/ember-sortable/pull/287) Contextual components ([@ygongdev](https://github.com/ygongdev))
- [#282](https://github.com/adopted-ember-addons/ember-sortable/pull/282) Deprecating sendAction ([@ygongdev](https://github.com/ygongdev))
- [#271](https://github.com/adopted-ember-addons/ember-sortable/pull/271) Modernizing test suite ([@ygongdev](https://github.com/ygongdev))
- [#286](https://github.com/adopted-ember-addons/ember-sortable/pull/286) Removing matches polyfill from closest polyfill ([@ygongdev](https://github.com/ygongdev))
- [#280](https://github.com/adopted-ember-addons/ember-sortable/pull/280) Closest polyfill ([@ygongdev](https://github.com/ygongdev))

#### :bug: Bug Fix

- [#265](https://github.com/adopted-ember-addons/ember-sortable/pull/265) Properly convert ScrollContainer width and height to integers ([@benedikt](https://github.com/benedikt))

#### :house: Internal

- [#289](https://github.com/adopted-ember-addons/ember-sortable/pull/289) Adding sortable-handle ([@ygongdev](https://github.com/ygongdev))
- [#282](https://github.com/adopted-ember-addons/ember-sortable/pull/282) Deprecating sendAction ([@ygongdev](https://github.com/ygongdev))
- [#286](https://github.com/adopted-ember-addons/ember-sortable/pull/286) Removing matches polyfill from closest polyfill ([@ygongdev](https://github.com/ygongdev))
- [#280](https://github.com/adopted-ember-addons/ember-sortable/pull/280) Closest polyfill ([@ygongdev](https://github.com/ygongdev))

#### Committers: 2

- Benedikt Deicke ([@benedikt](https://github.com/benedikt))
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))

## 1.12.10 (2019-09-24)

#### :bug: Bug Fix

- [#275](https://github.com/adopted-ember-addons/ember-sortable/pull/275) [BUGFIX] fixes bug when sorting to the beginning of list ([@ryanholte](https://github.com/ryanholte))

#### :house: Internal

- [#268](https://github.com/adopted-ember-addons/ember-sortable/pull/268) Bump mixin-deep from 1.3.0 to 1.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#267](https://github.com/adopted-ember-addons/ember-sortable/pull/267) Bump eslint-utils from 1.3.1 to 1.4.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#258](https://github.com/adopted-ember-addons/ember-sortable/pull/258) First pass at upgrading to new QUnit syntax ([@nlfurniss](https://github.com/nlfurniss))

#### Committers: 4

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Ryan Holte ([@ryanholte](https://github.com/ryanholte))
- [@stephencattaneo](https://github.com/stephencattaneo)

## 1.12.9 (2019-06-11)

#### :rocket: Enhancement

- [#259](https://github.com/adopted-ember-addons/ember-sortable/pull/259) Expect native events instead of jQuery wrapped events ([@stephencattaneo](https://github.com/stephencattaneo))

#### Committers: 2

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- [@stephencattaneo](https://github.com/stephencattaneo)

## 1.12.8 (2019-05-22)

#### :bug: Bug Fix

- [#249](https://github.com/adopted-ember-addons/ember-sortable/pull/249) move @ember/jquery to devDependency ([@fran-worley](https://github.com/fran-worley))
- [#251](https://github.com/adopted-ember-addons/ember-sortable/pull/251) Add warning to polyfill `Element.closest()` ([@samhogg](https://github.com/samhogg))

#### :house: Internal

- [#245](https://github.com/adopted-ember-addons/ember-sortable/pull/245) Add Ember 2.8, 2.12 to testing. Test Node 8. ([@mixonic](https://github.com/mixonic))

#### Committers: 4

- Fran Worley ([@fran-worley](https://github.com/fran-worley))
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Matthew Beale ([@mixonic](https://github.com/mixonic))
- Sam Hogg ([@samhogg](https://github.com/samhogg))

## 1.12.7 (2019-04-24)

#### :bug: Bug Fix

- [#227](https://github.com/adopted-ember-addons/ember-sortable/pull/227) Tweak clientHeight calculation in drag helper ([@jgwhite](https://github.com/jgwhite))
- [#244](https://github.com/adopted-ember-addons/ember-sortable/pull/244) Fix subtle bug in sortable-item#thaw ([@jgwhite](https://github.com/jgwhite))
- [#242](https://github.com/adopted-ember-addons/ember-sortable/pull/242) Runloop tweaks ([@mixonic](https://github.com/mixonic))

#### Committers: 2

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Matthew Beale ([@mixonic](https://github.com/mixonic))

## 1.12.6 (2019-02-25)

#### :bug: Bug Fix

- [#236](https://github.com/adopted-ember-addons/ember-sortable/pull/236) getX and getY methods do provide now for non-wrapped events too (fixe… ([@froskos](https://github.com/froskos))

#### Committers: 2

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- [@froskos](https://github.com/froskos)

## 1.12.5 (2019-02-15)

#### :bug: Bug Fix

- [#229](https://github.com/adopted-ember-addons/ember-sortable/pull/229) inline `touch-action:none` not being properly applied ([@froskos](https://github.com/froskos))

#### :house: Internal

- [#228](https://github.com/adopted-ember-addons/ember-sortable/pull/228) Upgrade to 3.7.x family ([@jgwhite](https://github.com/jgwhite))

#### Committers: 2

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- [@froskos](https://github.com/froskos)

## 1.12.4 (2019-01-04)

#### :bug: Bug Fix

- [#224](https://github.com/adopted-ember-addons/ember-sortable/pull/224) [bugfix] default `dx` and `dy` to 0 for drag helper ([@fivetanley](https://github.com/fivetanley))
- [#223](https://github.com/adopted-ember-addons/ember-sortable/pull/223) fixes for Firefox ([@fivetanley](https://github.com/fivetanley))

#### Committers: 2

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Stanley Stuart ([@fivetanley](https://github.com/fivetanley))

## 1.12.3 (2018-12-19)

#### :bug: Bug Fix

- [#216](https://github.com/adopted-ember-addons/ember-sortable/pull/216) Fix incorrect ScrollContainer dimension calcs ([@nlfurniss](https://github.com/nlfurniss))
- [#220](https://github.com/adopted-ember-addons/ember-sortable/pull/220) replace window.releaseEvents with window.removeEventListener ([@fonkgoku](https://github.com/fonkgoku))
- [#221](https://github.com/adopted-ember-addons/ember-sortable/pull/221) Pass event to \_preventClickHandler ([@fonkgoku](https://github.com/fonkgoku))

#### Committers: 3

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Paul Csapak ([@fonkgoku](https://github.com/fonkgoku))

## 1.12.2 (2018-12-07)

#### :rocket: Enhancement

- [#212](https://github.com/adopted-ember-addons/ember-sortable/pull/212) Replace jQuery with vanilla JS ([@nlfurniss](https://github.com/nlfurniss))

#### :house: Internal

- [#214](https://github.com/adopted-ember-addons/ember-sortable/pull/214) add lerna changelog for generating changelogs ([@fivetanley](https://github.com/fivetanley))

#### Committers: 3

- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Stanley Stuart ([@fivetanley](https://github.com/fivetanley))
- Todd Evanoff ([@tevanoff](https://github.com/tevanoff))

# ember-sortable changelog

## 1.12.10 (2019-09-24)

#### :bug: Bug Fix

- [#275](https://github.com/adopted-ember-addons/ember-sortable/pull/275) [BUGFIX] fixes bug when sorting to the beginning of list ([@ryanholte](https://github.com/ryanholte))

#### :house: Internal

- [#268](https://github.com/adopted-ember-addons/ember-sortable/pull/268) Bump mixin-deep from 1.3.0 to 1.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#267](https://github.com/adopted-ember-addons/ember-sortable/pull/267) Bump eslint-utils from 1.3.1 to 1.4.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#258](https://github.com/adopted-ember-addons/ember-sortable/pull/258) First pass at upgrading to new QUnit syntax ([@nlfurniss](https://github.com/nlfurniss))

#### Committers: 2

- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Ryan Holte ([@ryanholte](https://github.com/ryanholte))
- [@dependabot](https://github.com/apps/dependabot)

## 1.12.9 (2019-06-11)

#### :rocket: Enhancement

- [#259](https://github.com/adopted-ember-addons/ember-sortable/pull/259) Expect native events instead of jQuery wrapped events ([@stephencattaneo](https://github.com/stephencattaneo))

#### Committers: 1

- [@stephencattaneo](https://github.com/stephencattaneo)

## 1.12.8 (2019-05-22)

#### :bug: Bug Fix

- [#249](https://github.com/adopted-ember-addons/ember-sortable/pull/249) move @ember/jquery to devDependency ([@fran-worley](https://github.com/fran-worley))
- [#251](https://github.com/adopted-ember-addons/ember-sortable/pull/251) Add warning to polyfill `Element.closest()` ([@samhogg](https://github.com/samhogg))

#### :house: Internal

- [#245](https://github.com/adopted-ember-addons/ember-sortable/pull/245) Add Ember 2.8, 2.12 to testing. Test Node 8. ([@mixonic](https://github.com/mixonic))

#### Committers: 3

- Fran Worley ([@fran-worley](https://github.com/fran-worley))
- Matthew Beale ([@mixonic](https://github.com/mixonic))
- Sam Hogg ([@samhogg](https://github.com/samhogg))

## 1.12.7 (2019-04-24)

#### :bug: Bug Fix

- [#227](https://github.com/adopted-ember-addons/ember-sortable/pull/227) Tweak clientHeight calculation in drag helper ([@jgwhite](https://github.com/jgwhite))
- [#244](https://github.com/adopted-ember-addons/ember-sortable/pull/244) Fix subtle bug in sortable-item#thaw ([@jgwhite](https://github.com/jgwhite))
- [#242](https://github.com/adopted-ember-addons/ember-sortable/pull/242) Runloop tweaks ([@mixonic](https://github.com/mixonic))

#### Committers: 2

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Matthew Beale ([@mixonic](https://github.com/mixonic))

## 1.12.6 (2019-02-25)

#### :bug: Bug Fix

- [#236](https://github.com/adopted-ember-addons/ember-sortable/pull/236) getX and getY methods do provide now for non-wrapped events too (fixe… ([@froskos](https://github.com/froskos))

#### Committers: 1

- [@froskos](https://github.com/froskos)

## 1.12.5 (2019-02-15)

#### :bug: Bug Fix

- [#229](https://github.com/adopted-ember-addons/ember-sortable/pull/229) inline `touch-action:none` not being properly applied ([@froskos](https://github.com/froskos))

#### :house: Internal

- [#228](https://github.com/adopted-ember-addons/ember-sortable/pull/228) Upgrade to 3.7.x family ([@jgwhite](https://github.com/jgwhite))

#### Committers: 2

- Jamie White ([@jgwhite](https://github.com/jgwhite))
- [@froskos](https://github.com/froskos)

## 1.12.4 (2019-01-03)

#### :bug: Bug Fix

- [#224](https://github.com/adopted-ember-addons/ember-sortable/pull/224) [bugfix] default `dx` and `dy` to 0 for drag helper ([@fivetanley](https://github.com/fivetanley))
- [#223](https://github.com/adopted-ember-addons/ember-sortable/pull/223) fixes for Firefox ([@fivetanley](https://github.com/fivetanley))

#### Committers: 1

- Stanley Stuart ([@fivetanley](https://github.com/fivetanley))

## 1.12.3 (2018-12-19)

#### :bug: Bug Fix

- [#216](https://github.com/adopted-ember-addons/ember-sortable/pull/216) Fix incorrect ScrollContainer dimension calcs ([@nlfurniss](https://github.com/nlfurniss))
- [#220](https://github.com/adopted-ember-addons/ember-sortable/pull/220) replace window.releaseEvents with window.removeEventListener ([@fonkgoku](https://github.com/fonkgoku))
- [#221](https://github.com/adopted-ember-addons/ember-sortable/pull/221) Pass event to \_preventClickHandler ([@fonkgoku](https://github.com/fonkgoku))

#### Committers: 2

- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Paul Csapak ([@fonkgoku](https://github.com/fonkgoku))

## 1.12.2 (2018-12-06)

#### :rocket: Enhancement

- [#212](https://github.com/adopted-ember-addons/ember-sortable/pull/212) Replace jQuery with vanilla JS ([@nlfurniss](https://github.com/nlfurniss))

#### :house: Internal

- [#214](https://github.com/adopted-ember-addons/ember-sortable/pull/214) add lerna changelog for generating changelogs ([@fivetanley](https://github.com/fivetanley))

#### Committers: 3

- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Stanley Stuart ([@fivetanley](https://github.com/fivetanley))
- Todd Evanoff ([@tevanoff](https://github.com/tevanoff))

### 1.12.1 (2018-11-16)

- [#209](https://github.com/adopted-ember-addons/ember-sortable/pull/209) Revert "Ember 3.5"

### 1.12.0 (2018-11-16)

- [#189](https://github.com/adopted-ember-addons/ember-sortable/pull/189) Fix travis node version [@acburdine](https://github.com/acburdine)
- [#188](https://github.com/adopted-ember-addons/ember-sortable/pull/188) Don't break if A extensions are not enabled [@btecu](https://github.com/btecu)
- [#190](https://github.com/adopted-ember-addons/ember-sortable/pull/190) set rootURL for tests [@jmar910](https://github.com/jmar910)
- [#206](https://github.com/adopted-ember-addons/ember-sortable/pull/206) Ember 3.5 [@jmar910](https://github.com/jmar910)
- [#200](https://github.com/adopted-ember-addons/ember-sortable/pull/200) Update links to use new owner [@raulb](https://github.com/raulb)
- [#203](https://github.com/adopted-ember-addons/ember-sortable/pull/203) Remove ember-invoke-action [@raulb](https://github.com/raulb)
- [#182](https://github.com/adopted-ember-addons/ember-sortable/pull/182) Updated README to include js example for accessibility [@alanwguo](https://github.com/alanwguo)
- [#185](https://github.com/adopted-ember-addons/ember-sortable/pull/185) docs: use action helper in more examples [@knownasilya](https://github.com/knownasilya)

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

### 1.0.0 (2015-05-13)

First stable release.
