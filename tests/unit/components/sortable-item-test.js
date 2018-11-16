import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import SortableItem from 'ember-sortable/components/sortable-item'
import { run } from '@ember/runloop'
import hbs from 'htmlbars-inline-precompile';

module('sortable-item', function(hooks) {
  setupRenderingTest(hooks);

  let subject
  hooks.beforeEach(async function() {
    await run(async () => {
      this.owner.unregister('component:sortable-item')
      this.owner.register('component:sortable-item', SortableItem.extend({
        didInsertElement() {
          this._super()
          subject = this
        }
      }))
      await render(hbs`{{sortable-item}}`)
    })
  })

  test('it renders', function(assert) {
    assert.expect(2);

    // Sorry for the hacky test here
    // Creates the component instance
    var component = this.owner.factoryFor('component:sortable-item').create();
    assert.equal(component._state, 'preRender');

    // Renders the component to the page
    // this.render();
    assert.equal(subject._state, 'inDOM');
  });

  test('renders data-test-selector', function(assert) {
    let component = this.owner.factoryFor('component:sortable-item').create();

    assert.ok(component.get('attributeBindings').indexOf('data-test-selector') > -1,
      'support data-test-selector attribute binding');
  });
});
