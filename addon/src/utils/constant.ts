import type { A11yAnnouncementConfig } from './defaults';

export const DRAG_ACTIONS: (keyof WindowEventMap)[] = ['mousemove', 'touchmove'];
export const ELEMENT_CLICK_ACTION = 'click';
export const END_ACTIONS = ['click', 'mouseup', 'touchend'];
export const ANNOUNCEMENT_ACTION_TYPES: {
  ACTIVATE: keyof A11yAnnouncementConfig;
  MOVE: keyof A11yAnnouncementConfig;
  CONFIRM: keyof A11yAnnouncementConfig;
  CANCEL: keyof A11yAnnouncementConfig;
} = {
  ACTIVATE: 'ACTIVATE',
  MOVE: 'MOVE',
  CONFIRM: 'CONFIRM',
  CANCEL: 'CANCEL',
};
