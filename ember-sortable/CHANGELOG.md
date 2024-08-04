
## v5.0.0 (2023-01-29)

#### :boom: Breaking Change
* [#511](https://github.com/adopted-ember-addons/ember-sortable/pull/511) test-support helpers are now all imported from `ember-sortable/test-support` ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#512](https://github.com/adopted-ember-addons/ember-sortable/pull/512) Move common dependencies to peer dependencies (ember-modifier, @ember/test-helpers, @ember/test-waiters). These dependencies must now be declared in the consuming app.  ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* [#510](https://github.com/adopted-ember-addons/ember-sortable/pull/510) Drop support for ember less than 3.28 ([@leoeuclids](https://github.com/leoeuclids))
* [#511](https://github.com/adopted-ember-addons/ember-sortable/pull/511) Drop support for ember-classic ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :rocket: Enhancement
* [#508](https://github.com/adopted-ember-addons/ember-sortable/pull/508) Convert addon to V2 ([@leoeuclids](https://github.com/leoeuclids))

#### :house: Internal
* [#497](https://github.com/adopted-ember-addons/ember-sortable/pull/497) Bump mout from 1.2.3 to 1.2.4 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 2
- Leo Euclides ([@leoeuclids](https://github.com/leoeuclids))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)


## v4.0.3 (2022-10-14)

#### :bug: Bug Fix
* [#485](https://github.com/adopted-ember-addons/ember-sortable/pull/485) when item is disabled, do not add event listeners ([@st-h](https://github.com/st-h))
* [#472](https://github.com/adopted-ember-addons/ember-sortable/pull/472) sortableGroup may be undefined ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* [#490](https://github.com/adopted-ember-addons/ember-sortable/pull/490) Bump parse-url from 6.0.0 to 6.0.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#491](https://github.com/adopted-ember-addons/ember-sortable/pull/491) Bump vm2 from 3.9.9 to 3.9.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#496](https://github.com/adopted-ember-addons/ember-sortable/pull/496) Bump terser from 5.13.1 to 5.15.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#494](https://github.com/adopted-ember-addons/ember-sortable/pull/494) Move test config to the dummy app ([@Windvis](https://github.com/Windvis))
* [#495](https://github.com/adopted-ember-addons/ember-sortable/pull/495) Use the `isTesting` macro ([@Windvis](https://github.com/Windvis))
* [#488](https://github.com/adopted-ember-addons/ember-sortable/pull/488) Remove unused dependencies ([@bertdeblock](https://github.com/bertdeblock))

#### Committers: 4
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))
- Steve ([@st-h](https://github.com/st-h))
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)


## v4.0.2 (2022-10-06)

#### :bug: Bug Fix
* [#493](https://github.com/adopted-ember-addons/ember-sortable/pull/493) fix: Handle element in sortable item should be the most recent ([@nicolechung](https://github.com/nicolechung))

#### Committers: 1
- nicole chung ([@nicolechung](https://github.com/nicolechung))


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
* [#469](https://github.com/adopted-ember-addons/ember-sortable/pull/469) Embroider support ([@mrloop](https://github.com/mrloop))

#### :memo: Documentation
* [#468](https://github.com/adopted-ember-addons/ember-sortable/pull/468) Fix README variable assignment syntax ([@mrloop](https://github.com/mrloop))

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
* [#377](https://github.com/adopted-ember-addons/ember-sortable/pull/377) Removed the component version ([@cah-brian-gantzler](https://github.com/cah-brian-gantzler))
* [#447](https://github.com/adopted-ember-addons/ember-sortable/pull/447) [breaking]: support node 12 and above ([@snewcomer](https://github.com/snewcomer))

#### :house: Internal
* [#449](https://github.com/adopted-ember-addons/ember-sortable/pull/449) relax `@ember/render-modifiers` dependency ([@miguelcobain](https://github.com/miguelcobain))
* [#453](https://github.com/adopted-ember-addons/ember-sortable/pull/453) Reworked tests to use Zero, One, Two, Three, Four ([@kiwiupover](https://github.com/kiwiupover))
* [#452](https://github.com/adopted-ember-addons/ember-sortable/pull/452) General updates to dependencies ([@snewcomer](https://github.com/snewcomer))

#### Committers: 4
- Brian Gantzler ([@cah-brian-gantzler](https://github.com/cah-brian-gantzler))
- Dave Laird ([@kiwiupover](https://github.com/kiwiupover))
- Miguel Andrade ([@miguelcobain](https://github.com/miguelcobain))
- Scott Newcomer ([@snewcomer](https://github.com/snewcomer))


## v2.4.0 (2021-11-10)

#### :rocket: Enhancement
* [#445](https://github.com/adopted-ember-addons/ember-sortable/pull/445) Use direct imports from `@ember/runloop` ([@charlesfries](https://github.com/charlesfries))

#### Committers: 2
- Charles Fries ([@charlesfries](https://github.com/charlesfries))
- Faith Or ([@faith-or](https://github.com/faith-or))


## v2.2.6 (2021-10-21)

#### :bug: Bug Fix
* [#439](https://github.com/adopted-ember-addons/ember-sortable/pull/439) Resolve this-property-fallback deprecation ([@rmachielse](https://github.com/rmachielse))
* [#434](https://github.com/adopted-ember-addons/ember-sortable/pull/434) Update ember-cli-babel to @7.26.6, update README example ([@charlesfries](https://github.com/charlesfries))

#### Committers: 4
- Charles Fries ([@charlesfries](https://github.com/charlesfries))
- Jaco Joubert ([@jacojoubert](https://github.com/jacojoubert))
- Richard Machielse ([@rmachielse](https://github.com/rmachielse))
- Scott Newcomer ([@snewcomer](https://github.com/snewcomer))


## v2.2.0-beta.0 (2020-01-31)

#### :rocket: Enhancement
* [#345](https://github.com/adopted-ember-addons/ember-sortable/pull/345) Create a modifier version - Part 2 - more streamlined ([@cah-brian-gantzler](https://github.com/cah-brian-gantzler))

#### :house: Internal
* [#348](https://github.com/adopted-ember-addons/ember-sortable/pull/348) [Ember try] Adding 3.15 to list of scenarios ([@ygongdev](https://github.com/ygongdev))

#### Committers: 2
- Brian Gantzler ([@cah-brian-gantzler](https://github.com/cah-brian-gantzler))
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.1.3 (2020-01-28)

#### :bug: Bug Fix
* [#347](https://github.com/adopted-ember-addons/ember-sortable/pull/347) [BUGFIX] Fixes scrolling outside of an overflow container's boundaries resolves#346 ([@validkeys](https://github.com/validkeys))

#### Committers: 1
- Kyle Davis ([@validkeys](https://github.com/validkeys))


## v2.1.0-beta.0 (2019-11-21)

#### :rocket: Enhancement
* [#335](https://github.com/adopted-ember-addons/ember-sortable/pull/335) Refactoring group into actions and pass actions instead ([@ygongdev](https://github.com/ygongdev))

#### :bug: Bug Fix
* [#335](https://github.com/adopted-ember-addons/ember-sortable/pull/335) Refactoring group into actions and pass actions instead ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal
* [#335](https://github.com/adopted-ember-addons/ember-sortable/pull/335) Refactoring group into actions and pass actions instead ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.6 (2019-11-19)

#### :rocket: Enhancement
* [#334](https://github.com/adopted-ember-addons/ember-sortable/pull/334) Updating README regarding polyfill breaking production build ([@ygongdev](https://github.com/ygongdev))

#### :bug: Bug Fix
* [#332](https://github.com/adopted-ember-addons/ember-sortable/pull/332) Mitigate vendor build error ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal
* [#332](https://github.com/adopted-ember-addons/ember-sortable/pull/332) Mitigate vendor build error ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.6-1 (2019-11-18)

#### :bug: Bug Fix
* [#331](https://github.com/adopted-ember-addons/ember-sortable/pull/331) Attempt to fix vendor on consuming again again haha ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal
* [#331](https://github.com/adopted-ember-addons/ember-sortable/pull/331) Attempt to fix vendor on consuming again again haha ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.6-0 (2019-11-18)

#### :bug: Bug Fix
* [#330](https://github.com/adopted-ember-addons/ember-sortable/pull/330) Attempt to fix vendor on consuming app again ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal
* [#330](https://github.com/adopted-ember-addons/ember-sortable/pull/330) Attempt to fix vendor on consuming app again ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.5 (2019-11-18)

#### :bug: Bug Fix
* [#329](https://github.com/adopted-ember-addons/ember-sortable/pull/329) Attempt to fix vendor on consuming app production build ([@ygongdev](https://github.com/ygongdev))
* [#328](https://github.com/adopted-ember-addons/ember-sortable/pull/328) Correcting test-support helper extraction ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal
* [#329](https://github.com/adopted-ember-addons/ember-sortable/pull/329) Attempt to fix vendor on consuming app production build ([@ygongdev](https://github.com/ygongdev))
* [#328](https://github.com/adopted-ember-addons/ember-sortable/pull/328) Correcting test-support helper extraction ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.4 (2019-11-18)

#### :bug: Bug Fix
* [#327](https://github.com/adopted-ember-addons/ember-sortable/pull/327) Adding ember-sortable to the yield scope ([@ygongdev](https://github.com/ygongdev))

#### :house: Internal
* [#327](https://github.com/adopted-ember-addons/ember-sortable/pull/327) Adding ember-sortable to the yield scope ([@ygongdev](https://github.com/ygongdev))
* [#325](https://github.com/adopted-ember-addons/ember-sortable/pull/325) Adding nested model integration test ([@ygongdev](https://github.com/ygongdev))

#### Committers: 2
- Cory Forsyth ([@bantic](https://github.com/bantic))
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.3 (2019-11-09)

#### :rocket: Enhancement
* [#324](https://github.com/adopted-ember-addons/ember-sortable/pull/324) Removing @ember/jquery and updating tests ([@ygongdev](https://github.com/ygongdev))
* [#322](https://github.com/adopted-ember-addons/ember-sortable/pull/322) Deprecating volatile in favor of native getter and setter ([@ygongdev](https://github.com/ygongdev))
* [#321](https://github.com/adopted-ember-addons/ember-sortable/pull/321) Updated demo example and added a few more code docs ([@ygongdev](https://github.com/ygongdev))
* [#318](https://github.com/adopted-ember-addons/ember-sortable/pull/318) Update README.md ([@2hu12](https://github.com/2hu12))

#### :house: Internal
* [#324](https://github.com/adopted-ember-addons/ember-sortable/pull/324) Removing @ember/jquery and updating tests ([@ygongdev](https://github.com/ygongdev))
* [#322](https://github.com/adopted-ember-addons/ember-sortable/pull/322) Deprecating volatile in favor of native getter and setter ([@ygongdev](https://github.com/ygongdev))

#### Committers: 2
- 2hu ([@2hu12](https://github.com/2hu12))
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.2 (2019-11-07)

#### :rocket: Enhancement
* [#317](https://github.com/adopted-ember-addons/ember-sortable/pull/317) Bug fixes ([@ygongdev](https://github.com/ygongdev))

#### :bug: Bug Fix
* [#317](https://github.com/adopted-ember-addons/ember-sortable/pull/317) Bug fixes ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.1 (2019-10-31)

#### :bug: Bug Fix
* [#305](https://github.com/adopted-ember-addons/ember-sortable/pull/305) [Bugfix] ember-test-waiters ([@ygongdev](https://github.com/ygongdev))

#### Committers: 1
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## v2.0.0 (2019-10-30)

#### :rocket: Enhancement
* [#295](https://github.com/adopted-ember-addons/ember-sortable/pull/295) Updating README.md and adding migration guide ([@ygongdev](https://github.com/ygongdev))
* [#294](https://github.com/adopted-ember-addons/ember-sortable/pull/294) add aria-live announcement ([@ygongdev](https://github.com/ygongdev))
* [#293](https://github.com/adopted-ember-addons/ember-sortable/pull/293) Visual Indicators ([@ygongdev](https://github.com/ygongdev))
* [#290](https://github.com/adopted-ember-addons/ember-sortable/pull/290) Adding built-in keyboard support and focus management ([@ygongdev](https://github.com/ygongdev))
* [#289](https://github.com/adopted-ember-addons/ember-sortable/pull/289) Adding sortable-handle ([@ygongdev](https://github.com/ygongdev))
* [#287](https://github.com/adopted-ember-addons/ember-sortable/pull/287) Contextual components ([@ygongdev](https://github.com/ygongdev))
* [#282](https://github.com/adopted-ember-addons/ember-sortable/pull/282) Deprecating sendAction ([@ygongdev](https://github.com/ygongdev))
* [#271](https://github.com/adopted-ember-addons/ember-sortable/pull/271) Modernizing test suite ([@ygongdev](https://github.com/ygongdev))
* [#286](https://github.com/adopted-ember-addons/ember-sortable/pull/286) Removing matches polyfill from closest polyfill ([@ygongdev](https://github.com/ygongdev))
* [#280](https://github.com/adopted-ember-addons/ember-sortable/pull/280) Closest polyfill ([@ygongdev](https://github.com/ygongdev))

#### :bug: Bug Fix
* [#265](https://github.com/adopted-ember-addons/ember-sortable/pull/265) Properly convert ScrollContainer width and height to integers ([@benedikt](https://github.com/benedikt))

#### :house: Internal
* [#289](https://github.com/adopted-ember-addons/ember-sortable/pull/289) Adding sortable-handle ([@ygongdev](https://github.com/ygongdev))
* [#282](https://github.com/adopted-ember-addons/ember-sortable/pull/282) Deprecating sendAction ([@ygongdev](https://github.com/ygongdev))
* [#286](https://github.com/adopted-ember-addons/ember-sortable/pull/286) Removing matches polyfill from closest polyfill ([@ygongdev](https://github.com/ygongdev))
* [#280](https://github.com/adopted-ember-addons/ember-sortable/pull/280) Closest polyfill ([@ygongdev](https://github.com/ygongdev))

#### Committers: 2
- Benedikt Deicke ([@benedikt](https://github.com/benedikt))
- Yicheng (Jerry) Gong ([@ygongdev](https://github.com/ygongdev))


## 1.12.10 (2019-09-24)

#### :bug: Bug Fix
* [#275](https://github.com/adopted-ember-addons/ember-sortable/pull/275) [BUGFIX] fixes bug when sorting to the beginning of list ([@ryanholte](https://github.com/ryanholte))

#### :house: Internal
* [#268](https://github.com/adopted-ember-addons/ember-sortable/pull/268) Bump mixin-deep from 1.3.0 to 1.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#267](https://github.com/adopted-ember-addons/ember-sortable/pull/267) Bump eslint-utils from 1.3.1 to 1.4.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#258](https://github.com/adopted-ember-addons/ember-sortable/pull/258) First pass at upgrading to new QUnit syntax ([@nlfurniss](https://github.com/nlfurniss))

#### Committers: 4
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Ryan Holte ([@ryanholte](https://github.com/ryanholte))
- [@stephencattaneo](https://github.com/stephencattaneo)


## 1.12.9 (2019-06-11)

#### :rocket: Enhancement
* [#259](https://github.com/adopted-ember-addons/ember-sortable/pull/259) Expect native events instead of jQuery wrapped events ([@stephencattaneo](https://github.com/stephencattaneo))

#### Committers: 2
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- [@stephencattaneo](https://github.com/stephencattaneo)


## 1.12.8 (2019-05-22)

#### :bug: Bug Fix
* [#249](https://github.com/adopted-ember-addons/ember-sortable/pull/249) move @ember/jquery to devDependency ([@fran-worley](https://github.com/fran-worley))
* [#251](https://github.com/adopted-ember-addons/ember-sortable/pull/251) Add warning to polyfill `Element.closest()` ([@samhogg](https://github.com/samhogg))

#### :house: Internal
* [#245](https://github.com/adopted-ember-addons/ember-sortable/pull/245) Add Ember 2.8, 2.12 to testing. Test Node 8. ([@mixonic](https://github.com/mixonic))

#### Committers: 4
- Fran Worley ([@fran-worley](https://github.com/fran-worley))
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Matthew Beale ([@mixonic](https://github.com/mixonic))
- Sam Hogg ([@samhogg](https://github.com/samhogg))


## 1.12.7 (2019-04-24)

#### :bug: Bug Fix
* [#227](https://github.com/adopted-ember-addons/ember-sortable/pull/227) Tweak clientHeight calculation in drag helper ([@jgwhite](https://github.com/jgwhite))
* [#244](https://github.com/adopted-ember-addons/ember-sortable/pull/244) Fix subtle bug in sortable-item#thaw ([@jgwhite](https://github.com/jgwhite))
* [#242](https://github.com/adopted-ember-addons/ember-sortable/pull/242) Runloop tweaks ([@mixonic](https://github.com/mixonic))

#### Committers: 2
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Matthew Beale ([@mixonic](https://github.com/mixonic))


## 1.12.6 (2019-02-25)

#### :bug: Bug Fix
* [#236](https://github.com/adopted-ember-addons/ember-sortable/pull/236) getX and getY methods do provide now for non-wrapped events too (fixe… ([@froskos](https://github.com/froskos))

#### Committers: 2
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- [@froskos](https://github.com/froskos)


## 1.12.5 (2019-02-15)

#### :bug: Bug Fix
* [#229](https://github.com/adopted-ember-addons/ember-sortable/pull/229) inline `touch-action:none` not being properly applied ([@froskos](https://github.com/froskos))

#### :house: Internal
* [#228](https://github.com/adopted-ember-addons/ember-sortable/pull/228) Upgrade to 3.7.x family ([@jgwhite](https://github.com/jgwhite))

#### Committers: 2
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- [@froskos](https://github.com/froskos)


## 1.12.4 (2019-01-04)

#### :bug: Bug Fix
* [#224](https://github.com/adopted-ember-addons/ember-sortable/pull/224) [bugfix] default `dx` and `dy` to 0 for drag helper ([@fivetanley](https://github.com/fivetanley))
* [#223](https://github.com/adopted-ember-addons/ember-sortable/pull/223) fixes for Firefox ([@fivetanley](https://github.com/fivetanley))

#### Committers: 2
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Stanley Stuart ([@fivetanley](https://github.com/fivetanley))


## 1.12.3 (2018-12-19)

#### :bug: Bug Fix
* [#216](https://github.com/adopted-ember-addons/ember-sortable/pull/216) Fix incorrect ScrollContainer dimension calcs ([@nlfurniss](https://github.com/nlfurniss))
* [#220](https://github.com/adopted-ember-addons/ember-sortable/pull/220) replace window.releaseEvents with window.removeEventListener ([@paulcpk](https://github.com/paulcpk))
* [#221](https://github.com/adopted-ember-addons/ember-sortable/pull/221) Pass event to _preventClickHandler ([@paulcpk](https://github.com/paulcpk))

#### Committers: 3
- Jamie White ([@jgwhite](https://github.com/jgwhite))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Paul Csapak ([@paulcpk](https://github.com/paulcpk))


## 1.12.2 (2018-12-07)

#### :rocket: Enhancement
* [#212](https://github.com/adopted-ember-addons/ember-sortable/pull/212) Replace jQuery with vanilla JS ([@nlfurniss](https://github.com/nlfurniss))

#### :house: Internal
* [#214](https://github.com/adopted-ember-addons/ember-sortable/pull/214) add lerna changelog for generating changelogs ([@fivetanley](https://github.com/fivetanley))

#### Committers: 3
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Stanley Stuart ([@fivetanley](https://github.com/fivetanley))
- Todd Evanoff ([@tevanoff](https://github.com/tevanoff))

