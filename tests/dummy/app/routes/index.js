import Route from '@ember/routing/route';

export default class Index extends Route {
  model() {
    return {
      items: ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco'],
    };
  }
}
