import Ember from 'ember';
import SortableItemMixin from './sortable-item';

export default Ember.Mixin.create(SortableItemMixin, {
	transformableElement: null,

	/**
    @method didInsertElement
    @override
  */
	didInsertElement() {
		this.set('transformableElement', this._checkIfTransformableElement());
		return this._super(...arguments);
	},
	
	/**
    @method freeze
    @override
  */
	freeze() {
		let transformableElement = this.get('transformableElement');
		if (!transformableElement) {
			let cells = this.$('td');
			if (!cells) { return; }

			cells.css({ transition: 'none' });
			cells.height(); // Force-apply styles
		}

		return this._super(...arguments);
	},

	/**
    @method reset
    @override
  */
	reset() {
		let transformableElement = this.get('transformableElement');
		if (!transformableElement) {
			let cells = this.$('td');
			if (!cells) { return; }

			cells.css({ transform: '' });
			cells.height(); // Force-apply styles
		}

		return this._super(...arguments);
	},

	/**
    @method thaw
    @override
  */
	thaw() {
		let transformableElement = this.get('transformableElement');
		if (!transformableElement) {
			let cells = this.$('td');
			if (!cells) { return; }

			cells.css({ transition: '' });
			cells.height(); // Force-apply styles
		}

		return this._super(...arguments);
	},

  /**
    @method _applyPosition
    @override
    @private
  */
	_applyPosition() {
		let transformableElement =  this.get('transformableElement');
		if (!transformableElement) {
			let el = this.$();
			if (!el) { return; }

			let cells = this.$('td');
			if (!cells) { return; }

			const groupDirection = this.get('group.direction');

			if (groupDirection === 'x') {
				let x = this.get('x');
				let dx = x - el.prop('offsetLeft') + parseFloat(el.css('margin-left'));

				cells.css({
					transform: `translateX(${dx}px)`
				});
			}

			if (groupDirection === 'y') {
				let y = this.get('y');
				let dy = y - el.prop('offsetTop');

				cells.css({
					transform: `translateY(${dy}px)`
				});
			}
		}

		return this._super(...arguments);
	},


  /**
    @method _checkIfTransformableElement
    @private
  */
	_checkIfTransformableElement(displayType) {
		displayType = displayType || this.$().css('display');
		
		const scenarios = [
			{ display: 'table-row', selector: 'tr' },
			{ display: 'table-cell', selector: 'td' },
			{ display: 'table-row-group', selector: 'tbody' },
			{ display: 'table-caption', selector: 'caption' },
			{ display: 'table-header-group', selector: 'thead' },
			{ display: 'table-footer-group', selector: 'tfoot' }
		];
		
		let testTable = Ember.$(
			`<table id='test-drag-support'>
				<caption></caption>
				<thead>
					<tr><th></th></tr>
				</thead>
				<tbody>
					<tr><td></td></tr>
				</tbody>
				<tfoot>
					<tr><td></td></tr>
				</tfoot>
			</table>')`
		);
		
		// insert the test table so we can perform calculations
		testTable.css({
			display: 'block',
			position: 'absolute',
			top: '-1000px'
		});
		testTable.appendTo('body');
		
		let pass = true;
		
		for (let i = 0; i < scenarios.length; ++i) {
			let scenario = scenarios[i];
			
			if (displayType.toLowerCase() === scenario.display) {
				/* Test Transformability */
				let element = testTable.find(scenario.selector).first(),
					initial = element[0].getBoundingClientRect().top, 
					transformed;
					
				element.css({ transform: 'translateY(10px)'});
				transformed = element[0].getBoundingClientRect().top;

				pass = transformed === initial + 10;
				break;
			}
		}
		
		// remove the test table
		testTable.remove();
		
		return pass;
	}
});