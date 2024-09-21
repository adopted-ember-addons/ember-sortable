const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';
const SPACE_KEY = 'Space';
const ARROW_KEYS = {
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
};
export const ENTER_KEY_CODE = 13;
export const ESCAPE_KEY_CODE = 27;
export const SPACE_KEY_CODE = 32;
export const ARROW_KEY_CODES = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

function createKeyTest(key: string, keyCode: number) {
  return function isKey(event: KeyboardEvent) {
    return event.key === key || event.keyCode === keyCode;
  };
}

export const isEnterKey = createKeyTest(ENTER_KEY, ENTER_KEY_CODE);
export const isEscapeKey = createKeyTest(ESCAPE_KEY, ESCAPE_KEY_CODE);
export const isSpaceKey = createKeyTest(SPACE_KEY, SPACE_KEY_CODE);
export const isLeftArrowKey = createKeyTest(ARROW_KEYS.LEFT, ARROW_KEY_CODES.LEFT);
export const isUpArrowKey = createKeyTest(ARROW_KEYS.UP, ARROW_KEY_CODES.UP);
export const isRightArrowKey = createKeyTest(ARROW_KEYS.RIGHT, ARROW_KEY_CODES.RIGHT);
export const isDownArrowKey = createKeyTest(ARROW_KEYS.DOWN, ARROW_KEY_CODES.DOWN);
