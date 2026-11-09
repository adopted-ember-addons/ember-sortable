import Route from '@ember/routing/route';

export default class AutoScroll extends Route {
  model() {
    return {
      items: [...Array(99).keys()].map((_, idx) => `Item #${idx + 1}`),
    };
  }
}
