export default class ScrollContainer {
  constructor(element) {
    this.element = element;
    this.isWindow = element === document;
    if (this.isWindow) {
      this.top = this.scrollTop();
      this.left = this.scrollLeft();
      this.width = document.documentElement.clientWidth;
      this.height = document.documentElement.clientHeight;
      this.scrollWidth =  document.documentElement.clientWidth;
      this.scrollHeight = document.documentElement.clientHeight;
    } else {
      let { top, left } = this.element.getBoundingClientRect();
      this.top = top;
      this.left = left;
      this.width = getComputedStyle(this.element).width;
      this.height = getComputedStyle(this.element).height;
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
      this.element.scrollTop = value;
      if (this.isWindow) {
        this.top = value;
      }
      return value;
    }
    return this.element.scrollTop;
  }

  scrollLeft(value) {
    if (value) {
      value = Math.max(0, Math.min(this.maxScrollLeft, value));
      this.element.scrollLeft = value;
      if (this.isWindow) {
        this.left = value;
      }
      return value;
    }
    return this.element.scrollLeft;
  }

  $(selector) {
    let element = this.element;
    if (selector) {
      return element.querySelector(selector);
    } else {
      return element;
    }
  }
}
