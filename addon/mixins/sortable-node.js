import Ember from 'ember';
import Manager from '../utils/manager';

const { A, Mixin, computed } = Ember;

/**
  @class SortableNode
  @constructor
*/
export default Mixin.create({

  classNameBindings: ['sortableStateClass'],

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
    @property sortableState
    @type null|String
    @default null
  */
  sortableState: null,

  /**
    @property sortableStateClass
    @type null|String
  */
  sortableStateClass: computed('sortableState', function() {
    let state = this.get('sortableState');

    if (state) {
      return 'sortable-' + state;
    }
  }),

  /**
    @method init
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
    @method touchStart
    @param {jQuery.Event} event
  */
  touchStart(event) {
    this._super(...arguments);

    event.stopPropagation();

    this.startSorting(event);
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

    this.startSorting(event);
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
    @private
    @method startSorting
    @param {jQuery.Event} event
  */
  startSorting({ originalEvent }) {
    if (this._sortableManager) { return; }

    this._sortableManager = new Manager({
      node: this,
      onComplete: (...args) => this.completeSorting(...args),
      onCancel: (...args) => this.cancelSorting(...args)
    });

    this._sortableManager.start(originalEvent);
  },

  /**
    @private
    @method completeSorting
    @param {SortableNode} receiver
    @param {Number} position
  */
  completeSorting(receiver, position) {
    delete this._sortableManager;

    if (!receiver) { return; }

    let model = this.sortableModel;
    let oldParent = this.sortableParent.sortableModel;
    let newParent = receiver.sortableModel;

    this.sendAction('onMove', model, { oldParent, newParent, position });
  },

  /**
    @private
    @method cancelSorting
  */
  cancelSorting() {
    delete this._sortableManager;
  }

});
