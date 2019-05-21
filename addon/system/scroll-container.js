export default class ScrollContainer {
  constructor(element) {
    this.element = element;
    this.isWindow = element === document;
    if (this.isWindow) {
      this.top = this.scrollTop();
      this.left = this.scrollLeft();
      this.width = window.offsetWidth;
      this.height = window.offsetHeight;
      this.scrollWidth = this.selector().offsetWidth;
      this.scrollHeight = this.selector().offsetHeight;
    } else {
      let { top, left } = element.getBoundingClientRect();
      this.top = top;
      this.left = left;
      this.width = this.selector().offsetWidth;
      this.height = this.selector().offsetHeight;
      this.scrollWidth = element.scrollWidth;
      this.scrollHeight = element.scrollHeight;
    }
    this.maxScrollTop = this.scrollHeight - this.height;
    this.maxScrollLeft = this.scrollWidth - this.width;
  }

  get bottom() {
    return this.top + this.height;
  }

  get right() {
    return this.left + this.width;
  }

  scrollTop(value) {
    if (value) {
      value = Math.max(0, Math.min(this.maxScrollTop, value));
      window.scrollTop = value;
      if (this.isWindow) {
        this.top = value;
      }
      return value;
    }
    return this.selector().scrollTop;
  }

  scrollLeft(value) {
    if (value) {
      value = Math.max(0, Math.min(this.maxScrollLeft, value));
      this.selector().scrollLeft = value;
      if (this.isWindow) {
        this.left = value;
      }
      return value;
    }
    return this.selector().scrollLeft;
  }

  selector(selector) {
    let element = this.element;
    if (selector) {
      return element.querySelectorAll(selector);
    } else {
      return element;
    }
  }
}
