import Route from '@ember/routing/route';

export default class Index extends Route {
  model() {
    const itemsGrid = [];
    const itemsGridGap = [];
    for (let i = 1; i <= 26; i++) {
      itemsGrid.push(`Item ${i}`);
      itemsGridGap.push(`Item ${i}`);
    }

    return {
      items: ['Zero', 'One', 'Two', 'Three', 'Four'],
      itemsGrid: itemsGrid,
      itemsGridGap: itemsGridGap,
    };
  }
}
