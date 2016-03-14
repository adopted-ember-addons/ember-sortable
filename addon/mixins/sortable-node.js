import Ember from 'ember';
import SortableManager from '../utils/sortable-manager';
const { Mixin } = Ember;

/**
  @class SortableNode
  @constructor
*/
export default Mixin.create({

  classNameBindings: ['sortableState'],

  /**
    @property sortableModel
    @type Any
    @default null
  */
  sortableModel: null,

  /**
    @property sortableParent
    @type SortableNode|null
    @default null
  */
  sortableParent: null,

  /**
    @property sortableChildren
    @type Array
    @default []
  */
  sortableChildren: null,

  /**
    @constructor
  */
  init() {
    this._super(...arguments);

    if (this.sortableParent) {
      this.sortableParent.sortableChildren.push(this);
    }

    this.sortableChildren = [];
  },

  /**
    @method willDestroy
  */
  willDestroy() {
    this._super(...arguments);

    delete this.sortableParent;
    delete this.sortableChildren;
  },

  /**
    @method touchStart
    @param {jQuery.Event} event
  */
  touchStart(event) {
    this._super(...arguments);

    event.stopPropagation();

    this._sortableStart(event);
  },

  /**
    @method mouseDown
    @param {jQuery.Event} event
  */
  mouseDown(event) {
    this._super(...arguments);

    if (event.which !== 1) { return; }
    if (event.ctrlKey) { return; }

    event.stopPropagation();

    this._sortableStart(event);
  },

  /**
    @private
    @method _sortableStart
    @param {jQuery.Event} event
  */
  _sortableStart({ originalEvent }) {
    if (this._sortableManager) { return; }

    this._sortableManager = new SortableManager({
      node: this,
      onComplete: () => delete this._sortableManager
    });

    this._sortableManager.start(originalEvent);
  }

});
