import $ from 'jquery';

export default class ScrollContainer {
  constructor(element) {
    this.element = element;
    this.isWindow = element === document;
    if (this.isWindow) {
      this.top = this.scrollTop();
      this.left = this.scrollLeft();
      this.width = $(window).width();
      this.height = $(window).height();
      this.scrollWidth = this.$().width();
      this.scrollHeight = this.$().height();
    } else {
      let { top, left } = this.$().offset();
      this.top = top;
      this.left = left;
      this.width = this.$().width();
      this.height = this.$().height();
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
      this.$().scrollTop(value);
      if (this.isWindow) {
        this.top = value;
      }
      return value;
    }
    return this.$().scrollTop();
  }

  scrollLeft(value) {
    if (value) {
      value = Math.max(0, Math.min(this.maxScrollLeft, value));
      this.$().scrollLeft(value);
      if (this.isWindow) {
        this.left = value;
      }
      return value;
    }
    return this.$().scrollLeft();
  }

  $(selector) {
    let element = this.element;
    if (selector) {
      return $(element).find(selector);
    } else {
      return $(element);
    }
  }
}
