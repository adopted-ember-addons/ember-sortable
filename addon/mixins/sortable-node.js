import Ember from 'ember';
import SortableManager from '../utils/sortable-manager';
const { A, Mixin } = Ember;

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

    this.sortableChildren = A();

    if (this.sortableParent) {
      this.sortableParent.addSortableChild(this);
    }
  },

  /**
    @method willDestroy
  */
  willDestroy() {
    this._super(...arguments);

    if (this.sortableParent) {
      this.sortableParent.removeSortableChild(this);
      delete this.sortableParent;
    }
  },

  /**
    @private
    @method addSortableChild
    @param {SortableNode} child
  */
  addSortableChild(child) {
    this.sortableChildren.addObject(child);
  },

  /**
    @private
    @method removeSortableChild
    @param {SortableNode} child
  */
  removeSortableChild(child) {
    this.sortableChildren.removeObject(child);
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

    event.preventDefault();
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
