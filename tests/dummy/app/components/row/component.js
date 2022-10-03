import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';
import { hbs } from 'ember-cli-htmlbars';

const SortableCell = templateOnly();

setComponentTemplate(
  hbs`{{log 'rendering cell' @index}}
    <td data-test-table-conditional-cell-handle {{sortable-handle index=@index}} ...attributes>{{@index}}</td>
  `,
  SortableCell
);

const FruitCell = templateOnly();

setComponentTemplate(
  hbs`
  <td data-test-fruits>{{@record.fruit}}</td>
  `,
  FruitCell
);

const DayOfWeekCell = templateOnly();

setComponentTemplate(
  hbs`
  <td>{{@record.day}}</td>
  `,
  DayOfWeekCell
);

export default class Row extends Component {
  SortableCell = SortableCell;
  FruitCell = FruitCell;
  DayOfWeekCell = DayOfWeekCell;

  get isEven() {
    return this.args.index % 2 === 0;
  }
}
