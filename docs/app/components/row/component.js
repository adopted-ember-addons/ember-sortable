import Component from '@glimmer/component';

export default class Row extends Component {
  get isEven() {
    return this.args.index % 2 === 0;
  }
}
