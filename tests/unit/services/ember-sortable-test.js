import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {isArray} from '@ember/array';

module('Unit | Service | ember-sortable', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.sortableService = this.owner.lookup('service:ember-sortable@ember-sortable');

    // While not truly a group modifier, the service just registers whatever object is passed
    this.groupModifier = {
      stuff: ""
    };

    // While not truly an item modifier, the service just registers whatever object is passed
    this.sortableItem = {
      itemStuff: ""
    };

    this.groupName = "GroupName";
    this.unregisteredGroupName = "UnregisteredName";
  });

  test('Registers/Deregisters a group', function(assert) {

    this.sortableService.registerGroup(this.groupName, this.groupModifier);
    let groupDef = this.sortableService.groups[this.groupName];

    assert.ok(groupDef.groupModifier === this.groupModifier);
    assert.ok(isArray(groupDef.items));

    this.sortableService.deregisterGroup("unregisteredGroupName");
    groupDef = this.sortableService.groups[this.groupName];
    // did not effect registered name
    assert.ok(groupDef.groupModifier === this.groupModifier);

    this.sortableService.deregisterGroup(this.groupName);
    groupDef = this.sortableService.groups[this.groupName];
    assert.ok(groupDef === undefined);

   });

  test('Registers/Deregisters an item', function(assert) {

    this.sortableService.registerItem(this.groupName, this.sortableItem);
    let groupDef = this.sortableService.fetchGroup(this.groupName);

    assert.ok(isArray(groupDef.items));
    assert.ok(groupDef.items.includes(this.sortableItem));

    this.sortableService.deregisterItem(this.unregisteredGroupName, this.sortableItem);
    groupDef = this.sortableService.fetchGroup(this.groupName);
    assert.ok(groupDef.items.includes(this.sortableItem));

    this.sortableService.deregisterItem(this.groupName, this.sortableItem);
    assert.ok(isArray(groupDef.items));
    assert.notOk(groupDef.items.includes(this.sortableItem));
  });

  test('Fetch a group', function(assert) {

    let groupDef = this.sortableService.fetchGroup(this.groupName);

    assert.ok(groupDef, "Creates a group if one is not previously registered");
    assert.ok(isArray(groupDef.items));

    let groupDef2 = this.sortableService.fetchGroup(this.groupName);
    assert.ok(groupDef === groupDef2, "Fetches the correct group is one exists");


  });

});
