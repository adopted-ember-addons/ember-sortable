/* eslint-disable ember/no-classic-components */
/* eslint-disable ember/require-tagless-components */
import Component from '@ember/component';

export default class ItemPresenter extends Component {
  click() {
    console.log('Item clicked'); // eslint-disable-line no-console
  }
}
