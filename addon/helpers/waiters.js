import { registerWaiter } from '@ember/test';

let dropStarts = 0;
/**
 * Watch for transitions to start and end before allowing ember to
 * continue the test suite. Since we can't use transitionstart reliably in
 * all browsers, but we can use transitionend, we emit our own custom
 * event that is only used in tests.
 */
registerWaiter(() => {
  return dropStarts === 0;
});
document.addEventListener('ember-sortable-drop-start', () => {
  dropStarts++;
});
document.addEventListener('ember-sortable-drop-stop', () => {
  dropStarts--;
});
