import Route from '@ember/routing/route';

export default class Index extends Route {
  model() {
    const itemsGrid = [];
    const itemsGrid2 = [];
    for (let i = 1; i <= 26; i++) {
      itemsGrid.push(`Item ${i}`);
      itemsGrid2.push(`Item ${i}`);
    }

    return {
      items: ['Zero', 'One', 'Two', 'Three', 'Four'],
      itemsGrid: itemsGrid,
      itemsGrid2: itemsGrid2,
    };
  }
}
