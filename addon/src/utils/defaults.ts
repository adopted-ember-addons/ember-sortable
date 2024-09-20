import type { TDirection } from "../modifiers/sortable-group.ts";

export interface A11yAnnouncementConfig {
  ACTIVATE: ({ a11yItemName, index, maxLength, direction }: { a11yItemName: string, index: number, maxLength: number; direction: TDirection }) => string;
  MOVE: ({ a11yItemName, index, maxLength, delta }: { a11yItemName: string, index: number, maxLength: number; delta: number }) => string,
  CONFIRM: ({ a11yItemName }: { a11yItemName: string }) => string,
  CANCEL: ({ a11yItemName }: { a11yItemName: string }) => string,
}

export const defaultA11yAnnouncementConfig: A11yAnnouncementConfig = {
  ACTIVATE({ a11yItemName, index, maxLength, direction }) {
    let message = `${a11yItemName} at position, ${index + 1} of ${maxLength}, is activated to be repositioned.`;

    if (direction === 'y') {
      message += 'Press up and down keys to change position,';
    } else {
      message += 'Press left and right keys to change position,';
    }

    message += ' Space to confirm new position, Escape to cancel.';

    return message;
  },
  MOVE({ a11yItemName, index, maxLength, delta }) {
    return `${a11yItemName} is moved to position, ${
      index + 1 + delta
    } of ${maxLength}. Press Space to confirm new position, Escape to cancel.`;
  },
  CONFIRM({ a11yItemName }) {
    return `${a11yItemName} is successfully repositioned.`;
  },
  CANCEL({ a11yItemName }) {
    return `Cancelling ${a11yItemName} repositioning`;
  },
};
