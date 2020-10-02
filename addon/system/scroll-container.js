export default class ScrollContainer {
  constructor(element) {
    this.isWindow = element === document;
    this.element = this.isWindow ? document.documentElement : element;

    if (this.isWindow) {
      this.top = 0;
      this.left = 0;
      this.width = document.documentElement.clientWidth;
      this.height = document.documentElement.clientHeight;
    } else {
      // Absolute position in document
      let { top, left } = this.element.getBoundingClientRect();
      this.top = top;
      this.left = left;
      // Viewport size of the container element
      this.width = parseFloat(getComputedStyle(this.element).width);
      this.height = parseFloat(getComputedStyle(this.element).height);
    }
    // Total size of the container element (including scrollable part)
    this.scrollWidth = this.element.scrollWidth;
    this.scrollHeight = this.element.scrollHeight;
    // Max scroll pos
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
      return value;
    }
    return this.element.scrollTop;
  }

  scrollLeft(value) {
    if (value) {
      value = Math.max(0, Math.min(this.maxScrollLeft, value));
      this.element.scrollLeft = value;
      return value;
    }
    return this.element.scrollLeft;
  }
}
